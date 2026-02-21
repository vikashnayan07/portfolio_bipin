/**
 * Vercel Serverless Function — POST /api/inbound-email
 *
 * Resend Inbound Webhook Handler:
 * 1. Receives inbound email forwarded by Resend webhook
 * 2. Extracts ticket ID from email subject (pattern: [TKT-XXXXXXXX])
 * 3. Saves user reply to the `replies` table
 * 4. Updates contact_messages status to 'user_replied'
 *
 * Environment variables required:
 *   RESEND_WEBHOOK_SECRET   — Resend webhook signing secret
 *   SUPABASE_URL            — Supabase project URL
 *   SUPABASE_SERVICE_KEY    — Supabase service_role key
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ── Helpers ───────────────────────────────────────────── */

/**
 * Extract ticket ID from email subject line
 * Matches patterns like: Re: Some Subject [TKT-ABC12345]
 */
function extractTicketId(subject) {
  if (!subject) return null;
  const match = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Strip HTML tags and extract plain text from email body
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract the user's actual reply, stripping quoted content
 * Looks for common email reply separators
 */
function extractReplyBody(text) {
  if (!text) return "";

  // Common reply separators
  const separators = [
    /^>+ .*/m, // Quoted lines starting with >
    /^On .+ wrote:$/m, // "On ... wrote:"
    /^-{3,}\s*Original Message\s*-{3,}/im, // --- Original Message ---
    /^From: .+$/m, // From: header in quoted
    /^Sent: .+$/m, // Sent: header
    /^_{3,}/m, // ___ separator
  ];

  let cleanText = text;
  for (const sep of separators) {
    const idx = cleanText.search(sep);
    if (idx > 0) {
      cleanText = cleanText.substring(0, idx);
      break;
    }
  }

  return cleanText.trim();
}

/**
 * Verify Resend webhook signature (svix)
 */
function verifyWebhookSignature(payload, headers, secret) {
  if (!secret) return true; // Skip if no secret configured

  const svixId = headers["svix-id"];
  const svixTimestamp = headers["svix-timestamp"];
  const svixSignature = headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  // Check timestamp (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (Math.abs(now - ts) > 300) {
    return false;
  }

  // Compute expected signature
  const toSign = `${svixId}.${svixTimestamp}.${typeof payload === "string" ? payload : JSON.stringify(payload)}`;
  const secretBytes = Buffer.from(secret.split("_").pop(), "base64");
  const expectedSig = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  // Check against provided signatures (can be multiple, space-separated)
  const signatures = svixSignature.split(" ");
  return signatures.some((sig) => {
    const sigValue = sig.split(",").pop();
    return sigValue === expectedSig;
  });
}

/* ── Main Handler ──────────────────────────────────────── */
module.exports = async function handler(req, res) {
  /* ── Handle CORS preflight ── */
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, svix-id, svix-timestamp, svix-signature");
    return res.status(200).end();
  }

  /* ── Only allow POST ── */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ── Prevent any redirect — respond immediately with JSON headers ── */
  res.setHeader("Content-Type", "application/json");

  /* ── Validate env vars ── */
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_WEBHOOK_SECRET } =
    process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  /* ── Verify webhook signature ── */
  if (RESEND_WEBHOOK_SECRET) {
    const isValid = verifyWebhookSignature(
      req.body,
      req.headers,
      RESEND_WEBHOOK_SECRET,
    );
    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  try {
    const event = req.body;

    // Resend sends events with a "type" field
    // For inbound emails, the type is "email.received"
    if (event.type && event.type !== "email.received") {
      // Acknowledge non-inbound events silently
      return res.status(200).json({ received: true, skipped: event.type });
    }

    // Extract email data — Resend puts it in event.data
    const emailData = event.data || event;
    const fromEmail = emailData.from?.[0]?.address || emailData.from || "";
    const subject = emailData.subject || "";
    const htmlBody = emailData.html || emailData.body || "";
    const textBody = emailData.text || stripHtml(htmlBody);

    if (!fromEmail || !textBody) {
      console.error("Missing email data:", {
        fromEmail: !!fromEmail,
        textBody: !!textBody,
      });
      return res.status(400).json({ error: "Missing email data" });
    }

    /* ── Extract ticket ID from subject ── */
    const ticketId = extractTicketId(subject);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    /* ── Find the original message ── */
    let message = null;

    if (ticketId) {
      // Primary: match by ticket ID
      const { data } = await supabase
        .from("contact_messages")
        .select("id, email, name, ticket_id")
        .eq("ticket_id", ticketId)
        .single();
      message = data;
    }

    if (!message) {
      // Fallback: match by sender email (most recent non-deleted message)
      const { data } = await supabase
        .from("contact_messages")
        .select("id, email, name, ticket_id")
        .ilike("email", fromEmail)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      message = data;
    }

    if (!message) {
      console.log("No matching message found for:", { fromEmail, ticketId });
      // Still return 200 to prevent Resend from retrying
      return res
        .status(200)
        .json({
          received: true,
          matched: false,
          reason: "No matching conversation",
        });
    }

    /* ── Extract clean reply text ── */
    const replyBody = extractReplyBody(textBody);

    if (!replyBody || replyBody.length < 2) {
      return res
        .status(200)
        .json({ received: true, matched: true, skipped: "Empty reply body" });
    }

    /* ── Deduplicate: check if this exact reply was already saved (within 60s) ── */
    const { data: existingReplies } = await supabase
      .from("replies")
      .select("id")
      .eq("message_id", message.id)
      .eq("sender_type", "user")
      .eq("reply_text", replyBody)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (existingReplies && existingReplies.length > 0) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    /* ── Save user reply to replies table ── */
    const { error: insertError } = await supabase.from("replies").insert({
      message_id: message.id,
      sender_type: "user",
      reply_text: replyBody,
    });

    if (insertError) {
      console.error("Failed to insert reply:", insertError);
      return res.status(500).json({ error: "Failed to save reply" });
    }

    /* ── Update message status to user_replied ── */
    await supabase
      .from("contact_messages")
      .update({ status: "user_replied" })
      .eq("id", message.id);

    console.log("Inbound email processed:", {
      ticketId,
      messageId: message.id,
      from: fromEmail,
    });

    return res.status(200).json({
      success: true,
      message: "User reply saved",
      messageId: message.id,
      ticketId: message.ticket_id,
    });
  } catch (err) {
    console.error("Inbound email error:", err);
    // Return 200 to prevent Resend from retrying on our errors
    return res.status(200).json({ error: "Internal error", received: true });
  }
};
