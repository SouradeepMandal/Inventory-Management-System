require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

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

// Twilio Setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

// User Registration Endpoint (OTP-first, no password required yet)
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, imageUrl, verificationMethod } = req.body;

    if (!firstName || !lastName || !verificationMethod) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }
    if (verificationMethod === 'email' && !email) {
      return res.status(400).json({ message: "Email is required for email verification." });
    }
    if (verificationMethod === 'phone' && !phoneNumber) {
      return res.status(400).json({ message: "Phone number is required for phone verification." });
    }

    // Check for existing verified user
    if (verificationMethod === 'email') {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing.isVerified) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      if (existing) await User.deleteOne({ _id: existing._id });
    } else {
      const existing = await User.findOne({ phoneNumber });
      if (existing && existing.isVerified) {
        return res.status(400).json({ message: "An account with this phone number already exists." });
      }
      if (existing) await User.deleteOne({ _id: existing._id });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      firstName,
      lastName,
      email: email ? email.toLowerCase() : undefined,
      phoneNumber: phoneNumber || undefined,
      imageUrl,
      verificationMethod,
      otp,
      otpExpiresAt,
      isVerified: false,
    });
    const result = await newUser.save();

    if (verificationMethod === 'email') {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: result.email,
        subject: "Your Inventory App Verification Code",
        html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>This code expires in <strong>10 minutes</strong>.</p>`,
      });
    } else if (verificationMethod === 'phone') {
      if (process.env.TWILIO_ACCOUNT_SID) {
        try {
          await twilioClient.messages.create({
            body: `Your Inventory App code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
        } catch (smsError) {
          console.error("Twilio SMS Error:", smsError);
        }
      }
    }

    res.status(201).json({
      message: `OTP sent to your ${verificationMethod}.`,
      userId: result._id,
      requiresVerification: true
    });
  } catch (error) {
    console.error("Register Error: ", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// OTP Verification Endpoint (returns a temporary registration token)
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(400).json({ message: "User is already verified." });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ message: "OTP has expired. Please register again." });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    // OTP matched — clear it but do NOT set isVerified yet (waiting for password)
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Issue a short-lived temporary token to allow the password-setting step
    const registrationToken = jwt.sign(
      { id: user._id, step: 'set_password' },
      JWT_SECRET,
      { expiresIn: '15m' }
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

// Set Password Endpoint (finalizes account after OTP verification)
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
      return res.status(401).json({ message: "Token expired or invalid. Please register again." });
    }

    if (decoded.step !== 'set_password') {
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
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Account created successfully!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Set Password Error: ", error);
    res.status(500).json({ message: "Failed to set password.", error: error.message });
  }
});

// User Signin Endpoint (accepts email or phone number)
app.post("/api/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please enter your email/phone and password." });
    }

    // Find user by email OR phone number
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Your account is not verified. Please register again to verify." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Get Logged-in User Profile Endpoint
app.get("/api/user/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
