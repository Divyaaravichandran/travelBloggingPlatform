const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();
const requireAdmin = auth; // middleware placeholder

// GET /admin/users - list users with search/sort/filter
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { q, status, sort = "-createdAt" } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ username: rx }, { email: rx }];
    }
    const users = await User.find(filter)
      .sort(sort)
      .select("username email status createdAt");
    return res.json(users);
  } catch (err) {
    console.error("Admin list users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /admin/users/:id/suspend - toggle suspend
router.patch("/users/:id/suspend", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "suspended" ? "active" : "suspended";
    await user.save();

    // update user's posts
    await Post.updateMany(
      { username: user.username },
      { $set: { active: user.status === "active" } }
    );

    return res.json({ message: `User ${user.status}`, status: user.status });
  } catch (err) {
    console.error("Suspend user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/analytics
router.get("/analytics", requireAdmin, async (_req, res) => {
  try {
    const [totalUsers, suspendedUsers, totalPosts] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "suspended" }),
      Post.countDocuments({ active: { $ne: false } }),
    ]);
    const activeUsers = totalUsers - suspendedUsers;

    // signups by month
    const signups = await User.aggregate([
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    // blogs by category
    const blogsByCategory = await Post.aggregate([
      { $match: { active: { $ne: false } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totals: {
        totalUsers,
        activeUsers,
        newSignupsThisMonth: signups
          .filter(
            (s) =>
              s._id &&
              new Date().getFullYear() === s._id.y &&
              new Date().getMonth() + 1 === s._id.m
          )
          .reduce((a, b) => a + b.count, 0),
        totalBlogs: totalPosts,
      },
      charts: { signups, blogsByCategory },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/blogs
router.get("/blogs", requireAdmin, async (_req, res) => {
  try {
    const posts = await Post.find({ active: { $ne: false } })
      .sort({ createdAt: -1 })
      .select("title username createdAt");
    res.json(posts);
  } catch (e) {
    console.error("Admin list blogs error", e);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /admin/blogs/:id
router.delete("/blogs/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("Admin delete blog error", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
