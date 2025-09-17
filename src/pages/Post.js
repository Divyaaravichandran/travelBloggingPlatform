import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Tag } from "lucide-react";
import "./Post.css"; // import our plain CSS

export default function Post() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  

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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      // no long content field
      
      // Add tags as comma-separated string
      if (tags.length > 0) {
        formData.append("tags", tags.join(", "));
      }
      
      // Add cover image if selected
      if (coverImage && coverImage.startsWith('blob:')) {
        // Convert blob URL to file
        const response = await fetch(coverImage);
        const blob = await response.blob();
        const file = new File([blob], "cover-image.jpg", { type: blob.type });
        formData.append("image", file);
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
