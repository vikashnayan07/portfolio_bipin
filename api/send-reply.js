/**
 * Vercel Serverless Function — POST /api/send-reply
 *
 * Two-way conversation system:
 * 1. Saves the admin reply to the `replies` table
 * 2. Updates contact_messages status
 * 3. Sends a premium styled email via Resend with ticket threading
 *
 * Environment variables required (set in Vercel dashboard):
 *   RESEND_API_KEY          — Resend API key
 *   SUPABASE_URL            — Supabase project URL
 *   SUPABASE_SERVICE_KEY    — Supabase service_role key
 */

const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

/* ── Config ────────────────────────────────────────────── */
const FROM_EMAIL = "Bipin Kumar <help@bipinoberoy.me>";
const REPLY_TO_EMAIL = "help@bipinoberoy.me";
const SITE_NAME = "bipinoberoy.me";
const SITE_URL = "https://www.bipinoberoy.me";
const PROFILE_IMG = "https://www.bipinoberoy.me/rehman.jpeg";

/* ── Premium Email Template ────────────────────────────── */
function buildHtmlEmail(
  userName,
  replyText,
  originalSubject,
  originalMessage,
  ticketId,
) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reply from Bipin Kumar</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

  <!-- Preheader (hidden) -->
  <div style="display:none;font-size:1px;color:#f0f2f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${replyText.substring(0, 120).replace(/\n/g, " ")}...
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Main card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ▌ Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#FF9933 0%,#FFD700 50%,#FF9933 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ▌ Header with logo -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${PROFILE_IMG}" alt="BK" width="44" height="44" style="width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #FF9933;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a2e;letter-spacing:-0.3px;">Bipin Kumar</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#8892a4;font-weight:500;">BPSC Aspirant &bull; Educator</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="display:inline-block;padding:4px 12px;background:#f0f2f5;border-radius:20px;font-size:11px;color:#8892a4;font-weight:600;letter-spacing:0.3px;">${ticketId || ""}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▌ Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#eef0f4;"></div></td></tr>

          <!-- ▌ Greeting -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0;font-size:16px;color:#2d3748;line-height:1.7;">
                Hi <strong style="color:#1a1a2e;">${userName || "there"}</strong>,
              </p>
              <p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">
                Thank you for reaching out. Here's my response to your message:
              </p>
            </td>
          </tr>

          <!-- ▌ Reply content (main highlight) -->
          <tr>
            <td style="padding:24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);border-radius:12px;padding:24px 28px;border:1px solid #fde68a;">
                    <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.8;font-weight:400;">
                      ${replyText.replace(/\n/g, "<br>")}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▌ Original message (collapsible look) -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#a0aec0;text-transform:uppercase;letter-spacing:1px;">
                      &#9664; Your original message
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f7f8fa;border-radius:10px;padding:18px 22px;border-left:3px solid #e2e8f0;">
                    ${originalSubject ? '<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#4a5568;">Subject: ' + originalSubject + "</p>" : ""}
                    <p style="margin:0;font-size:14px;color:#718096;line-height:1.7;">
                      ${originalMessage ? originalMessage.replace(/\n/g, "<br>") : "—"}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▌ CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#FF9933,#FFD700);padding:1px;">
                    <a href="${SITE_URL}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#1a1a2e;text-decoration:none;border-radius:9px;background:linear-gradient(135deg,#FF9933,#FFD700);letter-spacing:0.3px;">
                      Visit My Website &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▌ Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#eef0f4;"></div></td></tr>

          <!-- ▌ Professional Signature — Compact Layout -->
          <tr>
            <td style="padding:28px 40px;">
              <!-- Signature divider -->
              <div style="height:3px;background:#2d3a4a;margin-bottom:20px;"></div>
              <!-- Signature content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left: Text content -->
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#2d3a4a;font-family:'Segoe UI',Roboto,Arial,sans-serif;">Bipin Kumar</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#2d3a4a;font-weight:600;">BPSC Aspirant &bull; Educator</p>
                    <div style="height:14px;"></div>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:12px;">
                      <tr>
                        <td style="padding:3px 0;">
                          <span style="color:#c87941;">&#127760;</span>&nbsp;
                          <a href="${SITE_URL}" style="color:#5a6577;text-decoration:none;font-weight:500;">${SITE_NAME}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;">
                          <span style="color:#c87941;">&#9993;</span>&nbsp;
                          <a href="mailto:help@bipinoberoy.me" style="color:#5a6577;text-decoration:none;font-weight:500;">help@bipinoberoy.me</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;">
                          <span style="color:#c87941;">&#128205;</span>&nbsp;
                          <span style="color:#5a6577;font-weight:500;">Bihar, India</span>
                        </td>
                      </tr>
                    </table>
                    <div style="height:12px;"></div>
                    <!-- Social Icons -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://facebook.com" target="_blank" style="text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="22" height="22" style="width:22px;height:22px;border-radius:50%;" />
                          </a>
                        </td>
                        <td style="padding-right:8px;">
                          <a href="https://instagram.com" target="_blank" style="text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" width="22" height="22" style="width:22px;height:22px;border-radius:50%;" />
                          </a>
                        </td>
                        <td style="padding-right:8px;">
                          <a href="https://youtube.com" target="_blank" style="text-decoration:none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" alt="YouTube" width="22" height="22" style="width:22px;height:22px;border-radius:50%;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Profile Image — positioned after text with comfortable gap -->
                  <td style="vertical-align:middle;width:120px;padding-left:24px;">
                    <img src="${PROFILE_IMG}" alt="Bipin Kumar" width="110" height="110" style="width:110px;height:110px;border-radius:50%;object-fit:cover;object-position:center 30%;border:3px solid #e0e0e0;display:block;" />
                  </td>
                  <!-- Spacer so image isn't at extreme right edge -->
                  <td style="width:60px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ▌ Footer -->
          <tr>
            <td style="background:#f7f8fa;padding:20px 40px;border-top:1px solid #eef0f4;">
              <p style="margin:0;font-size:12px;color:#a0aec0;text-align:center;line-height:1.6;">
                This is a reply to your message on
                <a href="${SITE_URL}" style="color:#FF9933;text-decoration:none;font-weight:600;">${SITE_NAME}</a>.<br>
                Simply reply to this email to continue the conversation.
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#cbd5e0;text-align:center;">
                &copy; ${year} Bipin Kumar. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main card -->

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

    /* ── 2. Save reply to replies table ── */
    const { error: insertError } = await supabase.from("replies").insert({
      message_id: messageId,
      sender_type: "admin",
      reply_text: replyText.trim(),
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res
        .status(500)
        .json({ error: "Failed to save reply to database" });
    }

    /* ── 3. Update message status ── */
    await supabase
      .from("contact_messages")
      .update({
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    /* ── 4. Send email via Resend with ticket threading ── */
    const ticketId =
      message.ticket_id || "TKT-" + message.id.substring(0, 8).toUpperCase();
    const subjectLine = `Re: ${message.subject || "Your message"} [${ticketId}]`;

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
        ticketId,
      ),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return res.status(207).json({
        success: true,
        warning: "Reply saved but email delivery failed",
        emailError: emailError.message,
      });
    }

    /* ── 5. Success ── */
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
