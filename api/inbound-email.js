/**
 * POST /api/inbound-email
 * FINAL PRODUCTION STABLE VERSION
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ───────────── HELPERS ───────────── */

function extractTicketId(subject) {
  if (!subject) return null;
  const match = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return match ? match[1].toUpperCase() : null;
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

  content = content.split(/\nOn .* wrote:/)[0];

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

/* ───────────── HANDLER ───────────── */

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_WEBHOOK_SECRET } =
    process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Supabase not configured");
    return res.status(200).json({ error: "Server misconfigured" });
  }

  const body = req.body || {};
  const rawBody = JSON.stringify(body);

  /* ───────── SIGNATURE VERIFY ───────── */

  if (RESEND_WEBHOOK_SECRET) {
    const valid = verifySignature(rawBody, req.headers, RESEND_WEBHOOK_SECRET);
    if (!valid) {
      console.error("Invalid webhook signature");
      return res.status(200).json({ error: "Invalid signature" });
    }
  }

  if (body.type !== "email.received") {
    return res.status(200).json({ skipped: true });
  }

  const data = body.data || {};
  const fromEmail = extractFromEmail(data.from);
  const subject = data.subject || "";

  console.log("Inbound from:", fromEmail);
  console.log("Subject:", subject);

  /* ───────── BODY EXTRACTION ───────── */

  let messageBody = "";

  // 1️⃣ direct text
  if (data.text) {
    messageBody = data.text;
  }

  // 2️⃣ html
  else if (data.html) {
    messageBody = stripHtml(data.html);
  }

  // 3️⃣ raw MIME body (important for Gmail)
  else if (data.raw) {
    const parts = data.raw.split("\r\n\r\n");
    if (parts.length > 1) {
      messageBody = parts.slice(1).join("\n");
    }
  }

  messageBody = cleanReply(messageBody);

  if (!messageBody) {
    messageBody = "[Body could not be extracted]";
  }

  console.log("Final body:", messageBody.slice(0, 200));

  /* ───────── INIT SUPABASE (FIXED) ───────── */

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  /* ───────── MATCH MESSAGE ───────── */

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
    console.log("No conversation match");
    return res.status(200).json({ unmatched: true });
  }

  /* ───────── DUPLICATE PREVENTION ───────── */

  const { data: existing } = await supabase
    .from("replies")
    .select("id")
    .eq("message_id", message.id)
    .eq("reply_text", messageBody)
    .limit(1);

  if (existing?.length) {
    console.log("Duplicate ignored");
    return res.status(200).json({ duplicate: true });
  }

  /* ───────── SAVE REPLY ───────── */

  const { error } = await supabase.from("replies").insert({
    message_id: message.id,
    sender_type: "user",
    reply_text: messageBody,
  });

  if (error) {
    console.error("Reply insert failed:", error);
    return res.status(200).json({ db_error: true });
  }

  await supabase
    .from("contact_messages")
    .update({
      status: "user_replied",
      updated_at: new Date().toISOString(),
    })
    .eq("id", message.id);

  console.log("Inbound SUCCESS");

  return res.status(200).json({
    success: true,
    ticketId: message.ticket_id,
  });
};
