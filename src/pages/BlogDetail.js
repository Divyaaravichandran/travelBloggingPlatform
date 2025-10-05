import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Blog not found");
          } else {
            setError("Failed to load blog");
          }
          return;
        }
        
        const data = await response.json();
        setPost(data);
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to comment");
      navigate("/login");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      if (response.status === 401) {
        alert("Please login again to comment.");
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to post comment");

      // Add the new comment to the list
      setComments(prev => [...prev, data.comment]);
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.message || "Error posting comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🔄</div>
          <p style={{ color: "#0097a7" }}>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📝</div>
          <h1 style={{ color: "#666", marginBottom: "20px" }}>Blog not found</h1>
          <button 
            onClick={() => navigate("/explore")}
            style={{
              padding: "10px 20px",
              background: "#0a98a7",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button 
          onClick={() => navigate("/explore")}
          style={{
            padding: "8px 16px",
            background: "#0a98a7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← Back
        </button>

        <div style={{
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          {post.image && (
            <img 
              src={`http://localhost:5000/uploads/posts/${post.image}`} 
              alt={post.title}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover"
              }}
            />
          )}
          
          <div style={{ padding: "30px" }}>
            <h1 style={{ 
              fontSize: "2.5rem", 
              marginBottom: "15px", 
              color: "#0b6270" 
            }}>
              {post.title}
            </h1>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "20px",
              gap: "15px"
            }}>
              <img 
                src={post.profilePicture ? `http://localhost:5000/uploads/${post.profilePicture}` : "https://via.placeholder.com/50"} 
                alt={post.username}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
              <div>
                <div style={{ fontWeight: "bold", color: "#0b6270" }}>
                  {post.username}
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              {post.tags && post.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  style={{
                    background: "#eef9fb",
                    color: "#0a98a7",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    marginRight: "8px"
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <p style={{ 
              fontSize: "1.1rem", 
              lineHeight: "1.6", 
              color: "#333",
              marginBottom: "20px"
            }}>
              {post.description}
            </p>

            {post.content && (
              <div style={{ 
                fontSize: "1rem", 
                lineHeight: "1.6", 
                color: "#555",
                marginBottom: "20px"
              }}>
                {post.content}
              </div>
            )}

            <div style={{ 
              display: "flex", 
              gap: "20px", 
              paddingTop: "20px", 
              borderTop: "1px solid #eee",
              marginBottom: "20px"
            }}>
              <span style={{ color: "#666" }}>
                ❤️ {post.likes || 0} likes
              </span>
              <button 
                onClick={() => setShowComments(!showComments)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "0"
                }}
              >
                💬 {comments.length} comments
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div style={{
                borderTop: "1px solid #eee",
                paddingTop: "20px"
              }}>
                <h3 style={{ marginBottom: "15px", color: "#333" }}>Comments</h3>
                
                {/* Comments List */}
                <div style={{ marginBottom: "20px" }}>
                  {comments.length === 0 ? (
                    <p style={{ color: "#666", fontStyle: "italic" }}>No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment, idx) => (
                      <div key={idx} style={{
                        background: "#f8f9fa",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "10px"
                      }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px"
                        }}>
                          <strong style={{ color: "#0b6270" }}>{comment.username || "User"}</strong>
                          <span style={{ color: "#666", fontSize: "12px" }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: "0", color: "#333" }}>{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-end"
                }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      resize: "vertical",
                      minHeight: "60px",
                      fontFamily: "inherit"
                    }}
                    rows="2"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    style={{
                      padding: "10px 20px",
                      background: submittingComment ? "#ccc" : "#0a98a7",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: submittingComment ? "not-allowed" : "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {submittingComment ? "Posting..." : "Post"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;