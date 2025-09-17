const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { getIO } = require("../socket");

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
    const { title, description, content, tags } = req.body;
    
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
      content: content || "",
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

// Like/Unlike Post (unique per user)
router.put("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likedBy?.some((u) => String(u) === req.user.id);
    if (hasLiked) {
      // One-way like: do not decrement, just acknowledge current state
      return res.json({ likes: post.likes || 0, liked: true });
    }
    post.likedBy = [...(post.likedBy || []), req.user.id];
    post.likes = (post.likes || 0) + 1;
    await post.save();
    try { getIO()?.emit("post:like", { postId: String(post._id), likes: post.likes }); } catch (_) {}
    return res.json({ likes: post.likes, liked: true });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Also accept POST for environments that block PUT
router.post("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const hasLiked = post.likedBy?.some((u) => String(u) === req.user.id);
    if (hasLiked) return res.json({ likes: post.likes || 0, liked: true });
    post.likedBy = [...(post.likedBy || []), req.user.id];
    post.likes = (post.likes || 0) + 1;
    await post.save();
    try { getIO()?.emit("post:like", { postId: String(post._id), likes: post.likes }); } catch (_) {}
    return res.json({ likes: post.likes, liked: true });
  } catch (err) {
    console.error("Error liking (POST):", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Add comment
router.post("/:postId/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment text required" });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newComment = { userId: user._id, username: user.username, text: text.trim(), createdAt: new Date() };
    post.comments.push(newComment);
    await post.save();
    try { getIO()?.emit("post:comment", { postId: String(post._id), comment: newComment, commentsCount: post.comments.length }); } catch (_) {}
    return res.status(201).json({ comment: newComment, commentsCount: post.comments.length });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get All Posts (Explore Page)
// Route: GET /api/posts
// Return all posts sorted by createdAt (latest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Latest first
      .select('userId title description content tags image username profilePicture likes likedBy comments createdAt');

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
      .select('userId title description content tags image username profilePicture likes likedBy comments createdAt');

    console.log(`Retrieved ${posts.length} posts for user ${req.params.userId}`);

    res.json(posts);

  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
