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

// User Registration Endpoint (Sends OTP)
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, imageUrl, verificationMethod } = req.body;

    if (!email || !password || !firstName || !lastName || !verificationMethod) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (verificationMethod === 'phone' && !phoneNumber) {
      return res.status(400).json({ message: "Phone number is required for phone verification." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User with this email already exists and is verified." });
      }
      // If unverified, we will just delete the old one to start fresh
      await User.deleteOne({ _id: existingUser._id });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      imageUrl,
      verificationMethod,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    const result = await newUser.save();

    if (verificationMethod === 'email') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: result.email,
        subject: "Your Inventory App Verification Code",
        text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      };
      await transporter.sendMail(mailOptions);
    } else if (verificationMethod === 'phone') {
      if (process.env.TWILIO_ACCOUNT_SID) {
        try {
          await twilioClient.messages.create({
            body: `Your Inventory App verification code is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
        } catch (smsError) {
          console.error("Twilio SMS Error (OTP might not have sent):", smsError);
        }
      }
    }

    res.status(201).json({
      message: `Registration started! OTP sent to your ${verificationMethod}.`,
      userId: result._id,
      requiresVerification: true
    });
  } catch (error) {
    console.error("Register Error: ", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// User OTP Verification Endpoint
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP matches! Verify user.
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Verification successful! You are now logged in.",
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
    console.error("Verification Error: ", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

// User Signin Endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Your account is not verified. Please register again to verify." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
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
