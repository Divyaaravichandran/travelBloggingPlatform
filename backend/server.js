const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve profile pictures and post images

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/travelblog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ DB Connection Error:", err));

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
