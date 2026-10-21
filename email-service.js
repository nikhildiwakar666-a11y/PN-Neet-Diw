const nodemailer = require('nodemailer');
const { generateBrandedEmail } = require('./email-template');

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send a secure, branded password reset email.
 */
async function sendPasswordResetEmail({ toEmail, recipientName, resetUrl }) {
  const subject = 'Reset Your PN Neet Diw Password';
  const messageHtml = `
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">We received a request to reset the password for your account associated with <strong>${toEmail}</strong>.</p>
    <p style="margin:0 0 16px;font-size:14.5px;color:#3f3f46;line-height:1.6;">Click the button below to set a new password. For your security, this link is valid for <strong>1 hour</strong> and can be used only once.</p>
    <p style="margin:0;font-size:12.5px;color:#71717a;line-height:1.5;">If you did not request this reset, you can safely ignore this email. Your current password remains secure.</p>
  `;

  const html = generateBrandedEmail({
    title: subject,
    recipientName: recipientName || 'Student',
    messageHtml,
    actionText: 'Set New Password',
    actionUrl: resetUrl
  });

  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `"PN Neet Diw" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html
      });
      console.log(`[Email Service] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] Failed to send email via SMTP to ${toEmail}:`, err.message);
    }
  }

  // Fallback logging for development or when SMTP is not configured
  console.log('====================================================');
  console.log(`[PASSWORD RESET LINK for ${toEmail}]`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('====================================================');
  return { sent: false, provider: 'console', resetUrl };
}

module.exports = { sendPasswordResetEmail };
