require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, code) {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "✅ موجود" : "❌ undefined",
  );

  // ✅ بيتعمل كل مرة بتبعت إيميل، بعد ما الـ .env يكون اتحمّل
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
    `,
  });
}

module.exports = sendVerificationEmail;