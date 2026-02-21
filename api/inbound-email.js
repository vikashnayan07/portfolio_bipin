/**
 * Vercel Serverless Function — POST /api/inbound-email
 *
 * Resend Inbound Webhook Handler
 * Receives email.received events and saves user replies to Supabase.
 *
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_WEBHOOK_SECRET (optional)
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ── Extract ticket ID from subject: [TKT-XXXXXXXX] ── */
function extractTicketId(subject) {
  if (!subject) return null;
  const match = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return match ? match[1].toUpperCase() : null;
}

/* ── Strip HTML to plain text ── */
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

/* ── Extract reply body, strip quoted content ── */
function extractReplyBody(text) {
  if (!text) return "";
  const separators = [
    /^>+ .*/m,
    /^On .+ wrote:$/m,
    /^-{3,}\s*Original Message\s*-{3,}/im,
    /^From: .+$/m,
    /^Sent: .+$/m,
    /^_{3,}/m,
  ];
  let clean = text;
  for (const sep of separators) {
    const idx = clean.search(sep);
    if (idx > 0) {
      clean = clean.substring(0, idx);
      break;
    }
  }
  return clean.trim();
}

/* ── Extract sender email from various Resend formats ── */
function extractFromEmail(from) {
  if (!from) return "";
  // String: "user@example.com" or "Name <user@example.com>"
  if (typeof from === "string") {
    const angleMatch = from.match(/<([^>]+)>/);
    if (angleMatch) return angleMatch[1].toLowerCase();
    if (from.includes("@")) return from.trim().toLowerCase();
    return "";
  }
  // Array: [{ address: "...", name: "..." }] or ["user@example.com"]
  if (Array.isArray(from) && from.length > 0) {
    const first = from[0];
    if (typeof first === "string") return first.toLowerCase();
    if (first && first.address) return first.address.toLowerCase();
    if (first && first.email) return first.email.toLowerCase();
  }
  // Object: { address: "..." }
  if (from.address) return from.address.toLowerCase();
  if (from.email) return from.email.toLowerCase();
  return "";
}

/* ── Verify Resend webhook signature (svix) ── */
function verifySignature(rawBody, headers, secret) {
  if (!secret) return true;
  const svixId = headers["svix-id"];
  const svixTimestamp = headers["svix-timestamp"];
  const svixSignature = headers["svix-signature"];
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (Math.abs(now - ts) > 300) return false;

  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(secret.split("_").pop(), "base64");
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  return svixSignature.split(" ").some((sig) => {
    const val = sig.split(",").pop();
    return val === expected;
  });
}

/* ══════════════════════════════════════════════════════════
   HANDLER — Returns JSON, never redirects
   ══════════════════════════════════════════════════════════ */
module.exports = async function handler(req, res) {
  // Immediately set response headers to prevent any redirect
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(200).json({ ok: true });
  }

  // Health check via GET (lets you test in browser)
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      endpoint: "inbound-email webhook",
      method: "POST required for webhook events",
    });
  }

  // Only POST from here
  if (req.method !== "POST") {
    return res.status(200).json({ error: "Use POST", received: true });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_WEBHOOK_SECRET } =
    process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[inbound-email] Missing SUPABASE env vars");
    return res.status(200).json({ error: "Config error", received: true });
  }

  // Log incoming request for debugging
  console.log("[inbound-email] Received webhook:", {
    method: req.method,
    contentType: req.headers["content-type"],
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
  });

  try {
    const body = req.body || {};

    // Verify signature if secret is configured
    if (RESEND_WEBHOOK_SECRET) {
      const rawBody =
        typeof body === "string" ? body : JSON.stringify(body);
      const valid = verifySignature(rawBody, req.headers, RESEND_WEBHOOK_SECRET);
      if (!valid) {
        console.error("[inbound-email] Signature verification failed");
        // Return 200 to stop retries — log for debugging
        return res
          .status(200)
          .json({ error: "Signature mismatch", received: true });
      }
    }

    // Skip non-inbound events
    if (body.type && body.type !== "email.received") {
      return res.status(200).json({ received: true, skipped: body.type });
    }

    // Extract email data from Resend payload
    const data = body.data || body;
    const fromEmail = extractFromEmail(data.from);
    const subject = data.subject || "";
    const emailId = data.email_id || "";

    // The webhook payload does NOT include the email body.
    // We must fetch it from the Resend API using the email_id.
    let textBody = data.text || "";
    let htmlBody = data.html || data.body || "";

    if (!textBody && !htmlBody && emailId && process.env.RESEND_API_KEY) {
      console.log("[inbound-email] Fetching email body from Resend API:", emailId);
      try {
        const fetchRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        });
        if (fetchRes.ok) {
          const emailData = await fetchRes.json();
          textBody = emailData.text || "";
          htmlBody = emailData.html || emailData.body || "";
          console.log("[inbound-email] Fetched email body:", {
            hasText: !!textBody,
            textLen: textBody.length,
            hasHtml: !!htmlBody,
          });
        } else {
          console.error("[inbound-email] Resend API fetch failed:", fetchRes.status, await fetchRes.text());
        }
      } catch (fetchErr) {
        console.error("[inbound-email] Resend API fetch error:", fetchErr.message);
      }
    }

    const plainText = textBody || stripHtml(htmlBody);

    console.log("[inbound-email] Parsed:", {
      from: fromEmail,
      subject,
      hasText: !!textBody,
      hasHtml: !!htmlBody,
      textLen: plainText.length,
    });

    if (!fromEmail) {
      return res
        .status(200)
        .json({ received: true, error: "No sender email" });
    }

    // Extract ticket ID
    const ticketId = extractTicketId(subject);
    console.log("[inbound-email] Ticket:", ticketId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Find matching message — ticket ID first, then email fallback
    let message = null;

    if (ticketId) {
      const { data: found } = await supabase
        .from("contact_messages")
        .select("id, email, name, ticket_id")
        .eq("ticket_id", ticketId)
        .single();
      message = found;
    }

    if (!message) {
      const { data: found } = await supabase
        .from("contact_messages")
        .select("id, email, name, ticket_id")
        .ilike("email", fromEmail)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      message = found;
    }

    if (!message) {
      console.log("[inbound-email] No match for:", fromEmail, ticketId);
      return res.status(200).json({
        received: true,
        matched: false,
        reason: "No matching conversation",
      });
    }

    // Extract clean reply
    let replyBody = extractReplyBody(plainText);

    // Fallback: use subject if body empty
    if (!replyBody || replyBody.length < 2) {
      if (subject) {
        replyBody = subject
          .replace(/^Re:\s*/i, "")
          .replace(/\[TKT-[^\]]+\]/g, "")
          .trim();
      }
      if (!replyBody || replyBody.length < 2) {
        replyBody = "[User replied via email]";
      }
    }

    // Deduplicate within 60s
    const { data: dupes } = await supabase
      .from("replies")
      .select("id")
      .eq("message_id", message.id)
      .eq("sender_type", "user")
      .eq("reply_text", replyBody)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (dupes && dupes.length > 0) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // Insert reply into replies table
    const { error: insertErr } = await supabase.from("replies").insert({
      message_id: message.id,
      sender_type: "user",
      reply_text: replyBody,
    });

    if (insertErr) {
      console.error("[inbound-email] Insert error:", insertErr);
      return res
        .status(200)
        .json({ error: "DB insert failed", received: true });
    }

    // Update message status to user_replied
    await supabase
      .from("contact_messages")
      .update({ status: "user_replied" })
      .eq("id", message.id);

    console.log("[inbound-email] SUCCESS:", {
      messageId: message.id,
      ticketId: message.ticket_id,
      from: fromEmail,
      replyLen: replyBody.length,
    });

    return res.status(200).json({
      success: true,
      messageId: message.id,
      ticketId: message.ticket_id,
    });
  } catch (err) {
    console.error("[inbound-email] Error:", err);
    return res.status(200).json({ error: "Internal error", received: true });
  }
};
