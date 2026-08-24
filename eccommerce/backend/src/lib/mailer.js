// Outgoing email.
//
// Two modes, chosen automatically:
//   SMTP configured  -> real email is sent
//   SMTP blank       -> the message is printed to the console
//
// The console fallback is deliberate. A developer cloning this repo can test
// the whole forgot-password flow before they own a mail server, and env.js
// refuses to boot production without SMTP, so the fallback cannot silently
// escape to real users.

const nodemailer = require("nodemailer");
const env = require("../config/env");

// One transport for the process, not one per email. Nodemailer pools TCP
// connections; building a transport per send would open a new SMTP handshake
// every time and hit provider rate limits under load.
let transport = null;

function getTransport() {
  if (!env.MAIL_ENABLED) return null;

  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // Port 465 is implicit TLS. Everything else (587, 25) starts plaintext
      // and upgrades via STARTTLS. Getting this backwards is the classic
      // "connection timed out" when wiring up Gmail.
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      pool: true,
      maxConnections: 3,
    });
  }

  return transport;
}

function logToConsole({ to, subject, text }) {
  console.log(
    "\n" +
      "──────────── EMAIL (not sent — SMTP not configured) ────────────\n" +
      `To:      ${to}\n` +
      `Subject: ${subject}\n\n` +
      `${text}\n` +
      "────────────────────────────────────────────────────────────────\n",
  );
}

async function sendMail({ to, subject, text, html }) {
  const mailer = getTransport();

  if (!mailer) {
    logToConsole({ to, subject, text });
    return { delivered: false, reason: "smtp-not-configured" };
  }

  await mailer.sendMail({ from: env.MAIL_FROM, to, subject, text, html });
  return { delivered: true };
}

// Plain text alongside HTML is not optional courtesy: some corporate clients
// strip HTML entirely, and a mail with no text part scores worse in spam
// filters — a reset mail that lands in spam is a reset mail that failed.
function buildPasswordResetEmail({ fullName, resetUrl, expiresInLabel }) {
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";

  const text =
    `${greeting}\n\n` +
    `We received a request to reset your Ciseco password.\n\n` +
    `Open this link to choose a new one:\n${resetUrl}\n\n` +
    `The link expires in ${expiresInLabel} and can only be used once.\n\n` +
    `If you did not request this, you can ignore this email — your ` +
    `password will not change.\n`;

  const html = `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1f2937">
    <h1 style="font-size:20px;margin:0 0 20px">Reset your password</h1>
    <p style="margin:0 0 16px;line-height:1.6">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 24px;line-height:1.6">
      We received a request to reset your Ciseco password. Click the button
      below to choose a new one.
    </p>
    <p style="margin:0 0 24px">
      <a href="${escapeHtml(resetUrl)}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
        Choose a new password
      </a>
    </p>
    <p style="margin:0 0 24px;line-height:1.6;color:#6b7280;font-size:14px">
      This link expires in ${escapeHtml(expiresInLabel)} and can only be used once.
      If you did not request a reset, you can ignore this email — your password
      will not change.
    </p>
    <p style="margin:0;line-height:1.6;color:#9ca3af;font-size:12px;word-break:break-all">
      Button not working? Paste this into your browser:<br>${escapeHtml(resetUrl)}
    </p>
  </div>`;

  return { text, html };
}

// fullName comes from user input and is interpolated into HTML. Without
// escaping, a display name containing a <script> tag would execute in the
// recipient's mail client.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
  expiresInLabel,
}) {
  const { text, html } = buildPasswordResetEmail({
    fullName,
    resetUrl,
    expiresInLabel,
  });

  return sendMail({
    to,
    subject: "Reset your Ciseco password",
    text,
    html,
  });
}

function buildVerificationEmail({ fullName, verifyUrl, expiresInLabel }) {
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";

  const text =
    `${greeting}\n\n` +
    `Welcome to Ciseco! Please verify your email address to complete your registration.\n\n` +
    `Open this link to verify:\n${verifyUrl}\n\n` +
    `The link expires in ${expiresInLabel} and can only be used once.\n\n` +
    `If you did not create this account, you can ignore this email.\n`;

  const html = `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1f2937">
    <h1 style="font-size:20px;margin:0 0 20px">Verify your email</h1>
    <p style="margin:0 0 16px;line-height:1.6">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 24px;line-height:1.6">
      Welcome to Ciseco! Please verify your email address by clicking the button
      below.
    </p>
    <p style="margin:0 0 24px">
      <a href="${escapeHtml(verifyUrl)}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
        Verify email address
      </a>
    </p>
    <p style="margin:0 0 24px;line-height:1.6;color:#6b7280;font-size:14px">
      This link expires in ${escapeHtml(expiresInLabel)} and can only be used once.
      If you did not create this account, you can ignore this email.
    </p>
    <p style="margin:0;line-height:1.6;color:#9ca3af;font-size:12px;word-break:break-all">
      Button not working? Paste this into your browser:<br>${escapeHtml(verifyUrl)}
    </p>
  </div>`;

  return { text, html };
}

async function sendVerificationEmail({
  to,
  fullName,
  verifyUrl,
  expiresInLabel,
}) {
  const { text, html } = buildVerificationEmail({
    fullName,
    verifyUrl,
    expiresInLabel,
  });

  return sendMail({
    to,
    subject: "Verify your Ciseco email address",
    text,
    html,
  });
}

module.exports = { sendMail, sendPasswordResetEmail, sendVerificationEmail };
