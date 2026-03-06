/**
 * POST /api/inbound-email
 *
 * Resend inbound webhook handler — two-way conversation system.
 *
 * Architecture:
 *   1. User submits contact form → stored in contact_messages (Supabase)
 *   2. Admin replies from dashboard → send-reply.js sends email via Resend
 *   3. User replies to that email → Resend fires email.received webhook HERE
 *   4. This handler fetches the full email body from Resend Retrieve Email API,
 *      maps it to the original ticket, and stores it in the replies table.
 *   5. Admin dashboard sees the reply in real-time via Supabase Realtime.
 *
 * Key design decisions:
 *   - Resend webhooks only contain metadata (from, subject, email_id).
 *     The actual email body must be fetched via GET /emails/{email_id}.
 *   - 3-tier body extraction: webhook payload → Retrieve API → retry after delay.
 *   - Dedup via svix-id (webhook_events table) + content-based fallback.
 *   - Always return 200 to prevent Resend from retrying endlessly.
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, RESEND_WEBHOOK_SECRET
 */

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Extract [TKT-XXXXXXXX] from an email subject line.
 * Returns null if no ticket ID found.
 */
function extractTicketId(subject) {
  if (!subject) return null;
  const match = subject.match(/\[(TKT-[A-Z0-9]+)\]/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Normalize sender email from various Resend payload formats:
 *   "Name <email>"  |  [{address:"email"}]  |  {email:"email"}  |  "email"
 */
function extractFromEmail(from) {
  if (!from) return "";

  if (typeof from === "string") {
    const m = from.match(/<([^>]+)>/);
    return (m ? m[1] : from).toLowerCase().trim();
  }

  if (Array.isArray(from) && from.length > 0) {
    const first = from[0];
    return (first.address || first.email || String(first)).toLowerCase().trim();
  }

  if (typeof from === "object") {
    return (from.address || from.email || "").toLowerCase().trim();
  }

  return "";
}

/**
 * Convert HTML to readable plain text.
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Strip quoted reply text — keeps only the new reply content.
 * Handles "On … wrote:", "--- Original Message", "> quoted" lines.
 */
function cleanReply(content) {
  if (!content) return "";

  const splitPatterns = [
    /\nOn .+wrote:/i,
    /\n-{2,}\s*Original Message/i,
    /\n_{2,}\s*From:/i,
    /\nFrom:.+\nSent:/i,
  ];

  for (const pattern of splitPatterns) {
    const parts = content.split(pattern);
    if (parts.length > 1) {
      content = parts[0];
      break;
    }
  }

  content = content
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n");

  return content.trim();
}

/**
 * Verify Resend/Svix webhook signature.
 * Returns true if valid, false otherwise.
 */
function verifyWebhookSignature(rawBody, headers, secret) {
  const svixId = headers["svix-id"];
  const svixTs = headers["svix-timestamp"];
  const svixSig = headers["svix-signature"];

  if (!svixId || !svixTs || !svixSig) {
    console.error("[SIGNATURE] Missing svix headers:", {
      id: !!svixId,
      ts: !!svixTs,
      sig: !!svixSig,
    });
    return false;
  }

  // Reject timestamps older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTs, 10);
  if (Math.abs(now - ts) > 300) {
    console.error("[SIGNATURE] Timestamp too old:", { now, ts, diff: now - ts });
    return false;
  }

  const signedPayload = `${svixId}.${svixTs}.${rawBody}`;
  const key = Buffer.from(secret.split("_").pop(), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(signedPayload)
    .digest("base64");

  // Svix sends "v1,<base64>" pairs separated by spaces
  const isValid = svixSig
    .split(" ")
    .some((s) => s.split(",").pop() === expected);

  if (!isValid) console.error("[SIGNATURE] Mismatch");
  return isValid;
}

/**
 * Call Resend Retrieve Email API: GET /emails/{email_id}
 * Returns the parsed JSON response or null on error.
 *
 * @param {string} emailId  — The email_id from the webhook payload
 * @param {string} apiKey   — Resend API key
 * @param {number} delayMs  — Optional delay before calling (for retry)
 */
async function fetchEmailFromResend(emailId, apiKey, delayMs = 0) {
  if (!emailId || !apiKey) return null;

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const url = `https://api.resend.com/emails/${emailId}`;
  console.log(`[RESEND API] GET ${url} (delay=${delayMs}ms)`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json();

  if (!response.ok) {
    console.error(
      `[RESEND API] HTTP ${response.status}:`,
      JSON.stringify(json),
    );
    return null;
  }

  console.log("[RESEND API] Response keys:", Object.keys(json).join(", "));
  console.log("[RESEND API] text length:", json.text?.length || 0);
  console.log("[RESEND API] html length:", json.html?.length || 0);
  // Log ALL string fields in API response
  for (const [k, v] of Object.entries(json)) {
    if (typeof v === "string" && v.length > 0) {
      console.log(`[RESEND API] ${k} (${v.length} chars):`, v.slice(0, 200));
    }
  }

  return json;
}

/**
 * Extract plain-text body from a Resend API email object.
 * Prefers text over html.
 */
function extractBody(emailObj) {
  if (!emailObj) return "";
  if (emailObj.text) return emailObj.text;
  if (emailObj.html) return stripHtml(emailObj.html);
  return "";
}

/**
 * Recursively scan an object for any field that looks like email body content.
 * Checks common field names: text, html, body, content, plain, raw, message.
 * Returns { value: string, path: string } or null.
 */
function deepScanForBody(obj, path = "data", depth = 0) {
  if (!obj || depth > 5) return null;

  const bodyFieldNames = [
    "text",
    "html",
    "body",
    "content",
    "plain",
    "raw",
    "message",
    "text_body",
    "html_body",
    "text_content",
    "html_content",
    "plain_text",
    "stripped-text",
    "stripped-html",
    "body-plain",
    "body-html",
  ];

  // Check direct string fields that look like body content
  for (const key of bodyFieldNames) {
    if (obj[key] && typeof obj[key] === "string" && obj[key].length > 5) {
      return { value: obj[key], path: `${path}.${key}`, isHtml: key.includes("html") };
    }
  }

  // Recurse into nested objects
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = deepScanForBody(val, `${path}.${key}`, depth + 1);
      if (found) return found;
    }
    // Check arrays (e.g., parts, attachments)
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (val[i] && typeof val[i] === "object") {
          const found = deepScanForBody(val[i], `${path}.${key}[${i}]`, depth + 1);
          if (found) return found;
        }
        // Direct string in array that's long enough to be a body
        if (typeof val[i] === "string" && val[i].length > 20) {
          return { value: val[i], path: `${path}.${key}[${i}]`, isHtml: false };
        }
      }
    }
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HANDLER
   ═══════════════════════════════════════════════════════════════════ */

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  /* ── Only accept POST ── */
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
    console.error("[CONFIG] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    return res.status(200).json({ error: "Server misconfigured" });
  }

  if (!RESEND_API_KEY) {
    console.error("[CONFIG] Missing RESEND_API_KEY — cannot fetch email bodies");
    return res.status(200).json({ error: "RESEND_API_KEY not configured" });
  }

  const body = req.body || {};
  const rawBody = JSON.stringify(body);

  /* ════════════════════════════════════════════════════════════════
     STEP 1 — Verify webhook signature (Svix)
     ════════════════════════════════════════════════════════════════ */

  if (RESEND_WEBHOOK_SECRET) {
    const isValid = verifyWebhookSignature(
      rawBody,
      req.headers,
      RESEND_WEBHOOK_SECRET,
    );
    if (!isValid) {
      console.error("[WEBHOOK] Signature invalid — rejecting request");
      return res.status(200).json({ error: "Invalid signature" });
    }
    console.log("[WEBHOOK] Signature verified");
  } else {
    console.warn(
      "[WEBHOOK] RESEND_WEBHOOK_SECRET not set — skipping signature check",
    );
  }

  /* ── Skip non-inbound events ── */
  if (body.type !== "email.received") {
    console.log("[WEBHOOK] Skipping event type:", body.type);
    return res.status(200).json({ skipped: true, type: body.type });
  }

  const data = body.data || {};
  const svixId = req.headers["svix-id"] || "";

  console.log("══════════════════════════════════════════════");
  console.log("[INBOUND] Email received");
  console.log("[INBOUND] svix-id:  ", svixId);
  console.log("[INBOUND] from:     ", data.from);
  console.log("[INBOUND] to:       ", JSON.stringify(data.to));
  console.log("[INBOUND] subject:  ", data.subject);
  console.log("[INBOUND] email_id: ", data.email_id || data.id || "MISSING");
  console.log("[INBOUND] payload keys:", Object.keys(data).join(", "));
  // Log ALL string-valued fields and their lengths to find where body hides
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") {
      console.log(`[INBOUND] data.${k} (${v.length} chars):`, v.slice(0, 200));
    } else if (Array.isArray(v)) {
      console.log(`[INBOUND] data.${k} (array, ${v.length} items):`, JSON.stringify(v).slice(0, 300));
    } else if (v && typeof v === "object") {
      console.log(`[INBOUND] data.${k} (object):`, JSON.stringify(v).slice(0, 300));
    }
  }
  // Dump full raw payload for debugging (truncated to 3000 chars)
  console.log("[INBOUND] FULL RAW PAYLOAD:", JSON.stringify(body).slice(0, 3000));
  console.log("══════════════════════════════════════════════");

  /* ════════════════════════════════════════════════════════════════
     STEP 2 — Init Supabase (service role — bypasses RLS)
     ════════════════════════════════════════════════════════════════ */

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  /* ════════════════════════════════════════════════════════════════
     STEP 3 — Deduplicate via svix-id (webhook_events table)
     Prevents processing the same webhook delivery twice.
     ════════════════════════════════════════════════════════════════ */

  if (svixId) {
    try {
      const { data: existing } = await supabase
        .from("webhook_events")
        .select("id")
        .eq("svix_id", svixId)
        .limit(1);

      if (existing?.length) {
        console.log("[DEDUP] Already processed svix-id:", svixId);
        return res.status(200).json({ duplicate: true, svix_id: svixId });
      }

      // Record this webhook for future dedup
      await supabase.from("webhook_events").insert({
        svix_id: svixId,
        event_type: body.type,
        payload: data,
      });
      console.log("[DEDUP] Recorded webhook event:", svixId);
    } catch (err) {
      // If webhook_events table doesn't exist yet, log and continue
      console.warn(
        "[DEDUP] webhook_events table query failed (table may not exist):",
        err.message,
      );
    }
  }

  /* ════════════════════════════════════════════════════════════════
     STEP 4 — Extract email body (3‑tier strategy)

     Tier 1: Check webhook payload (data.text / data.html)
             → Resend may include this directly in some cases.

     Tier 2: Call Resend Retrieve Email API immediately
             → GET https://api.resend.com/emails/{email_id}

     Tier 3: Retry the API after a 3-second delay
             → The email may not be fully indexed yet.
     ════════════════════════════════════════════════════════════════ */

  const fromEmail = extractFromEmail(data.from);
  const subject = data.subject || "";
  let messageBody = "";
  let bodySource = "none";

  // ── Tier 1: Webhook payload (direct fields) ──
  if (data.text) {
    messageBody = data.text;
    bodySource = "webhook-text";
  } else if (data.html) {
    messageBody = stripHtml(data.html);
    bodySource = "webhook-html";
  } else if (data.body) {
    messageBody = typeof data.body === "string" ? data.body : stripHtml(String(data.body));
    bodySource = "webhook-body";
  }

  // ── Tier 1b: Deep scan the entire payload for body-like fields ──
  if (!messageBody) {
    console.log("[BODY] Direct fields empty — deep scanning payload...");
    const found = deepScanForBody(body);
    if (found) {
      messageBody = found.isHtml ? stripHtml(found.value) : found.value;
      bodySource = `deep-scan:${found.path}`;
      console.log(`[BODY] Found via deep scan at ${found.path} (${found.value.length} chars)`);
    }
  }

  // ── Tier 1c: Check if body is in top-level body object (outside data) ──
  if (!messageBody && body.text) {
    messageBody = body.text;
    bodySource = "body-text";
  } else if (!messageBody && body.html) {
    messageBody = stripHtml(body.html);
    bodySource = "body-html";
  }

  // ── Tier 2: Resend Retrieve Email API ──
  if (!messageBody) {
    const emailId = data.email_id || data.id || data.message_id;
    console.log("[BODY] Webhook payload empty — calling Retrieve Email API");
    console.log("[BODY] email_id:", emailId);

    if (emailId) {
      try {
        const emailData = await fetchEmailFromResend(emailId, RESEND_API_KEY);
        messageBody = extractBody(emailData);
        if (messageBody) {
          bodySource = "resend-api";
        } else if (emailData) {
          // Deep scan the API response too
          const found = deepScanForBody(emailData, "api-response");
          if (found) {
            messageBody = found.isHtml ? stripHtml(found.value) : found.value;
            bodySource = `resend-api-deep:${found.path}`;
          }
        }

        // ── Tier 3: Retry after delay (email may still be processing) ──
        if (!messageBody) {
          console.log("[BODY] API returned empty — retrying after 3s delay");
          const retryData = await fetchEmailFromResend(
            emailId,
            RESEND_API_KEY,
            3000,
          );
          messageBody = extractBody(retryData);
          if (messageBody) bodySource = "resend-api-retry";
        }
      } catch (err) {
        console.error("[BODY] Resend API call failed:", err.message);
      }
    } else {
      console.error(
        "[BODY] No email_id in payload — cannot call Retrieve API",
      );
      console.log("[BODY] Available fields:", Object.keys(data).join(", "));
    }
  }

  // Strip quoted text ("On … wrote:" / "> " lines)
  messageBody = cleanReply(messageBody);

  if (!messageBody) {
    // Resend free plan doesn't include body in webhook or Retrieve API.
    // Save a clean notification so admin knows a reply was received.
    messageBody = "[User replied via email — body not available on Resend free plan. Upgrade to a paid Resend plan to receive full email content.]";
    console.warn("[BODY] All extraction tiers failed — Resend free plan limitation");
    console.log("[BODY] FULL data object:", JSON.stringify(data));
  }

  console.log("[BODY] Source:", bodySource);
  console.log("[BODY] Length:", messageBody.length);
  console.log("[BODY] Preview:", messageBody.slice(0, 300));

  /* ════════════════════════════════════════════════════════════════
     STEP 5 — Match email to an existing ticket / conversation

     Strategy A: Parse [TKT-XXXXXXXX] from subject line.
                 This is the most reliable since we embed it in
                 the outgoing email subject from send-reply.js.

     Strategy B: Fallback — match by sender email address.
                 Uses the most recent conversation with that user.
     ════════════════════════════════════════════════════════════════ */

  const ticketId = extractTicketId(subject);
  let message = null;

  // Strategy A: ticket_id from subject
  if (ticketId) {
    console.log("[MATCH] Trying ticket_id:", ticketId);
    const { data: matches } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .limit(1);

    if (matches?.length) {
      message = matches[0];
      console.log(
        "[MATCH] Found by ticket_id:",
        message.ticket_id,
        "→ id:",
        message.id,
      );
    }
  }

  // Strategy B: sender email (most recent)
  if (!message && fromEmail) {
    console.log("[MATCH] Fallback — trying sender email:", fromEmail);
    const { data: matches } = await supabase
      .from("contact_messages")
      .select("*")
      .ilike("email", fromEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (matches?.length) {
      message = matches[0];
      console.log(
        "[MATCH] Found by email:",
        message.ticket_id,
        "→ id:",
        message.id,
      );
    }
  }

  if (!message) {
    console.warn("[MATCH] No matching conversation:", {
      fromEmail,
      ticketId,
      subject,
    });
    return res
      .status(200)
      .json({ unmatched: true, from: fromEmail, subject });
  }

  /* ════════════════════════════════════════════════════════════════
     STEP 6 — Content-based dedup (backup safety net)
     Catches duplicate deliveries even if svix-id dedup was skipped.
     ════════════════════════════════════════════════════════════════ */

  const { data: existingReply } = await supabase
    .from("replies")
    .select("id")
    .eq("message_id", message.id)
    .eq("sender_type", "user")
    .eq("reply_text", messageBody)
    .limit(1);

  if (existingReply?.length) {
    console.log("[DEDUP] Identical reply already exists — skipping");
    return res.status(200).json({ duplicate: true, reason: "content_match" });
  }

  /* ════════════════════════════════════════════════════════════════
     STEP 7 — Insert reply into Supabase replies table
     ════════════════════════════════════════════════════════════════ */

  const { error: insertError } = await supabase.from("replies").insert({
    message_id: message.id,
    sender_type: "user",
    reply_text: messageBody,
  });

  if (insertError) {
    console.error("[DB] Reply insert failed:", insertError);
    return res
      .status(200)
      .json({ error: "db_insert_failed", detail: insertError.message });
  }

  console.log("[DB] Reply saved successfully");

  /* ════════════════════════════════════════════════════════════════
     STEP 8 — Update ticket status to "user_replied"
     This triggers the realtime subscription in the admin dashboard.
     ════════════════════════════════════════════════════════════════ */

  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({
      status: "user_replied",
    })
    .eq("id", message.id);

  if (updateError) {
    console.error("[DB] Status update failed:", updateError);
    // Non-critical — reply was already saved
  }

  /* ── Done ── */
  console.log("══════════════════════════════════════════════");
  console.log("[INBOUND] SUCCESS");
  console.log("[INBOUND] Ticket:    ", message.ticket_id);
  console.log("[INBOUND] From:      ", fromEmail);
  console.log("[INBOUND] Body src:  ", bodySource);
  console.log("[INBOUND] Body len:  ", messageBody.length);
  console.log("══════════════════════════════════════════════");

  return res.status(200).json({
    success: true,
    ticket_id: message.ticket_id,
    message_id: message.id,
    body_source: bodySource,
  });
};
