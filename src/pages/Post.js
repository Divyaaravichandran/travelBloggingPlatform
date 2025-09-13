import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Send, Image as ImageIcon, Tag } from "lucide-react";
import "./Post.css"; // import our plain CSS

export default function Post() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // Auto-save simulation
  useEffect(() => {
    if (title || content || description) {
      const timeout = setTimeout(() => {
        setAutoSaveMsg("💾 Draft saved automatically");
        setTimeout(() => setAutoSaveMsg(""), 2000);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [title, description, content]);

  // Word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [content]);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setMedia([...media, ...previews]);
  };

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
      formData.append("content", content);
      
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
        setContent("");
        setTags([]);
        setCoverImage(null);
        setMedia([]);
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

          {/* Content */}
          <textarea
            rows="8"
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
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

          {/* Media Upload */}
          <div className="form-group">
            <label className="form-label flex-label">
              <ImageIcon size={16} /> Upload Images/Videos
            </label>
            <input type="file" multiple onChange={handleMediaUpload} />
            <div className="media-preview">
              {media.map((file, idx) => (
                <motion.img
                  key={idx}
                  src={file}
                  alt="media"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="media-thumb"
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="button-bar">
            <motion.button whileTap={{ scale: 0.95 }} className="btn btn-draft">
              <Save size={18} /> Save Draft
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              className="btn btn-publish"
            >
              <Send size={18} /> Publish
            </motion.button>
          </div>

          {/* Auto-save msg */}
          {autoSaveMsg && <p className="autosave-msg">{autoSaveMsg}</p>}

          {/* Word count */}
          <p className="wordcount">
            📝 {wordCount} words • {Math.ceil(wordCount / 200)} min read
          </p>
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
          <div className="preview-content">
            {content || "Start writing your content..."}
          </div>
          {media.length > 0 && (
            <div className="preview-media-grid">
              {media.map((file, idx) => (
                <img key={idx} src={file} alt="preview" className="media-thumb" />
              ))}
            </div>
          )}
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
