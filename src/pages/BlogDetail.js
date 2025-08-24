import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Example blog data (replace with API or context in production)
const blogData = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    title: "Sunrise in Bali",
    author: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    details: "Bali is renowned for its stunning sunrises, lush rice terraces, and vibrant culture. In this blog, we explore the best spots to catch the sunrise, local traditions, and tips for travelers.",
    location: "Bali, Indonesia",
    tips: "Arrive early for sunrise, bring a camera, respect local customs.",
    likes: 120,
    comments: [
      { user: "Alex", text: "Amazing photos!" },
      { user: "Sam", text: "Thanks for the tips!" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    title: "Alpine Adventures",
    author: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    details: "The Alps offer some of the most scenic hiking trails in the world. Join us as we trek through picturesque villages, sample mountain cuisine, and share tips for safe hiking.",
    location: "Swiss Alps",
    tips: "Pack layers, check weather, hire a local guide.",
    likes: 98,
    comments: [
      { user: "Emily", text: "Love the Alps!" },
    ],
  },
];

function BlogDetail() {
  const { id } = useParams(); // expects route like /blog/:id
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Simulate fetching blog by id
    const blogIdx = parseInt(id, 10);
    const found = blogData[blogIdx] || null;
    setBlog(found);
    setComments(found ? found.comments : []);
  }, [id]);

  const handleAddComment = () => {
    if (commentInput.trim() === "") return;
    setComments([...comments, { user: "You", text: commentInput }]);
    setCommentInput("");
  };

  if (!blog) {
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.notFound}>Blog not found.</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      <div style={styles.card}>
        <img src={blog.image} alt={blog.title} style={styles.img} />
        <h1 style={styles.title}>{blog.title}</h1>
        <div style={styles.authorRow}>
          <img src={blog.avatar} alt={blog.author} style={styles.avatar} />
          <span style={styles.author}>{blog.author}</span>
        </div>
        <div style={styles.location}><strong>Location:</strong> {blog.location}</div>
        <div style={styles.details}>{blog.details}</div>
        <div style={styles.tips}><strong>Travel Tips:</strong> {blog.tips}</div>
        <div style={styles.likes}><span style={{color:"#e53935"}}>❤️</span> {blog.likes} Likes</div>
        <div style={styles.commentsSection}>
          <h3>Comments</h3>
          <div style={styles.commentsList}>
            {comments.length === 0 && <div style={{color:"#aaa"}}>No comments yet.</div>}
            {comments.map((c, i) => (
              <div key={i} style={styles.commentItem}>
                <span style={{color:"#0097a7", fontWeight:500}}>{c.user}:</span> {c.text}
              </div>
            ))}
          </div>
          <div style={styles.commentInputRow}>
            <input
              style={styles.commentInput}
              type="text"
              value={commentInput}
              placeholder="Add a comment..."
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
            />
            <button style={styles.commentBtn} onClick={handleAddComment}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%)",
    minHeight: "100vh",
    padding: "24px",
    boxSizing: "border-box",
  },
  backBtn: {
    background: "#0097a7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  notFound: {
    fontSize: "1.3rem",
    color: "#888",
    textAlign: "center",
    marginTop: "60px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    padding: "32px",
    maxWidth: "540px",
    margin: "0 auto",
    textAlign: "center",
  },
  img: {
    width: "100%",
    maxHeight: "260px",
    objectFit: "cover",
    borderRadius: "16px",
    marginBottom: "18px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0097a7",
    marginBottom: "8px",
  },
  authorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e0f7fa",
  },
  author: {
    fontWeight: 500,
    color: "#0097a7",
    fontSize: "16px",
  },
  location: {
    fontSize: "15px",
    color: "#444",
    marginBottom: "10px",
  },
  details: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  tips: {
    fontSize: "15px",
    color: "#444",
    marginBottom: "14px",
  },
  likes: {
    fontSize: "15px",
    color: "#e53935",
    marginBottom: "18px",
    fontWeight: 600,
  },
  commentsSection: {
    background: "#f1f8fb",
    borderRadius: "12px",
    padding: "14px",
    marginTop: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    textAlign: "left",
  },
  commentsList: {
    maxHeight: "120px",
    overflowY: "auto",
    marginBottom: "8px",
  },
  commentItem: {
    fontSize: "14px",
    marginBottom: "4px",
    color: "#444",
  },
  commentInputRow: {
    display: "flex",
    gap: "8px",
  },
  commentInput: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #b2ebf2",
    fontSize: "14px",
    outline: "none",
  },
  commentBtn: {
    background: "#0097a7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default BlogDetail;