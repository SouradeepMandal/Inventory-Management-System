require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// User Registration Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, imageUrl } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      imageUrl,
    });

    const result = await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: result._id, email: result.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful!",
      user: {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        phoneNumber: result.phoneNumber,
        imageUrl: result.imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error: ", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
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
