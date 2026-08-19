require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { main } = require("./models/index");
const User = require("./models/users");
const Product = require("./models/product");

const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const aiRoute = require("./router/ai");
const { verifyToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "inventory_secret_jwt_key_2026_super_secure";

// Gmail SMTP Setup (via Nodemailer)
const emailUser = process.env.EMAIL_USER || "souradeepmandal459@gmail.com";
const emailPass = process.env.EMAIL_PASS || "hpoh pvda nhcn srjl";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Connect Database
main();

app.use(express.json());
app.use(cors());

// Modular API Routes
app.use("/api/store", storeRoute);
app.use("/api/product", productRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/sales", salesRoute);
app.use("/api/ai", aiRoute);

// ------------- Authentication API ------------

// Step 1: Send OTP to email (no password yet)
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, imageUrl } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "First name, last name and email are required." });
    }

    // Check for existing verified user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    if (existing) await User.deleteOne({ _id: existing._id });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      imageUrl,
      otp,
      otpExpiresAt,
      isVerified: false,
    });
    const result = await newUser.save();

    // Send OTP via Gmail SMTP
    await transporter.sendMail({
      from: `"Inventory App" <${emailUser}>`,
      to: result.email,
      subject: "Your Inventory App Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#4f46e5;margin-bottom:8px">Verify your email</h2>
          <p style="color:#6b7280;margin-bottom:24px">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:32px;font-weight:700;color:#111827">${otp}</div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: "OTP sent to your email.",
      userId: result._id,
    });
  } catch (error) {
    console.error("Register Error: ", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Step 2: Verify OTP → returns a temporary token
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(400).json({ message: "User is already verified." });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ message: "OTP has expired. Please register again." });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    // OTP matched — clear it, await password step
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Short-lived token to unlock the password step
    const registrationToken = jwt.sign(
      { id: user._id, step: "set_password" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "OTP verified! Please set your password.",
      registrationToken,
    });
  } catch (error) {
    console.error("Verification Error: ", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

// Step 3: Set Password → finalises account, logs user in
app.post("/api/set-password", async (req, res) => {
  try {
    const { registrationToken, password } = req.body;

    if (!registrationToken || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let decoded;
    try {
      decoded = jwt.verify(registrationToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Session expired. Please register again." });
    }

    if (decoded.step !== "set_password") {
      return res.status(401).json({ message: "Invalid token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Account created successfully!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Set Password Error: ", error);
    res.status(500).json({ message: "Failed to set password.", error: error.message });
  }
});

// Login: email + password
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Your account is not verified. Please register again." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    // Remember Me: 30 days vs 7 days
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: "Login successful!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Get Logged-in User Profile
app.get("/api/user/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Test endpoint
app.get("/testget", async (req, res) => {
  try {
    const result = await Product.findOne({});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Database connection failed! Did you add 0.0.0.0/0 to MongoDB Atlas Network Access?" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
