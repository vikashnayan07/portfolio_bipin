/**
 * Vercel Serverless Function — POST /api/send-reply
 *
 * 1. Validates the request payload
 * 2. Saves the reply to Supabase (contact_messages table)
 * 3. Sends the reply email to the user via Resend API
 * 4. Returns success / error JSON
 *
 * Environment variables required (set in Vercel dashboard):
 *   RESEND_API_KEY          — Resend API key (re_xxxxxxxx)
 *   SUPABASE_URL            — Supabase project URL
 *   SUPABASE_SERVICE_KEY    — Supabase *service_role* key (NOT anon key)
 */

const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

/* ── Config ────────────────────────────────────────────── */
const FROM_EMAIL = "Bipin Kumar <help@bipinoberoy.me>";
const REPLY_TO_EMAIL = "kumarbipin76211@gmail.com";
const SITE_NAME = "bipinoberoy.me";

/* ── Helpers ───────────────────────────────────────────── */
function buildHtmlEmail(userName, replyText, originalSubject, originalMessage) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#FF9933,#FFD700);padding:28px 32px;">
        <h1 style="margin:0;color:#1a1a2e;font-size:22px;font-weight:700;">Bipin Kumar</h1>
        <p style="margin:4px 0 0;color:rgba(26,26,46,0.7);font-size:13px;">BPSC Aspirant &bull; Educator &bull; ${SITE_NAME}</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;color:#333;font-size:15px;line-height:1.6;">
          Hi <strong>${userName || "there"}</strong>,
        </p>
        <p style="margin:0 0 8px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
          Your message:
        </p>
        <div style="background:#f3f4f6;border-left:3px solid #FF9933;padding:14px 18px;border-radius:6px;margin:0 0 24px;color:#555;font-size:14px;line-height:1.5;">
          ${originalMessage ? originalMessage.replace(/\n/g, "<br>") : "—"}
        </div>
        <p style="margin:0 0 8px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
          My reply:
        </p>
        <div style="background:#fffbeb;border-left:3px solid #FFD700;padding:14px 18px;border-radius:6px;margin:0 0 28px;color:#333;font-size:15px;line-height:1.6;">
          ${replyText.replace(/\n/g, "<br>")}
        </div>
        <p style="margin:0;color:#333;font-size:15px;line-height:1.6;">
          Best regards,<br>
          <strong>Bipin Kumar</strong>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
          This email was sent from <a href="https://${SITE_NAME}" style="color:#FF9933;text-decoration:none;">${SITE_NAME}</a>.
          You can reply directly to this email to continue the conversation.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Main Handler ──────────────────────────────────────── */
module.exports = async function handler(req, res) {
  /* ── Only allow POST ── */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ── Validate env vars ── */
  const { RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  /* ── Validate request body ── */
  const { messageId, replyText } = req.body || {};
  if (!messageId || !replyText?.trim()) {
    return res
      .status(400)
      .json({ error: "messageId and replyText are required" });
  }

  /* ── Init clients ── */
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const resend = new Resend(RESEND_API_KEY);

  try {
    /* ── 1. Fetch the original message from Supabase ── */
    const { data: message, error: fetchError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.email) {
      return res
        .status(400)
        .json({ error: "No email address on this message" });
    }

    /* ── 2. Save reply to Supabase ── */
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({
        reply: replyText.trim(),
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res
        .status(500)
        .json({ error: "Failed to save reply to database" });
    }

    /* ── 3. Send email via Resend ── */
    const subjectLine = `Re: ${message.subject || "Your message on " + SITE_NAME}`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [message.email],
      reply_to: REPLY_TO_EMAIL,
      subject: subjectLine,
      html: buildHtmlEmail(
        message.name,
        replyText.trim(),
        message.subject,
        message.message,
      ),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Reply is already saved in DB — mark it, but warn about email failure
      return res.status(207).json({
        success: true,
        warning: "Reply saved but email delivery failed",
        emailError: emailError.message,
      });
    }

    /* ── 4. Success ── */
    return res.status(200).json({
      success: true,
      message: "Reply saved and email sent successfully",
      emailId: emailData?.id,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
