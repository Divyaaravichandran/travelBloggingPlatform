import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configure Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* ------------------------------
  Fallback data (offline safe)
-------------------------------*/
const fallbackPosts = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format&fit=crop",
    title: "Sunrise in Bali",
    description:
      "Experience the magical sunrise over Bali's lush landscapes. Discover hidden gems and local traditions.",
    author: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    likes: 120,
    comments: 0,
    details:
      "Bali is renowned for its stunning sunrises, lush rice terraces, and vibrant culture.",
    location: "Bali, Indonesia",
    travelTips: "Arrive early for sunrise, bring a camera, respect local customs.",
    commentList: [],
    tags: ["Nature", "Asia", "Sunrise"],
    createdAt: "2024-07-17",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200&q=80&auto=format&fit=crop",
    title: "Alpine Adventures",
    description:
      "Hiking the breathtaking Alps with local guides. Explore scenic trails and enjoy authentic mountain cuisine.",
    author: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    likes: 98,
    comments: 0,
    details:
      "The Alps offer some of the most scenic hiking trails in the world.",
    location: "Swiss Alps",
    travelTips: "Pack layers, check weather, hire a local guide.",
    commentList: [],
    tags: ["Adventure", "Europe", "Mountains"],
    createdAt: "2024-07-14",
  },
];

/* ------------------------------
  Component
-------------------------------*/
function decodeUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload?.id || null;
  } catch (_) {
    return null;
  }
}

function Explore() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlog, setModalBlog] = useState(null);
  const [activeCommentIdx, setActiveCommentIdx] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [shareMsgIdx, setShareMsgIdx] = useState(null);
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [favoritedPosts, setFavoritedPosts] = useState([]);
  const [mapPosts, setMapPosts] = useState([]);
  const [bloggerFilter, setBloggerFilter] = useState("");
  const [bloggerQuery, setBloggerQuery] = useState("");
  const displayMapPosts = React.useMemo(() => {
    const q = (bloggerFilter || '').trim();
    if (!q) return mapPosts;
    const qLower = q.toLowerCase();
    return mapPosts.filter(p => {
      const uname = String(p.username || '').toLowerCase();
      const uid = String(p.userId || '');
      return uname.includes(qLower) || uid === q;
    });
  }, [mapPosts, bloggerFilter]);

  /* Get current user ID and following list */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = decodeUserIdFromToken(token);
    setCurrentUserId(userId);
    
    if (userId) {
      // Fetch current user's following list
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.following) {
          // Get usernames of followed users
          const followedUsernames = data.following.map(followedUserId => {
            // Find the username from the blog posts
            const post = blogPosts.find(p => p.authorId === followedUserId);
            return post ? post.author : null;
          }).filter(Boolean);
          setFollowedAuthors(followedUsernames);
        }
        
        if (data.favorites && Array.isArray(data.favorites)) {
          // Get favorited post IDs
          const favoritedIds = data.favorites.map(fav => String(fav));
          setFavoritedPosts(favoritedIds);
          console.log("Loaded favorites:", favoritedIds);
        }
      })
      .catch(err => console.error("Error fetching user data:", err));
    }
  }, [blogPosts.length]); // Re-run when blog posts are loaded

  /* Fetch posts */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentUserId = decodeUserIdFromToken(token);
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        if (response.ok) {
          const transformed = data.map((post) => ({
            id: post._id,
            image: post.image
              ? `http://localhost:5000/uploads/posts/${post.image}`
              : fallbackPosts[0].image,
            title: post.title,
            description: post.description,
            author: post.username,
            authorId: post.userId,
            avatar: post.profilePicture
              ? `http://localhost:5000/uploads/${post.profilePicture}`
              : fallbackPosts[0].avatar,
            likes: post.likes || 0,
            liked: Array.isArray(post.likedBy) && currentUserId
              ? !!post.likedBy.find((u) => String(u) === String(currentUserId))
              : false,
            comments: post.comments ? post.comments.length : 0,
            details: post.content || post.description,
            // location/travelTips removed
            commentList: post.comments
              ? post.comments.map((c) => ({
                  text: c.text,
                  username: c.username || "User",
                  createdAt: c.createdAt,
                }))
              : [],
            tags: post.tags || [],
            createdAt: post.createdAt,
          }));
          setBlogPosts(transformed);
        } else {
          setBlogPosts(fallbackPosts);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setBlogPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);

    // Realtime
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      timeout: 10000,
    });
    socket.on("connect_error", (err) => {
      console.warn("Realtime connection error; falling back to polling only:", err?.message || err);
    });
    socket.on("post:like", ({ postId, likes }) => {
      setBlogPosts((posts) => posts.map((p) => (p.id === postId ? { ...p, likes } : p)));
    });
    socket.on("post:comment", ({ postId, comment, commentsCount }) => {
      setBlogPosts((posts) =>
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: commentsCount,
                commentList: [
                  ...p.commentList,
                  { text: comment.text, username: comment.username || "User", createdAt: comment.createdAt },
                ],
              }
            : p
        )
      );
    });
    
    // Listen for follow updates
    socket.on("user:follow", ({ userId, followersCount }) => {
      console.log("Follow update received:", { userId, followersCount });
    });
    
    socket.on("user:following", ({ userId, followingCount }) => {
      console.log("Following update received:", { userId, followingCount });
    });
    return () => {
      clearInterval(interval);
      try { socket.disconnect(); } catch (_) {}
    };
  }, []);

  // Platform map data (all posts with location, optional blogger filter)
  useEffect(() => {
    const fetchMapPosts = async () => {
      try {
        const q = new URLSearchParams();
        if (bloggerFilter) q.set("blogger", bloggerFilter);
        const res = await fetch(`http://localhost:5000/api/posts/with-location?${q.toString()}`);
        const data = await res.json();
        if (res.ok) setMapPosts(data);
      } catch (e) {
        console.error("Failed to fetch platform map posts", e);
      }
    };
    fetchMapPosts();
  }, [bloggerFilter]);

  /* Lock background scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
  }, [modalOpen]);

  /* Like post */
  const handleLike = async (idx, id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to like posts");
      return;
    }
    if (blogPosts[idx]?.liked) return; // already liked, block duplicate
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        alert("Please login again to like posts.");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to like");
      setBlogPosts((posts) =>
        posts.map((p, i) =>
          i === idx
            ? { ...p, likes: data.likes, liked: data.liked, heartPop: data.liked }
            : p
        )
      );
      setTimeout(() => {
        setBlogPosts((posts) =>
          posts.map((p, i) => (i === idx ? { ...p, heartPop: false } : p))
        );
      }, 650);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  /* Comment */
  const handleCommentToggle = (idx) => {
    setActiveCommentIdx(activeCommentIdx === idx ? null : idx);
    setCommentInput("");
  };

  const handleCommentSubmit = async (idx, id) => {
    if (!commentInput.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to comment");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentInput }),
      });
      if (res.status === 401) {
        alert("Please login again to comment.");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to comment");
      setBlogPosts((posts) =>
        posts.map((p, i) =>
          i === idx
            ? {
                ...p,
                comments: (p.comments || 0) + 1,
                commentList: [
                  ...p.commentList,
                  { text: data.comment?.text || commentInput, username: data.comment?.username || "You", createdAt: data.comment?.createdAt || new Date().toISOString() },
                ],
              }
            : p
        )
      );
      setCommentInput("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const openModal = (blog) => {
    setModalBlog(blog);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBlog(null);
  };

  const handleLocalFavorite = (idx) => {
    setFavorites((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleShare = async (idx) => {
    const url = window.location.origin + "/blog/" + (blogPosts[idx]?.id || idx);
    try {
      await navigator.clipboard.writeText(url);
      setShareMsgIdx(idx);
      setTimeout(() => setShareMsgIdx(null), 1200);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareMsgIdx(idx);
      setTimeout(() => setShareMsgIdx(null), 1200);
    }
  };

  const handleFavorite = async (idx, postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add favorites");
      window.location.href = "/login";
      return;
    }

    try {
      console.log("Toggling favorite for post:", postId);
      const res = await fetch(`http://localhost:5000/api/auth/favorite/${postId}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.status === 401) {
        alert("Please login again to manage favorites.");
        window.location.href = "/login";
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Favorite response:", data);
      
      // Update the favorites state
      setFavoritedPosts(prev => {
        if (data.favorited) {
          return prev.includes(postId) ? prev : [...prev, postId];
        } else {
          return prev.filter(id => id !== postId);
        }
      });
      
      console.log("Favorite action successful:", data);
    } catch (err) {
      console.error("Favorite error:", err);
      alert(err.message || "Error managing favorite");
    }
  };

  const handleFollow = async (author, authorId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to follow users");
      window.location.href = "/login";
      return;
    }
    
    if (!authorId) {
      console.error("No authorId provided for follow action");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/follow/${authorId}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.status === 401) {
        alert("Please login again to follow users.");
        window.location.href = "/login";
        return;
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to follow");
      
      // Update the followed authors state based on the API response
      setFollowedAuthors((prev) => {
        if (data.following) {
          // User is now following this author
          return prev.includes(author) ? prev : [...prev, author];
        } else {
          // User is no longer following this author
          return prev.filter((a) => a !== author);
        }
      });
      
      console.log("Follow action successful:", data);
    } catch (err) {
      console.error("Follow error:", err);
      alert(err.message || "Error following user");
    }
  };

  return (
    <div style={layoutStyles.page}>
      <style>{globalCSS}</style>

      {/* Header */}
      <div style={layoutStyles.header}>
        <h1 style={layoutStyles.title}>Explore Blogs</h1>
        <p style={layoutStyles.subtitle}>
          Discover travel stories, destinations & guides
        </p>
      </div>

      {/* Platform Map */}
      <div style={{ maxWidth: 1200, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, position: 'relative', zIndex: 1000 }}>
          <input
            placeholder="Filter by username (or userId)"
            value={bloggerQuery}
            onChange={(e) => setBloggerQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setBloggerFilter((bloggerQuery || '').trim());
              }
            }}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setBloggerFilter((bloggerQuery || '').trim())}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #0a98a7', color: '#0a98a7', background: '#eef9fb', cursor: 'pointer' }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => { setBloggerQuery(""); setBloggerFilter(""); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#556', marginBottom: 6 }}>
          {bloggerFilter ? `Filter: ${bloggerFilter}` : 'Showing all bloggers'} · {displayMapPosts.length} locations
          {bloggerFilter && displayMapPosts.length === 0 && (
            <span style={{ color: '#a33', marginLeft: 8 }}>(no results)</span>
          )}
        </div>
        <div style={{ height: 420, borderRadius: 12, overflow: 'hidden' }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {displayMapPosts.filter(p => p.location && Array.isArray(p.location.coordinates)).map(p => (
              <Marker key={p._id} position={[p.location.coordinates[1], p.location.coordinates[0]]}>
                <Popup>
                  <div style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                    {p.image && (
                      <img src={`http://localhost:5000/uploads/posts/${p.image}`} alt={p.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>by {p.username}</div>
                    <a href={`/blog/${p._id}`} style={{ color: '#0a98a7', fontWeight: 600 }}>Open post →</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Blog Grid */}
      <div style={layoutStyles.blogGrid}>
        {loading ? (
          <div style={layoutStyles.loadingContainer}>Loading posts...</div>
        ) : (
          blogPosts.map((post, idx) => {
            const isFavorite = favorites.includes(idx);
            const isTrending = post.likes >= 100;

            return (
              <article key={post.id || idx} className="blog-card" style={cardStyles.blogCard}>
                <img src={post.image} alt={post.title} style={cardStyles.cardImage} />
                <div style={cardStyles.cardContent}>
                  <div style={cardStyles.cardHeader}>
                    <h2 style={cardStyles.cardTitle}>{post.title}</h2>
                    {isTrending && <span style={cardStyles.trending}>🔥 Trending</span>}
                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        type="button"
                        style={cardStyles.followBtnSmall}
                        onClick={() => handleFollow(post.author, post.authorId)}
                      >
                        {followedAuthors.includes(post.author) ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={cardStyles.tagRow}>
                    {post.tags.map((tag, i) => (
                      <span key={i} style={cardStyles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="card-description" style={cardStyles.cardDesc}>{post.description}</p>

                  <div style={cardStyles.cardFooter}>
                    <div style={cardStyles.authorRow}>
                      <img
                        src={post.avatar}
                        alt={post.author}
                        style={cardStyles.authorAvatarSmall}
                      />
                      <div style={cardStyles.authorInfo}>
                        <div style={cardStyles.authorName}>{post.author}</div>
                        <div style={cardStyles.metaDate}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={cardStyles.actionsRow}>
                      <button
                        type="button"
                        style={cardStyles.iconBtn}
                        onClick={() => handleLike(idx, post.id)}
                      >
                        <span
                          className={post.heartPop ? "heart-pop" : ""}
                          style={{ marginRight: 6 }}
                        >
                          ❤️
                        </span>
                        {post.likes}
                      </button>

                      <button
                        type="button"
                        style={cardStyles.iconBtn}
                        onClick={() => handleCommentToggle(idx)}
                      >
                        💬 {post.comments}
                      </button>

                      <button
                        type="button"
                        style={{
                          ...cardStyles.iconBtn,
                          background: favoritedPosts.includes(post.id) ? "#fff7ed" : "#eef9fb",
                          color: favoritedPosts.includes(post.id) ? "#ff8a00" : "#556",
                        }}
                        onClick={() => handleFavorite(idx, post.id)}
                      >
                        {favoritedPosts.includes(post.id) ? "★" : "☆"}
                      </button>

                      <button
                        type="button"
                        style={cardStyles.iconBtn}
                        onClick={() => handleShare(idx)}
                      >
                        🔗
                      </button>
                      {shareMsgIdx === idx && (
                        <span style={cardStyles.copied}>Link copied</span>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {activeCommentIdx === idx && (
                    <div style={cardStyles.commentBox}>
                      <div style={cardStyles.commentList}>
                        {post.commentList.length === 0 && (
                          <div style={{ color: "#8aa" }}>No comments yet.</div>
                        )}
                        {post.commentList.map((c, i) => (
                          <div key={i} style={cardStyles.commentItem}>
                            <div style={{ fontWeight: 600 }}>{c.username || "User"}</div>
                            <div style={{ fontSize: 12, color: "#789" }}>
                              {c.createdAt ? new Date(c.createdAt).toLocaleString() : "Just now"}
                            </div>
                            <div>{c.text || c}</div>
                          </div>
                        ))}
                      </div>

                      <div style={cardStyles.commentInputRow}>
                        <input
                          style={cardStyles.commentInput}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleCommentSubmit(idx, post.id)
                          }
                          placeholder="Write a comment..."
                        />
                        <button
                          style={cardStyles.commentBtn}
                          onClick={() => handleCommentSubmit(idx, post.id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Removed Continue Reading button as requested */}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && modalBlog && (
        <div className="modal-overlay" style={modalStyles.modalOverlay} onClick={closeModal}>
          <div className="modal-content" style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalBlog.image} alt={modalBlog.title} style={modalStyles.modalImage} />
            <h2 style={modalStyles.modalTitle}>{modalBlog.title}</h2>

            <div style={modalStyles.modalMeta}>
              <img
                src={modalBlog.avatar}
                alt={modalBlog.author}
                style={cardStyles.authorAvatarSmall}
              />
              <div style={{ marginLeft: 10 }}>
                <div style={{ fontWeight: 700 }}>{modalBlog.author}</div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  {new Date(modalBlog.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  type="button"
                  style={{
                    ...modalStyles.followBtn,
                    background: followedAuthors.includes(modalBlog.author)
                      ? "#0a98a7"
                      : "#eef9fb",
                    color: followedAuthors.includes(modalBlog.author)
                      ? "#fff"
                      : "#0a98a7",
                  }}
                  onClick={() => handleFollow(modalBlog.author, modalBlog.authorId)}
                >
                  {followedAuthors.includes(modalBlog.author)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
            </div>

            <p style={modalStyles.modalDesc}>{modalBlog.details}</p>

            {/* extras removed */}

            <div style={{ textAlign: "center" }}>
              <button style={modalStyles.closeBtn} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------
  Styles
-------------------------------*/
const globalCSS = `
.blog-card { transition: transform 0.25s, box-shadow 0.25s; }
.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
}
.card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5em;
  min-height: 4.5em;
  line-height: 1.5;
  margin: 0;
  padding: 8px 0;
}
@media (max-width: 768px) {
  h1 { font-size: 28px !important; }
  h2 { font-size: 20px !important; }
  .modal-overlay { padding: 60px 10px 10px 10px !important; }
  .modal-content { margin-top: 0 !important; }
}
@keyframes heartPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.45); }
  60% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.heart-pop { animation: heartPop 0.65s cubic-bezier(.17,.67,.83,.67); color: #e53935; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const layoutStyles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(180deg,#f7fbfc 0%, #ecfbff 100%)",
    minHeight: "100vh",
    padding: 28,
    color: "#08384a",
  },
  header: { marginBottom: 18, textAlign: "center" },
  title: { fontSize: 44, margin: 0, color: "#0b6270" },
  subtitle: { marginTop: 8, marginBottom: 18, color: "#2b575e", fontSize: 16 },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
    maxWidth: 1200,
    margin: "0 auto",
  },
  loadingContainer: { textAlign: "center", padding: 50 },
};

const cardStyles = {
  blogCard: {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 6px 24px rgba(15,50,60,0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardImage: { width: "100%", height: 220, objectFit: "cover" },
  cardContent: { padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  cardTitle: { fontSize: 22, margin: 0, color: "#0b6270", fontWeight: 700 },
  trending: {
    background: "linear-gradient(90deg,#ff8a00,#ff4d4d)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    background: "#eef9fb",
    color: "#0a98a7",
    fontSize: 13,
    padding: "3px 8px",
    borderRadius: 8,
  },
  cardDesc: { 
    color: "#455", 
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxHeight: "4.5em",
    minHeight: "4.5em",
    flex: 1,
    margin: 0,
    padding: "8px 0"
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  authorRow: { display: "flex", alignItems: "center" },
  authorAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
  },
  authorInfo: { marginLeft: 10 },
  authorName: { color: "#0b6270", fontWeight: 700 },
  metaDate: { fontSize: 13, color: "#698" },
  actionsRow: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    background: "#eef9fb",
    border: "none",
    padding: "6px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
    pointerEvents: "auto",
  },
  followBtnSmall: {
    background: "#eef9fb",
    border: "1px solid #0a98a7",
    padding: "6px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 13,
    color: "#0a98a7",
    fontWeight: 600,
    transition: "all 0.2s ease",
    position: "relative",
    zIndex: 10,
    pointerEvents: "auto",
  },
  copied: {
    background: "#e8f7f8",
    padding: "4px 8px",
    borderRadius: 8,
    color: "#0a7",
    fontSize: 13,
  },
  commentBox: { marginTop: 12, background: "#f2fbfc", padding: 12, borderRadius: 10, position: "relative", zIndex: 1 },
  commentList: { maxHeight: 90, overflowY: "auto", marginBottom: 8 },
  commentItem: { marginBottom: 6, color: "#254", fontSize: 14 },
  commentInputRow: { display: "flex", gap: 8 },
  commentInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #dff5f7",
  },
  commentBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 8,
    background: "#0a98a7",
    color: "#fff",
    cursor: "pointer",
  },
  readRow: { textAlign: "right" },
  readLink: {
    marginTop: 8,
    color: "#0a98a7",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

const modalStyles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    overflowY: "auto",
    padding: "80px 20px 20px 20px",
  },
  modalContent: {
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    maxWidth: 720,
    width: "100%",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    animation: "fadeIn 0.3s ease",
    marginTop: "auto",
    marginBottom: "auto",
  },
  modalImage: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 20,
    maxHeight: 400,
    objectFit: "cover",
  },
  modalTitle: { fontSize: 28, color: "#0b6270", marginBottom: 8 },
  modalMeta: { display: "flex", alignItems: "center", marginBottom: 12 },
  modalDesc: { lineHeight: 1.6, color: "#344" },
  modalExtras: { marginTop: 14, padding: 12, background: "#f8fbfb", borderRadius: 10 },
  closeBtn: {
    marginTop: 20,
    padding: "10px 18px",
    border: "none",
    borderRadius: 10,
    background: "#0a98a7",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  followBtn: {
    padding: "6px 12px",
    border: "1px solid #0a98a7",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    zIndex: 10,
    pointerEvents: "auto",
  },
};

export default Explore;
