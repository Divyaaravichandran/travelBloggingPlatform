const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  profilePicture: { type: String },
  bio: { type: String, default: "🌍 Traveler | 📸 Photographer | ✈️ Adventure Seeker" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
