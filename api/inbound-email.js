/**
 * POST /api/inbound-email
 * Resend Inbound Webhook Handler (Vercel Compatible)
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

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
    return m ? m[1].toLowerCase() : from.toLowerCase();
  }
  if (Array.isArray(from) && from[0]) {
    return (from[0].address || from[0].email || "").toLowerCase();
  }
  return (from.address || from.email || "").toLowerCase();
}

function stripHtml(html) {
  return (
    html
      ?.replace(/<[^>]+>/g, "")
      ?.replace(/\s+/g, " ")
      ?.trim() || ""
  );
}

function verifySignature(rawBody, headers, secret) {
  const id = headers["svix-id"];
  const ts = headers["svix-timestamp"];
  const sig = headers["svix-signature"];

  if (!id || !ts || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(ts, 10)) > 300) return false;

  const signed = `${id}.${ts}.${rawBody}`;
  const key = Buffer.from(secret.split("_").pop(), "base64");

  const expected = crypto
    .createHmac("sha256", key)
    .update(signed)
    .digest("base64");

  return sig.split(" ").some((s) => s.split(",").pop() === expected);
}

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
    return res.status(200).json({ error: "Missing Supabase config" });
  }

  /* ───────── RAW BODY CAPTURE (CRITICAL FIX) ───────── */

  const rawBody = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

  let body = {};
  try {
    body = JSON.parse(rawBody);
  } catch (e) {}

  console.log("[inbound] Event type:", body.type);

  /* ───────── SIGNATURE VERIFY ───────── */

  if (RESEND_WEBHOOK_SECRET) {
    const valid = verifySignature(rawBody, req.headers, RESEND_WEBHOOK_SECRET);

    if (!valid) {
      console.error("[inbound] Signature verification failed");
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

  /* ───────── BODY EXTRACTION ───────── */

  let text = data.text || data.plain_text || "";
  let html = data.html || "";

  // Fallback → fetch from Resend API
  if (!text && !html && emailId && RESEND_API_KEY) {
    try {
      const resp = await fetch(`https://api.resend.com/emails/${emailId}`, {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
      });

      if (resp.ok) {
        const json = await resp.json();
        text = json.text || json.plain_text || "";
        html = json.html || "";
      }
    } catch (e) {
      console.log("[inbound] API fetch failed");
    }
  }

  let messageBody = text || stripHtml(html) || "";

  if (!messageBody) {
    messageBody = "[User replied via email — body unavailable]";
  }

  console.log("[inbound] Body preview:", messageBody.slice(0, 80));

  /* ───────── MATCH CONVERSATION ───────── */

  const ticketId = extractTicketId(subject);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let message = null;

  if (ticketId) {
    const { data: found } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .single();
    message = found;
  }

  if (!message) {
    const { data: found } = await supabase
      .from("contact_messages")
      .select("*")
      .ilike("email", fromEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    message = found;
  }

  if (!message) {
    return res.status(200).json({ unmatched: true });
  }

  /* ───────── SAVE REPLY ───────── */

  await supabase.from("replies").insert({
    message_id: message.id,
    sender_type: "user",
    reply_text: messageBody,
  });

  await supabase
    .from("contact_messages")
    .update({ status: "user_replied" })
    .eq("id", message.id);

  console.log("[inbound] SUCCESS");

  return res.status(200).json({
    success: true,
    messageId: message.id,
    ticketId: message.ticket_id,
  });
};
