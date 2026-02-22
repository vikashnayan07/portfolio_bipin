/**
 * Vercel Serverless Function — POST /api/inbound-email
 *
 * Resend Inbound Webhook Handler
 * Receives email.received events and saves user replies to Supabase.
 *
 * IMPORTANT: For the webhook to include email body (text/html), the domain's
 * MX record MUST point to: inbound.resend.com (priority 10)
 * Without this, Resend only sends metadata (from, to, subject) — no body.
 *
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, RESEND_WEBHOOK_SECRET (optional)
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ── Helpers ─────────────────────────────────────────────── */

function extractTicketId(subject) {
  if (!subject) return null;
  const m = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return m ? m[1].toUpperCase() : null;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractReplyBody(text) {
  if (!text) return "";
  const separators = [
    /^>+ .*/m,
    /^On .+ wrote:$/m,
    /^-{3,}\s*Original Message\s*-{3,}/im,
    /^From: .+$/m,
    /^Sent: .+$/m,
    /^_{3,}/m,
    /^[-]+\s*Forwarded message/im,
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

function extractFromEmail(from) {
  if (!from) return "";
  if (typeof from === "string") {
    const m = from.match(/<([^>]+)>/);
    if (m) return m[1].toLowerCase();
    if (from.includes("@")) return from.trim().toLowerCase();
    return "";
  }
  if (Array.isArray(from) && from.length > 0) {
    const f = from[0];
    if (typeof f === "string") return f.toLowerCase();
    return (f.address || f.email || "").toLowerCase();
  }
  return (from.address || from.email || "").toLowerCase();
}

function extractSenderName(from) {
  if (!from) return "";
  if (typeof from === "string") {
    const m = from.match(/^([^<]+)</);
    return m ? m[1].trim() : "";
  }
  if (Array.isArray(from) && from.length > 0) {
    const f = from[0];
    if (typeof f === "object") return f.name || "";
  }
  if (typeof from === "object") return from.name || "";
  return "";
}

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
  return svixSignature
    .split(" ")
    .some((sig) => sig.split(",").pop() === expected);
}

/* ── Fetch email body from Resend API ────────────────────
 * Tries multiple Resend API endpoints to retrieve email content.
 * Works as fallback when webhook payload doesn't include body.
 */
async function fetchBodyFromResendAPI(emailId, apiKey) {
  if (!emailId || !apiKey) return { text: "", html: "" };

  const endpoints = [
    `https://api.resend.com/emails/${emailId}`,
  ];

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`[inbound-email] API ${url} → ${resp.status}`);

      if (resp.ok) {
        const json = await resp.json();
        const text = json.text || json.plain_text || json.body_text || "";
        const html = json.html || json.html_body || json.body || json.content || "";
        if (text || html) {
          console.log("[inbound-email] Body fetched from API:", {
            hasText: !!text,
            hasHtml: !!html,
            textLen: text.length,
          });
          return { text, html };
        }
      }
    } catch (err) {
      console.log(`[inbound-email] API fetch error: ${err.message}`);
    }
  }

  return { text: "", html: "" };
}

/* ── Extract body from webhook payload ───────────────────
 * Searches through all possible field locations in the payload.
 */
function extractBodyFromPayload(body, data) {
  // 1. Direct top-level fields (standard Resend inbound payload)
  let text = data.text || data.plain_text || data.plain_body || data.body_text || "";
  let html = data.html || data.html_body || data.body_html || data.body || data.content || "";

  if (text || html) {
    console.log("[inbound-email] ✓ Body found in direct data fields");
    return { text, html };
  }

  // 2. Nested objects (data.email, data.payload, etc.)
  const nestedKeys = ["email", "payload", "message", "record", "raw"];
  for (const key of nestedKeys) {
    const nested = data[key];
    if (nested && typeof nested === "object") {
      text = nested.text || nested.plain_text || nested.body_text || "";
      html = nested.html || nested.html_body || nested.body || nested.content || "";
      if (text || html) {
        console.log(`[inbound-email] ✓ Body found in data.${key}`);
        return { text, html };
      }
    }
  }

  // 3. Check body-level fields (some webhooks put data at root)
  text = body.text || body.plain_text || "";
  html = body.html || body.html_body || "";
  if (text || html) {
    console.log("[inbound-email] ✓ Body found in root-level fields");
    return { text, html };
  }

  // 4. Attachments — email body sometimes comes as text/plain or text/html attachment
  const attachments = data.attachments || data.files || body.attachments || [];
  if (Array.isArray(attachments)) {
    for (const att of attachments) {
      const contentType = (att.content_type || att.contentType || att.type || "").toLowerCase();
      const content = att.content || att.data || att.body || "";
      if (!content) continue;

      // Decode base64 if needed
      let decoded = content;
      if (typeof content === "string" && content.length > 20) {
        const clean = content.replace(/[\s\r\n]/g, "");
        if (/^[A-Za-z0-9+/]+=*$/.test(clean)) {
          try {
            decoded = Buffer.from(content, "base64").toString("utf-8");
          } catch (_) {
            decoded = content;
          }
        }
      }

      if (contentType.includes("text/plain") && !text) text = decoded;
      if (contentType.includes("text/html") && !html) html = decoded;
    }
    if (text || html) {
      console.log("[inbound-email] ✓ Body found in attachments");
      return { text, html };
    }
  }

  // 5. Deep search — last resort recursive scan
  const textFields = ["text", "plain_text", "body_text", "plain_body", "textBody"];
  const htmlFields = ["html", "html_body", "body_html", "htmlBody"];

  function deepFind(obj, fields, depth) {
    if (depth > 4 || !obj || typeof obj !== "object") return "";
    for (const f of fields) {
      if (obj[f] && typeof obj[f] === "string" && obj[f].trim().length > 5) return obj[f];
    }
    for (const k of Object.keys(obj)) {
      if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
        const found = deepFind(obj[k], fields, depth + 1);
        if (found) return found;
      }
    }
    return "";
  }

  text = deepFind(body, textFields, 0);
  html = deepFind(body, htmlFields, 0);
  if (text || html) {
    console.log("[inbound-email] ✓ Body found via deep search");
    return { text, html };
  }

  return { text: "", html: "" };
}

/* ══════════════════════════════════════════════════════════
   HANDLER
   ══════════════════════════════════════════════════════════ */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      endpoint: "inbound-email webhook",
      note: "POST required for webhook events",
    });
  }

  if (req.method !== "POST") {
    return res.status(200).json({ error: "Use POST", received: true });
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[inbound-email] ✗ Missing SUPABASE env vars");
    return res.status(200).json({ error: "Config error", received: true });
  }

  try {
    /* ── Parse body ── */
    let body = req.body || {};
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (_) {}
    }
    if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString("utf-8")); } catch (_) { body = {}; }
    }

    console.log("[inbound-email] ─── Webhook received ───");
    console.log("[inbound-email] Type:", body.type);
    console.log("[inbound-email] Body keys:", Object.keys(body));

    /* ── Signature verification ── */
    if (RESEND_WEBHOOK_SECRET) {
      const rawBody = typeof body === "string" ? body : JSON.stringify(body);
      if (!verifySignature(rawBody, req.headers, RESEND_WEBHOOK_SECRET)) {
        console.error("[inbound-email] ✗ Signature verification failed");
        return res.status(200).json({ error: "Signature mismatch", received: true });
      }
    }

    /* ── Skip non-inbound events ── */
    if (body.type && body.type !== "email.received") {
      console.log("[inbound-email] Skipping event:", body.type);
      return res.status(200).json({ received: true, skipped: body.type });
    }

    /* ── Extract metadata ── */
    const data = body.data || body;
    const fromEmail = extractFromEmail(data.from);
    const senderName = extractSenderName(data.from);
    const subject = data.subject || "";
    const emailId = data.email_id || "";

    // Log full payload for debugging
    const payloadStr = JSON.stringify(body);
    console.log("[inbound-email] FULL PAYLOAD (" + payloadStr.length + " chars):");
    console.log(payloadStr.substring(0, 3000));
    console.log("[inbound-email] Data keys:", Object.keys(data));
    console.log("[inbound-email] From:", fromEmail, "| Subject:", subject);
    console.log("[inbound-email] Email ID:", emailId);

    // Log field presence explicitly
    const fieldCheck = ["text", "html", "body", "content", "plain_text", "html_body"];
    for (const f of fieldCheck) {
      if (f in data) {
        console.log(`[inbound-email] data.${f} = (${typeof data[f]}) len=${String(data[f] || "").length}`);
      }
    }

    /* ══════════════════════════════════════════════════════
       BODY EXTRACTION — 3-tier approach
       ══════════════════════════════════════════════════════ */

    // Tier 1: Extract from webhook payload
    let { text: textBody, html: htmlBody } = extractBodyFromPayload(body, data);

    // Tier 2: Fetch from Resend API (if payload didn't have body)
    if (!textBody && !htmlBody && emailId && RESEND_API_KEY) {
      console.log("[inbound-email] No body in payload → fetching from Resend API...");
      const apiResult = await fetchBodyFromResendAPI(emailId, RESEND_API_KEY);
      textBody = apiResult.text;
      htmlBody = apiResult.html;
    }

    // Tier 3: Log cause + proceed with fallback
    if (!textBody && !htmlBody) {
      console.error("[inbound-email] ✗ NO EMAIL BODY found anywhere!");
      console.error("[inbound-email] ► ROOT CAUSE: MX record does NOT point to inbound.resend.com");
      console.error("[inbound-email] ► FIX: In Namecheap DNS → change MX record to:");
      console.error("[inbound-email] ►   Type: MX | Host: @ | Value: inbound.resend.com | Priority: 10");
      console.error("[inbound-email] ► Until MX is fixed, only subject/metadata will be saved.");
    }

    /* ── Build reply text ── */
    const rawText = textBody || stripHtml(htmlBody);
    let replyBody = extractReplyBody(rawText);

    console.log("[inbound-email] Extraction:", {
      hasText: !!textBody,
      hasHtml: !!htmlBody,
      rawLen: rawText.length,
      cleanLen: replyBody.length,
      preview: replyBody.substring(0, 100),
    });

    /* ── Fallback if still empty ── */
    if (!replyBody || replyBody.length < 2) {
      // Use subject line (strip Re: and ticket ID)
      const cleanSubject = subject
        .replace(/^(Re|Fwd):\s*/gi, "")
        .replace(/\[TKT-[^\]]+\]/g, "")
        .trim();

      if (cleanSubject.length >= 2) {
        replyBody = cleanSubject;
        console.log("[inbound-email] Using subject as body:", replyBody);
      } else {
        replyBody = "[User replied via email — message body unavailable]";
        console.log("[inbound-email] Using placeholder body");
      }
    }

    /* ── Validate sender ── */
    if (!fromEmail) {
      console.error("[inbound-email] ✗ No sender email found");
      return res.status(200).json({ received: true, error: "No sender email" });
    }

    /* ── Find matching conversation ── */
    const ticketId = extractTicketId(subject);
    console.log("[inbound-email] Ticket:", ticketId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    let message = null;

    // Try ticket ID first
    if (ticketId) {
      const { data: found } = await supabase
        .from("contact_messages")
        .select("id, email, name, ticket_id")
        .eq("ticket_id", ticketId)
        .single();
      message = found;
    }

    // Fallback: match by email
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
      console.log("[inbound-email] ✗ No matching conversation for:", fromEmail, ticketId);
      return res.status(200).json({
        received: true,
        matched: false,
        reason: "No matching conversation",
      });
    }

    console.log("[inbound-email] ✓ Matched message:", message.id, "ticket:", message.ticket_id);

    /* ── Deduplicate (60s window) ── */
    const { data: dupes } = await supabase
      .from("replies")
      .select("id")
      .eq("message_id", message.id)
      .eq("sender_type", "user")
      .eq("reply_text", replyBody)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (dupes && dupes.length > 0) {
      console.log("[inbound-email] Duplicate reply skipped");
      return res.status(200).json({ received: true, duplicate: true });
    }

    /* ── Insert reply ── */
    const { error: insertErr } = await supabase.from("replies").insert({
      message_id: message.id,
      sender_type: "user",
      reply_text: replyBody,
    });

    if (insertErr) {
      console.error("[inbound-email] ✗ Insert error:", insertErr);
      return res.status(200).json({ error: "DB insert failed", received: true });
    }

    /* ── Update message status ── */
    await supabase
      .from("contact_messages")
      .update({ status: "user_replied" })
      .eq("id", message.id);

    console.log("[inbound-email] ✓ SUCCESS:", {
      messageId: message.id,
      ticketId: message.ticket_id,
      from: fromEmail,
      replyLen: replyBody.length,
      bodySource: textBody ? "webhook-text" : htmlBody ? "webhook-html" : "fallback",
    });

    return res.status(200).json({
      success: true,
      messageId: message.id,
      ticketId: message.ticket_id,
      bodyExtracted: !!(textBody || htmlBody),
    });
  } catch (err) {
    console.error("[inbound-email] ✗ Unhandled error:", err);
    return res.status(200).json({ error: "Internal error", received: true });
  }
};
