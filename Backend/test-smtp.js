require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  try {
    const info = await transporter.verify();
    console.log("Success! Gmail SMTP is working:", info);
  } catch (err) {
    console.error("Failed to connect to SMTP:");
    console.error(err);
  }
}

test();
