/**
 * POST /api/inbound-email
 * Resend Inbound Webhook Handler (Optimized Production Version)
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ───────────────────────────────────────────── */
/* Helpers */
/* ───────────────────────────────────────────── */

function extractTicketId(subject) {
  if (!subject) return null;
  const m = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return m ? m[1].toUpperCase() : null;
}

function extractFromEmail(from) {
  if (!from) return "";

  if (typeof from === "string") {
    const m = from.match(/<([^>]+)>/);
    return (m ? m[1] : from).toLowerCase();
  }

  if (Array.isArray(from) && from[0]) {
    return (from[0].address || from[0].email || "").toLowerCase();
  }

  return (from.address || from.email || "").toLowerCase();
}

function stripHtml(html) {
  if (!html) return "";

  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function cleanReply(content) {
  if (!content) return "";

  // Remove Gmail quoted reply section
  const splitOn = content.split(/\nOn .* wrote:/);
  content = splitOn[0];

  // Remove lines starting with >
  content = content
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n");

  return content.trim();
}

function verifySignature(rawBody, headers, secret) {
  const id = headers["svix-id"];
  const ts = headers["svix-timestamp"];
  const sig = headers["svix-signature"];

  if (!id || !ts || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(ts, 10)) > 300) return false;

  const signedPayload = `${id}.${ts}.${rawBody}`;
  const key = Buffer.from(secret.split("_").pop(), "base64");

  const expected = crypto
    .createHmac("sha256", key)
    .update(signedPayload)
    .digest("base64");

  return sig.split(" ").some((s) => s.split(",").pop() === expected);
}

/* ───────────────────────────────────────────── */
/* Handler */
/* ───────────────────────────────────────────── */

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[inbound] Missing Supabase config");
    return res.status(200).json({ error: "Server misconfigured" });
  }

  const body = req.body || {};
  const rawBody = JSON.stringify(body);

  console.log("[inbound] Event type:", body.type);

  /* ───────── Signature Verification ───────── */

  if (RESEND_WEBHOOK_SECRET) {
    const valid = verifySignature(rawBody, req.headers, RESEND_WEBHOOK_SECRET);
    if (!valid) {
      console.error("[inbound] Invalid signature");
      return res.status(200).json({ error: "Invalid signature" });
    }
  }

  if (body.type !== "email.received") {
    return res.status(200).json({ skipped: true });
  }

  const data = body.data || {};
  const fromEmail = extractFromEmail(data.from);
  const subject = data.subject || "";
  const emailId = data.email_id || "";

  console.log("[inbound] From:", fromEmail);
  console.log("[inbound] Subject:", subject);

  /* ───────── Body Extraction ───────── */

  let text = data.text || data.plain_text || "";
  let html = data.html || "";

  // Resend API fallback
  if (!text && !html && emailId && RESEND_API_KEY) {
    try {
      const resp = await fetch(`https://api.resend.com/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      });

      if (resp.ok) {
        const json = await resp.json();
        text = json.text || json.plain_text || "";
        html = json.html || "";
      }
    } catch (e) {
      console.error("[inbound] Resend API fallback failed");
    }
  }

  let messageBody = text || stripHtml(html) || "";
  messageBody = cleanReply(messageBody);

  if (!messageBody) {
    messageBody = "[User replied via email — body unavailable]";
  }

  console.log("[inbound] Cleaned body:", messageBody.slice(0, 150));

  /* ───────── Supabase Init ───────── */

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  /* ───────── Match Conversation ───────── */

  const ticketId = extractTicketId(subject);
  let message = null;

  if (ticketId) {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .limit(1);

    if (data?.length) message = data[0];
  }

  if (!message && fromEmail) {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .ilike("email", fromEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data?.length) message = data[0];
  }

  if (!message) {
    console.log("[inbound] No matching conversation found");
    return res.status(200).json({ unmatched: true });
  }

  /* ───────── Prevent Duplicate Insert ───────── */

  const { data: existing } = await supabase
    .from("replies")
    .select("id")
    .eq("message_id", message.id)
    .eq("reply_text", messageBody)
    .limit(1);

  if (existing?.length) {
    console.log("[inbound] Duplicate reply ignored");
    return res.status(200).json({ duplicate: true });
  }

  /* ───────── Save Reply ───────── */

  const { error: insertError } = await supabase.from("replies").insert({
    message_id: message.id,
    sender_type: "user",
    reply_text: messageBody,
  });

  if (insertError) {
    console.error("[inbound] Reply insert failed:", insertError);
    return res.status(200).json({ db_error: true });
  }

  await supabase
    .from("contact_messages")
    .update({
      status: "user_replied",
      updated_at: new Date().toISOString(),
    })
    .eq("id", message.id);

  console.log("[inbound] SUCCESS");

  return res.status(200).json({
    success: true,
    messageId: message.id,
    ticketId: message.ticket_id,
  });
};
