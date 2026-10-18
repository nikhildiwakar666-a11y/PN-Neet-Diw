/**
 * PN Neet Diw Official Email Template Generator
 * Provides high-contrast, responsive, branded HTML email layouts.
 */

function generateBrandedEmail({ title, recipientName, messageHtml, actionText, actionUrl }) {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'PN Neet Diw'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f7f5;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;color:#171717;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f7f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border:1px solid #e2e2dc;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <!-- Header Branding -->
          <tr>
            <td align="center" style="background:#111111;padding:26px 20px;border-bottom:2px solid #27272a;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Brand Typography & Emblem -->
                    <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;display:inline-block;">
                      <span style="background:#ffffff;color:#111111;font-size:13px;padding:3px 8px;border-radius:6px;font-weight:900;letter-spacing:0.04em;margin-right:8px;vertical-align:middle;">PN</span>
                      <span style="vertical-align:middle;">NEET DIW</span>
                    </div>
                    <div style="color:#a1a1aa;font-size:10px;font-weight:700;letter-spacing:0.16em;margin-top:4px;">
                      MEDICAL PREPARATION PLATFORM
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 28px;">
              ${recipientName ? `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#111111;">Hello ${recipientName},</h2>` : ''}
              
              <div style="font-size:14.5px;line-height:1.65;color:#3f3f46;margin-bottom:28px;">
                ${messageHtml || ''}
              </div>

              ${actionText && actionUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
                <tr>
                  <td align="center" style="border-radius:9px;background:#111111;">
                    <a href="${actionUrl}" target="_blank" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.01em;">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <hr style="border:none;border-top:1px solid #e2e2dc;margin:28px 0 20px;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                Need assistance? Reach out to your faculty mentor or administration at support@pnneetdiw.com.
              </p>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background:#f7f7f5;padding:18px 24px;border-top:1px solid #e2e2dc;text-align:center;font-size:11.5px;color:#71717a;">
              &copy; ${currentYear} PN Neet Diw. All rights reserved. Focused NEET-UG Preparation.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { generateBrandedEmail };
