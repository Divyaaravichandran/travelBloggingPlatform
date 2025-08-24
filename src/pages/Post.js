import React, { useState } from "react";
import { FileText, Type, Tag, Upload } from "lucide-react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Post Created!\n\nTitle: ${title}\nDescription: ${description}\nTags: ${tags}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          padding: "30px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          ✨ Create a New Post
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", fontWeight: "600", marginBottom: "6px" }}>
              <Type size={18} style={{ marginRight: "6px" }} /> Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "50px",
                border: "1px solid #ccc",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", fontWeight: "600", marginBottom: "6px" }}>
              <FileText size={18} style={{ marginRight: "6px" }} /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write something..."
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                outline: "none",
                minHeight: "100px",
              }}
              required
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", fontWeight: "600", marginBottom: "6px" }}>
              <Tag size={18} style={{ marginRight: "6px" }} /> Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. travel, food, tech"
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "50px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", fontWeight: "600", marginBottom: "6px" }}>
              <Upload size={18} style={{ marginRight: "6px" }} /> Upload Image
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: "100%" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(to right, #667eea, #764ba2)",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            🚀 Publish Post
          </button>
        </form>
      </div>
    </div>
  );
}
