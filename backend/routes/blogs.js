const express = require("express");
const { fetch } = require("undici");
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer storage for blog images (same as posts)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/posts/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

async function geocodePlace(country, place) {
  const query = encodeURIComponent(`${place || ''} ${country || ''}`.trim());
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'tbw-travel-app/1.0 (contact: dev@example.com)'
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

// Create blog with country/place; coordinates auto-generated, optional image upload
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, content, category, country, place, images, tags } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description are required" });

    let coords = null;
    if (country || place) {
      try { coords = await geocodePlace(country, place); } catch (_) {}
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPost = new Post({
      userId: req.user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      title,
      description,
      content: content || "",
      category: category || undefined,
      images: Array.isArray(images) ? images : undefined,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined),
      image: req.file ? req.file.filename : undefined,
      location: coords ? {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
        country: country || undefined,
        place: place || undefined,
        coordinatesLat: coords.lat,
        coordinatesLng: coords.lng,
        geo: { lat: coords.lat, lng: coords.lng },
      } : {
        country: country || undefined,
        place: place || undefined,
      },
      createdAt: new Date(),
    });

    await newPost.save();
    return res.status(201).json({ message: "Blog created", post: newPost });
  } catch (err) {
    console.error("Create blog error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all blogs with location
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find({}).select('userId username title image images category createdAt location');
    return res.json(posts);
  } catch (err) {
    console.error("List blogs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get blogs by user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: 1 }).select('userId username title image images category createdAt location');
    return res.json(posts);
  } catch (err) {
    console.error("List user blogs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


