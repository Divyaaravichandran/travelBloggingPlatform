const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/posts/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Create Post API
// Route: POST /api/posts
// Authenticated users only
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Get user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process tags (handle both array and comma-separated string)
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags;
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Create new post
    const newPost = new Post({
      userId: req.user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      title,
      description,
      tags: processedTags,
      image: req.file ? req.file.filename : null,
      likes: 0,
      comments: [],
      createdAt: new Date()
    });

    console.log("New post object:", {
      userId: req.user.id,
      username: user.username,
      title,
      description,
      tags: processedTags,
      image: req.file ? req.file.filename : null
    });

    console.log("Creating new post:", {
      userId: req.user.id,
      username: user.username,
      title,
      description,
      tags: processedTags,
      image: req.file ? req.file.filename : null
    });

    await newPost.save();
    
    res.status(201).json({ 
      message: "Post created successfully", 
      post: newPost 
    });

  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Posts (Explore Page)
// Route: GET /api/posts
// Return all posts sorted by createdAt (latest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Latest first
      .select('title description tags image username profilePicture likes comments createdAt');

    console.log(`Retrieved ${posts.length} posts`);

    res.json(posts);

  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Posts by User ID (Profile Page)
// Route: GET /api/posts/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }) // Latest first
      .select('title description tags image username profilePicture likes comments createdAt');

    console.log(`Retrieved ${posts.length} posts for user ${req.params.userId}`);

    res.json(posts);

  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
