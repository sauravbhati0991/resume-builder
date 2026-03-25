// backend/src/utils/mailer.js
const nodemailer = require("nodemailer");

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS, SMTP_FROM } =
    process.env;

  // ✅ Validate only when sending mail (prevents server crash on boot)
  if (!SMTP_HOST || !SMTP_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "SMTP env missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
    );
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 true, 587 false
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    from: SMTP_FROM || EMAIL_USER,
  };
}

async function sendOtpEmail({ to, otp }) {
  const cfg = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  });

  // ✅ optional but helpful: verify SMTP connection
  await transporter.verify();

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2 style="margin:0 0 8px 0">Verify your email</h2>
      <p style="margin:0 0 12px 0">Your OTP is:</p>
      <div style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</div>
      <p style="margin:12px 0 0 0;color:#666">This OTP expires in 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: "ResumeA Email Verification OTP",
    html,
  });
}

module.exports = { sendOtpEmail };
