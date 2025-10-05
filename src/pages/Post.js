import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Tag } from "lucide-react";
import "./Post.css"; // import our plain CSS

export default function Post() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [category, setCategory] = useState("");
  const [place, setPlace] = useState("");

  

  const handlePublish = async () => {
    if (!title || !description) {
      alert("⚠️ Please fill in title and description!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      return;
    }

    try {
      // Prefer new blogs endpoint with geocoding, with image upload via multipart
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (Array.isArray(tags) && tags.length) formData.append("tags", tags.join(", "));
      if (category) formData.append("category", category);
      if (country) formData.append("country", country);
      if (place || city) formData.append("place", place || city);
      if (coverImage && coverImage.startsWith('blob:')) {
        const responseBlob = await fetch(coverImage);
        const blob = await responseBlob.blob();
        const file = new File([blob], "cover-image.jpg", { type: blob.type || 'image/jpeg' });
        formData.append("image", file);
      }

      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Your post has been published successfully!");
        // Clear form
        setTitle("");
        setDescription("");
        setTags([]);
        setCoverImage(null);
        setCity("");
        setCountry("");
        setLat("");
        setLng("");
        setCategory("");
        setPlace("");
      } else {
        alert(data.message || "❌ Failed to publish post");
      }
    } catch (err) {
      console.error("Error publishing post:", err);
      alert("❌ Error publishing post");
    }
  };

  return (
    <div className="post-container">
      <div className="post-grid">
        {/* ---------- LEFT: Editor ---------- */}
        <div className="editor-card">
          <h2 className="editor-heading">✍️ Write Your Travel Story</h2>

          {/* Cover Image Upload */}
          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <input
              type="file"
              onChange={(e) =>
                setCoverImage(URL.createObjectURL(e.target.files[0]))
              }
              className="file-input"
            />
            {coverImage && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={coverImage}
                alt="cover"
                className="cover-preview"
              />
            )}
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Enter Blog Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />

          {/* Short Description */}
          <textarea
            rows="2"
            placeholder="Write a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea-field"
          />

          {/* Tags */}
          <input
            type="text"
            placeholder="Enter tags (comma separated)..."
            value={tags.join(", ")}
            onChange={(e) => setTags(e.target.value.split(","))}
            className="input-field"
          />

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                type="text"
                placeholder="Place / City"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Category */}
          <input
            type="text"
            placeholder="Category (adventure, food, culture, etc.)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          />

          {/* Buttons */}
          <div className="button-bar">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              className="btn btn-publish"
            >
              <Send size={18} /> Publish
            </motion.button>
          </div>

          
        </div>

        {/* ---------- RIGHT: Preview ---------- */}
        <div className="preview-card">
          <h2 className="preview-heading">👀 Live Preview</h2>
          {coverImage && (
            <img src={coverImage} alt="cover" className="cover-preview" />
          )}
          <h1 className="preview-title">
            {title || "Your Blog Title"}
          </h1>
          <p className="preview-description">
            {description || "Short description will appear here..."}
          </p>
          
          {tags.length > 0 && (
            <div className="tags-container">
              {tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  <Tag size={14} /> #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
