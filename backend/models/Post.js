const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  profilePicture: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, default: "" },
  tags: [{ type: String }],
  image: { type: String },
  images: [{ type: String }],
  category: { type: String },
  // Geo/location info for mapping posts
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      // [lng, lat]
      type: [Number],
      index: '2dsphere',
      default: undefined
    },
    city: { type: String },
    country: { type: String },
    place: { type: String },
    placeName: { type: String },
    // Denormalized lat/lng for easy client consumption
    coordinatesLat: { type: Number },
    coordinatesLng: { type: Number },
    // Or nested coordinates as requested
    geo: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likes: { type: Number, default: 0 },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
