const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// 🔹 Signup
router.post("/signup", upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, email, password, phone, country } = req.body;

    console.log("Signup request received:", { username, email, phone, country });
    console.log("File uploaded:", req.file);

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      country,
      profilePicture: req.file ? req.file.filename : null,
    });

    console.log("New user being saved:", newUser);

    await newUser.save();
    res.json({ message: "User registered successfully", user: newUser  });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // generate JWT
    const token = jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });

    res.json({ token, message: "Login successful", user: { username: user.username, profilePicture: user.profilePicture } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("User data being sent:", user);
    res.json(user);
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Test route to check uploads directory
router.get("/test-uploads", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      message: "Uploads directory accessible", 
      files: files,
      uploadsPath: uploadsDir 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error accessing uploads directory", 
      error: err.message,
      uploadsPath: uploadsDir 
    });
  }
});

// Update profile picture
router.post("/update-profile-picture", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Profile picture update request:", req.file);

    // Update user's profile picture in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: req.file.filename },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile picture updated for user:", user.username);
    res.json({ message: "Profile picture updated successfully", user });

  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
