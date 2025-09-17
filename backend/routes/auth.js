const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { getIO } = require("../socket");
const mongoose = require("mongoose");

const router = express.Router();

// Multer storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
  },
});

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
router.post("/update-profile-picture", authMiddleware, (req, res) => {
  upload.single("profilePicture")(req, res, async (err) => {
    if (err) {
      if (err.message.includes("File too large")) {
        return res.status(413).json({ message: "File too large. Max 5MB." });
      }
      return res.status(400).json({ message: err.message || "Upload error" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("Profile picture update request:", req.file);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: req.file.filename },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ message: "Profile picture updated successfully", user });
    } catch (e) {
      console.error("Error updating profile picture:", e);
      return res.status(500).json({ message: "Server error" });
    }
  });
});

// Update profile information
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, country } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user information
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (country) updateData.country = country;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile updated for user:", user.username);
    res.json({ message: "Profile updated successfully", user });

  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fallback endpoint using POST (some environments block PUT)
router.post("/update-profile-info", authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, country } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (country) updateData.country = country;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile (POST):", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Also accept POST on the same path for maximum compatibility
router.post("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, country } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (country) updateData.country = country;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile (POST same path):", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// Follow / Unfollow a user
// POST /api/auth/follow/:userId
router.post("/follow/:userId", authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid user id" });
    if (targetId === req.user.id) return res.status(400).json({ message: "Cannot follow yourself" });

    const me = await User.findById(req.user.id);
    const target = await User.findById(targetId);
    if (!target || !me) return res.status(404).json({ message: "User not found" });

    const isFollowing = me.following?.some((u) => String(u) === targetId);
    if (isFollowing) {
      me.following = me.following.filter((u) => String(u) !== targetId);
      target.followers = target.followers.filter((u) => String(u) !== req.user.id);
    } else {
      me.following = [...(me.following || []), target._id];
      target.followers = [...(target.followers || []), me._id];
    }
    await me.save();
    await target.save();
    try {
      getIO()?.emit("user:follow", {
        userId: String(target._id),
        followersCount: target.followers.length,
      });
      getIO()?.emit("user:following", {
        userId: String(me._id),
        followingCount: me.following.length,
      });
    } catch (_) {}

    return res.json({
      followingCount: me.following.length,
      followersCount: target.followers.length,
      following: !isFollowing,
    });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
