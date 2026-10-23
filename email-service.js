const nodemailer = require('nodemailer');
const { generateBrandedEmail } = require('./email-template');

let transporter = null;
const hasCustomSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

if (hasCustomSmtp) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: String(process.env.SMTP_PORT || '') === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (initErr) {
    console.error('[Email Service] Failed to initialize custom SMTP transporter:', initErr.message);
    transporter = null;
  }
}

/**
 * Send a secure, branded password reset email.
 */
async function sendPasswordResetEmail({ toEmail, recipientName, resetUrl }) {
  if (!transporter) {
    return {
      success: false,
      provider: 'none',
      error: 'Custom SMTP is not configured in server environment variables.'
    };
  }

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

  try {
    const from = process.env.SMTP_FROM || `"PN Neet Diw" <${process.env.SMTP_USER}>`;
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html
    });
    console.log(`[Email Service] Password reset email sent via custom SMTP to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Delivery Failure] Action: password-reset, Email: ${toEmail}, Error: ${err.message}`);
    return { success: false, provider: 'smtp', error: err.message };
  }
}

/**
 * Send a secure, branded account verification email.
 */
async function sendVerificationEmail({ toEmail, recipientName, verificationUrl }) {
  if (!transporter) {
    return {
      success: false,
      provider: 'none',
      error: 'Custom SMTP is not configured in server environment variables.'
    };
  }

  const subject = 'Verify Your Email Address — PN Neet Diw';
  const messageHtml = `
    <p style="margin:0 0 12px;font-size:15px;color:#18181b;">Welcome to <strong>PN Neet Diw</strong>! We're excited to help you prepare for your NEET exam.</p>
    <p style="margin:0 0 16px;font-size:14.5px;color:#3f3f46;line-height:1.6;">Please confirm your email address by clicking the button below. Once verified, you can immediately sign in from any device to access mock tests, study materials, and discussions.</p>
    <p style="margin:0;font-size:12.5px;color:#71717a;line-height:1.5;">If you did not create an account on PN Neet Diw, please ignore this email.</p>
  `;

  const html = generateBrandedEmail({
    title: subject,
    recipientName: recipientName || 'Student',
    messageHtml,
    actionText: 'Verify My Account',
    actionUrl: verificationUrl
  });

  try {
    const from = process.env.SMTP_FROM || `"PN Neet Diw" <${process.env.SMTP_USER}>`;
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html
    });
    console.log(`[Email Service] Verification email sent via custom SMTP to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Delivery Failure] Action: account-verification, Email: ${toEmail}, Error: ${err.message}`);
    return { success: false, provider: 'smtp', error: err.message };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  hasCustomSmtp
};
