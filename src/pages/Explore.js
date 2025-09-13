import React, { useState, useEffect } from "react";

/* ------------------------------
  fallback data (keeps your page working offline)
-------------------------------*/
const fallbackPosts = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format&fit=crop",
    title: "Sunrise in Bali",
    description:
      "Experience the magical sunrise over Bali's lush landscapes. Discover hidden gems and local traditions.",
    author: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    likes: 120,
    comments: 0,
    details:
      "Bali is renowned for its stunning sunrises, lush rice terraces, and vibrant culture. In this blog, we explore the best spots to catch the sunrise, local traditions, and tips for travelers.",
    location: "Bali, Indonesia",
    tips: "Arrive early for sunrise, bring a camera, respect local customs.",
    commentList: [],
    tags: ["Nature", "Asia", "Sunrise"],
    createdAt: "2024-07-17",
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200&q=80&auto=format&fit=crop",
    title: "Alpine Adventures",
    description:
      "Hiking the breathtaking Alps with local guides. Explore scenic trails and enjoy authentic mountain cuisine.",
    author: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    likes: 98,
    comments: 0,
    details:
      "The Alps offer some of the most scenic hiking trails in the world. Join us as we trek through picturesque villages, sample mountain cuisine, and share tips for safe hiking.",
    location: "Swiss Alps",
    tips: "Pack layers, check weather, hire a local guide.",
    commentList: [],
    tags: ["Adventure", "Europe", "Mountains"],
    createdAt: "2024-07-14",
  },
];

const carouselDestinations = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80&auto=format&fit=crop",
    name: "Maldives",
    subtitle: "Beaches & nightlife",
  },
  {
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1400&q=80&auto=format&fit=crop",
    name: "Santorini",
    subtitle: "Cliff views & sunsets",
  },
  {
    image: "https://images.unsplash.com/photo-1465156799763-2c087c332922?w=1400&q=80&auto=format&fit=crop",
    name: "Kyoto",
    subtitle: "Temples & gardens",
  },
];

const userInterests = ["Asia", "Nature", "Adventure"];

const topAuthors = [
  {
    name: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    followers: 1200,
    bio: "Nature lover & sunrise chaser. Sharing travel stories from Asia.",
    featured: "Sunrise in Bali",
  },
  {
    name: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    followers: 980,
    bio: "Mountain explorer. Hiking and adventure blogs from Europe.",
    featured: "Alpine Adventures",
  },
];

/* ------------------------------
  Component
-------------------------------*/
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

  useEffect(() => {
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
            avatar: post.profilePicture
              ? `http://localhost:5000/uploads/${post.profilePicture}`
              : fallbackPosts[0].avatar,
            likes: post.likes || 0,
            comments: post.comments ? post.comments.length : 0,
            details: post.description,
            location: post.location || "Travel Destination",
            tips: post.tips || "Explore and enjoy your journey!",
            commentList: post.comments ? post.comments.map((c) => c.text) : [],
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
  }, []);

  const handleLike = (idx) => {
    setBlogPosts((posts) =>
      posts.map((p, i) => (i === idx ? { ...p, likes: p.likes + 1, heartPop: true } : p))
    );
    setTimeout(() => {
      setBlogPosts((posts) => posts.map((p, i) => (i === idx ? { ...p, heartPop: false } : p)));
    }, 650);
  };

  const handleCommentToggle = (idx) => {
    setActiveCommentIdx(activeCommentIdx === idx ? null : idx);
    setCommentInput("");
  };

  const handleCommentSubmit = (idx) => {
    if (!commentInput.trim()) return;
    setBlogPosts((posts) =>
      posts.map((p, i) =>
        i === idx ? { ...p, comments: p.comments + 1, commentList: [...p.commentList, commentInput] } : p
      )
    );
    setCommentInput("");
  };

  const openModal = (blog) => {
    setModalBlog(blog);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBlog(null);
  };

  const handleFavorite = (idx) => {
    setFavorites((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleShare = (idx) => {
    const url = window.location.origin + "/blog/" + (blogPosts[idx]?.id || idx);
    navigator.clipboard?.writeText(url);
    setShareMsgIdx(idx);
    setTimeout(() => setShareMsgIdx(null), 1200);
  };

  const handleFollow = (author) => {
    setFollowedAuthors((prev) => (prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]));
  };

  const recommendedBlogs = blogPosts.filter((post) => post.tags && post.tags.some((t) => userInterests.includes(t)));

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Explore Blogs</h1>
          <p style={styles.subtitle}>Discover travel stories, destinations & guides</p>
        </div>
      </div>

      {/* Main layout */}
      <div style={styles.mainLayout}>
        {/* Left: Blog feed */}
        <div style={styles.leftPane}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}>🔄</div>
              <div style={styles.loadingText}>Loading posts...</div>
            </div>
          ) : (
            <div style={styles.blogList}>
              {blogPosts.map((post, idx) => {
                const isFavorite = favorites.includes(idx);
                const isTrending = post.likes >= 100;
                const isFollowed = followedAuthors.includes(post.author);

                return (
                  <article key={idx} style={styles.blogCard} className="blog-card">
                    <div style={styles.cardLeft}>
                      <img src={post.image} alt={post.title} style={styles.cardImage} />
                    </div>

                    <div style={styles.cardRight}>
                      <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>{post.title}</h2>
                        {isTrending && <span style={styles.trending}>🔥 Trending</span>}
                      </div>

                      <div style={styles.metaRow}>
                        <span style={styles.metaDate}>
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                        </span>
                        <span style={styles.metaAuthor}> • {post.author}</span>
                      </div>

                      <p style={styles.cardDesc}>{post.description}</p>

                      <div style={styles.cardFooter}>
                        <div style={styles.authorRow}>
                          <img src={post.avatar} alt={post.author} style={styles.authorAvatarSmall} />
                          <div style={{ marginLeft: 10 }}>
                            <div style={styles.authorName}>{post.author}</div>
                          </div>
                        </div>

                        <div style={styles.actionsRow}>
                          <button style={styles.iconBtn} onClick={() => handleLike(idx)} aria-label="Like">
                            <span className={post.heartPop ? "heart-pop" : ""} style={{ marginRight: 8 }}>
                              ❤️
                            </span>
                            <span>{post.likes}</span>
                          </button>

                          <button style={styles.iconBtn} onClick={() => handleCommentToggle(idx)} aria-label="Comment">
                            💬 <span style={{ marginLeft: 6 }}>{post.comments}</span>
                          </button>

                          <button
                            style={{
                              ...styles.iconBtn,
                              background: isFavorite ? "#fff7ed" : "#eef9fb",
                              color: isFavorite ? "#ff8a00" : "#556",
                            }}
                            onClick={() => handleFavorite(idx)}
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite ? "★" : "☆"}
                          </button>

                          <button style={styles.iconBtn} onClick={() => handleShare(idx)} title="Copy link">
                            🔗
                          </button>

                          {shareMsgIdx === idx && <span style={styles.copied}>Link copied</span>}
                        </div>
                      </div>

                      {activeCommentIdx === idx && (
                        <div style={styles.commentBox}>
                          <div style={styles.commentList}>
                            {post.commentList.length === 0 && <div style={{ color: "#8aa" }}>No comments yet.</div>}
                            {post.commentList.map((c, i) => (
                              <div key={i} style={styles.commentItem}>
                                <strong style={{ color: "#0a7" }}>User:</strong> {c}
                              </div>
                            ))}
                          </div>

                          <div style={styles.commentInputRow}>
                            <input
                              style={styles.commentInput}
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(idx)}
                              placeholder="Write a comment..."
                            />
                            <button style={styles.commentBtn} onClick={() => handleCommentSubmit(idx)}>
                              Post
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={styles.readRow}>
                        <button style={styles.readLink} onClick={() => openModal(post)}>
                          Continue Reading →
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: featured destinations */}
        <aside style={styles.rightPane}>
          <h3 style={styles.rightTitle}>Featured Destinations</h3>

          <div style={styles.destList}>
            {carouselDestinations.map((d, i) => (
              <div key={i} style={styles.destCard} onClick={() => alert(`Open ${d.name} (hook in your router)`)} role="button">
                <img src={d.image} alt={d.name} style={styles.destImg} />
                <div style={styles.destOverlay}>
                  <div style={styles.destName}>{d.name}</div>
                  <div style={styles.destSub}>{d.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={styles.smallTitle}>Top Authors</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topAuthors.map((a, i) => {
                const isFollowed = followedAuthors.includes(a.name);
                return (
                  <div key={i} style={styles.topAuthor}>
                    <img src={a.avatar} alt={a.name} style={styles.topAuthorAvatar} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0a6" }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{a.followers} followers</div>
                    </div>
                    <button
                      onClick={() => handleFollow(a.name)}
                      style={{
                        ...styles.followBtn,
                        background: isFollowed ? "#0a98a7" : "#eef9fb",
                        color: isFollowed ? "#fff" : "#0a98a7",
                        border: isFollowed ? "1px solid #0a98a7" : "1px solid #e6f6f9",
                      }}
                    >
                      {isFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Recommended */}
      <section style={styles.recommendedSection}>
        <h3 style={styles.recommendedTitle}>Recommended For You</h3>
        <div style={styles.recommendedGrid}>
          {recommendedBlogs.length === 0 && <div style={{ color: "#98a" }}>No recommendations yet</div>}
          {recommendedBlogs.map((p, i) => (
            <div key={i} style={styles.recoCard}>
              <img src={p.image} alt={p.title} style={styles.recoImg} />
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, color: "#0a6" }}>{p.title}</div>
                <div style={{ color: "#666", margin: "6px 0" }}>{p.author}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {p.tags.map((t) => (
                    <div style={styles.tagChip} key={t}>
                      {t}
                    </div>
                  ))}
                </div>
                <button style={styles.readBtnSmall} onClick={() => openModal(p)}>
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && modalBlog && (
        <div style={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true">
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalBlog.image} alt={modalBlog.title} style={styles.modalImage} />
            <h2 style={styles.modalTitle}>{modalBlog.title}</h2>
            <div style={styles.modalMeta}>
              <img src={modalBlog.avatar} alt={modalBlog.author} style={styles.authorAvatarSmall} />
              <div style={{ marginLeft: 10, textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>{modalBlog.author}</div>
                <div style={{ color: "#888", fontSize: 13 }}>{modalBlog.createdAt ? new Date(modalBlog.createdAt).toLocaleDateString() : ""}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  style={{
                    ...styles.followBtn,
                    background: followedAuthors.includes(modalBlog.author) ? "#0a98a7" : "#eef9fb",
                    color: followedAuthors.includes(modalBlog.author) ? "#fff" : "#0a98a7",
                  }}
                  onClick={() => handleFollow(modalBlog.author)}
                >
                  {followedAuthors.includes(modalBlog.author) ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            <p style={styles.modalDesc}>{modalBlog.details}</p>

            <div style={styles.modalExtras}>
              <div>
                <strong>Location:</strong> {modalBlog.location}
              </div>
              <div>
                <strong>Travel Tips:</strong> {modalBlog.tips}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button style={styles.closeBtn} onClick={closeModal}>
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
  Styles (JS object + small global css)
-------------------------------*/
const globalCSS = `
@keyframes heartPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.45); }
  60% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.heart-pop { animation: heartPop 0.65s cubic-bezier(.17,.67,.83,.67); color: #e53935; }
@media (max-width: 900px) {
  .blog-card { flex-direction: column !important; }
}
`;

const styles = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial",
    background: "linear-gradient(180deg,#f7fbfc 0%, #ecfbff 100%)",
    minHeight: "100vh",
    padding: 28,
    boxSizing: "border-box",
    color: "#08384a",
  },
  header: {
    marginBottom: 18,
  },
  headerText: {
    maxWidth: 1100,
  },
  title: {
    fontSize: 44,
    margin: 0,
    color: "#0b6270",
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "#2b575e",
    fontSize: 16,
    opacity: 0.9,
  },
  mainLayout: {
    display: "flex",
    gap: 28,
    alignItems: "flex-start",
    maxWidth: 1200,
  },
  leftPane: {
    flex: 2,
    minWidth: 480,
  },
  rightPane: {
    flex: 1,
    minWidth: 300,
  },

  /* Loading */
  loadingContainer: {
    background: "#fff",
    padding: 28,
    borderRadius: 18,
    boxShadow: "0 4px 20px rgba(10,50,60,0.06)",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  loadingSpinner: {
    fontSize: 26,
  },
  loadingText: {
    color: "#0a7",
    fontWeight: 600,
  },

  /* Blog list */
  blogList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  blogCard: {
    display: "flex",
    gap: 20,
    background: "#ffffff",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 6px 24px rgba(15,50,60,0.06)",
    alignItems: "flex-start",
  },
  cardLeft: {
    width: 140,
    flexShrink: 0,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    objectFit: "cover",
    display: "block",
  },
  cardRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 22,
    margin: 0,
    color: "#0b6270",
    fontWeight: 700,
  },
  trending: {
    background: "linear-gradient(90deg,#ff8a00,#ff4d4d)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginLeft: 6,
  },
  metaRow: {
    color: "#698",
    fontSize: 13,
    marginTop: 2,
  },
  metaDate: {},
  metaAuthor: {},

  cardDesc: {
    margin: 0,
    color: "#455",
    lineHeight: 1.5,
    maxWidth: "100%",
  },

  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },

  authorRow: {
    display: "flex",
    alignItems: "center",
  },
  authorAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ecfbff",
  },
  authorName: {
    color: "#0b6270",
    fontWeight: 700,
  },

  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    background: "#eef9fb",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    color: "#234",
  },
  copied: {
    background: "#e8f7f8",
    padding: "6px 10px",
    borderRadius: 10,
    color: "#0a7",
    fontSize: 13,
  },

  commentBox: {
    marginTop: 12,
    background: "#f2fbfc",
    padding: 12,
    borderRadius: 10,
  },
  commentList: {
    maxHeight: 90,
    overflowY: "auto",
    marginBottom: 8,
  },
  commentItem: {
    marginBottom: 6,
    color: "#254",
    fontSize: 14,
  },
  commentInputRow: {
    display: "flex",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #dff5f7",
  },
  commentBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#0a98a7",
    color: "#fff",
    cursor: "pointer",
  },

  readRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  readLink: {
    background: "transparent",
    border: "none",
    color: "#0b6270",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
  },

  /* Right pane: destinations */
  rightTitle: {
    color: "#0b6270",
    fontSize: 20,
    margin: "0 0 16px 0",
    fontWeight: 700,
  },
  destList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  destCard: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(10,50,60,0.06)",
    cursor: "pointer",
    minHeight: 110,
  },
  destImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    filter: "brightness(0.9)",
  },
  destOverlay: {
    position: "absolute",
    bottom: 12,
    left: 16,
    color: "#fff",
    textShadow: "0 6px 18px rgba(0,0,0,0.4)",
  },
  destName: {
    fontSize: 20,
    fontWeight: 800,
  },
  destSub: {
    fontSize: 13,
    marginTop: 4,
  },

  /* recommended */
  recommendedSection: {
    marginTop: 28,
    maxWidth: 1200,
  },
  recommendedTitle: {
    color: "#0b6270",
    fontSize: 20,
    marginBottom: 12,
  },
  recommendedGrid: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  recoCard: {
    display: "flex",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(10,50,60,0.05)",
    minWidth: 240,
    maxWidth: 300,
    overflow: "hidden",
  },
  recoImg: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 12,
  },
  tagChip: {
    background: "#eef9fb",
    color: "#0a98a7",
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
  },
  readBtnSmall: {
    background: "#0a98a7",
    color: "#fff",
    border: "none",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },

  /* top authors small */
  topAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 8,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 14px rgba(10,50,60,0.04)",
  },
  topAuthorAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
  },

  followBtn: {
    borderRadius: 12,
    padding: "6px 12px",
    border: "1px solid #e6f6f9",
    cursor: "pointer",
    fontWeight: 700,
  },

  /* modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 720,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 40px rgba(5,25,30,0.4)",
  },
  modalImage: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    borderRadius: 12,
  },
  modalTitle: {
    marginTop: 12,
    color: "#0b6270",
    fontSize: 24,
  },
  modalMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  modalDesc: {
    marginTop: 12,
    color: "#334",
    lineHeight: 1.6,
  },
  modalExtras: {
    marginTop: 12,
    display: "grid",
    gap: 8,
  },
  closeBtn: {
    padding: "10px 18px",
    background: "#0a98a7",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Explore;
