import React, { useState } from "react";

const initialBlogPosts = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    title: "Sunrise in Bali",
    description: "Experience the magical sunrise over Bali's lush landscapes. Discover hidden gems and local traditions.",
    author: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    likes: 120,
    comments: 0,
    details: "Bali is renowned for its stunning sunrises, lush rice terraces, and vibrant culture. In this blog, we explore the best spots to catch the sunrise, local traditions, and tips for travelers.",
    location: "Bali, Indonesia",
    tips: "Arrive early for sunrise, bring a camera, respect local customs.",
    commentList: [],
    tags: ["Nature", "Asia", "Sunrise"],
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    title: "Alpine Adventures",
    description: "Hiking the breathtaking Alps with local guides. Explore scenic trails and enjoy authentic mountain cuisine.",
    author: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    likes: 98,
    comments: 0,
    details: "The Alps offer some of the most scenic hiking trails in the world. Join us as we trek through picturesque villages, sample mountain cuisine, and share tips for safe hiking.",
    location: "Swiss Alps",
    tips: "Pack layers, check weather, hire a local guide.",
    commentList: [],
    tags: ["Adventure", "Europe", "Mountains"],
  },
];

const carouselDestinations = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    name: "Maldives",
  },
  {
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    name: "Santorini",
  },
  {
    image: "https://images.unsplash.com/photo-1465156799763-2c087c332922",
    name: "Kyoto",
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

function Explore() {
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlog, setModalBlog] = useState(null);
  const [activeCommentIdx, setActiveCommentIdx] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [shareMsgIdx, setShareMsgIdx] = useState(null);
  const [followedAuthors, setFollowedAuthors] = useState([]);

  const handleLike = (idx) => {
    setBlogPosts((posts) =>
      posts.map((post, i) =>
        i === idx ? { ...post, likes: post.likes + 1, heartPop: true } : post
      )
    );
    setTimeout(() => {
      setBlogPosts((posts) =>
        posts.map((post, i) =>
          i === idx ? { ...post, heartPop: false } : post
        )
      );
    }, 700);
  };

  const handleCommentToggle = (idx) => {
    setActiveCommentIdx(activeCommentIdx === idx ? null : idx);
    setCommentInput("");
  };

  const handleCommentSubmit = (idx) => {
    if (commentInput.trim() === "") return;
    setBlogPosts((posts) =>
      posts.map((post, i) =>
        i === idx
          ? {
              ...post,
              comments: post.comments + 1,
              commentList: [...post.commentList, commentInput],
            }
          : post
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
    setFavorites((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleShare = (idx) => {
    const url = window.location.origin + "/blog/" + idx;
    navigator.clipboard.writeText(url);
    setShareMsgIdx(idx);
    setTimeout(() => setShareMsgIdx(null), 1200);
  };

  const handleFollow = (author) => {
    setFollowedAuthors((prev) =>
      prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]
    );
  };

  const recommendedBlogs = blogPosts.filter(post =>
    post.tags.some(tag => userInterests.includes(tag))
  );

  return (
    <div style={styles.page}>
      <style>{responsiveCSS}</style>
      <style>{heartPopCSS}</style>
      <style>{carouselAnim}</style>

      <div style={styles.mainLayout}>
        <div style={styles.leftPane}>
          <h2 style={styles.sectionTitle}>Explore Blogs</h2>
          <div style={styles.blogList}>
            {blogPosts.map((post, idx) => {
              const isFavorite = favorites.includes(idx);
              const isTrending = post.likes >= 100;
              const isFollowed = followedAuthors.includes(post.author);
              return (
                <div key={idx} style={styles.blogCard}>
                  <div style={{ display: "flex", flexDirection: "column", flex: "none", alignItems: "center", minWidth: "140px" }}>
                    <img src={post.image} alt={post.title} style={styles.blogImg} />
                    <div style={styles.authorBlock}>
                      <img src={post.avatar} alt={post.author} style={styles.avatar} />
                      <span style={styles.authorName}>{post.author}</span>
                      <button
                        style={{
                          ...styles.followBtn,
                          background: isFollowed ? "#0097a7" : "#e0f7fa",
                          color: isFollowed ? "#fff" : "#0097a7",
                          border: isFollowed ? "1px solid #0097a7" : "1px solid #e0f7fa",
                          marginLeft: 0,
                          marginTop: "6px",
                          marginBottom: "6px",
                        }}
                        onClick={() => handleFollow(post.author)}
                        aria-label="Follow"
                      >
                        {isFollowed ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                  <div style={styles.blogContent}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={styles.blogTitle}>{post.title}</h3>
                      {isTrending && (
                        <span style={styles.trendingBadge}>
                          🔥 Trending
                        </span>
                      )}
                    </div>
                    <p style={styles.blogDesc}>{post.description}</p>
                    <div style={styles.blogMeta}>
                      <button
                        style={styles.iconBtn}
                        onClick={() => handleLike(idx)}
                        aria-label="Like"
                      >
                        <span
                          className={post.heartPop ? "heart-pop" : ""}
                          style={{
                            color: post.heartPop ? "#e53935" : "#888",
                            fontSize: "18px",
                            marginRight: "4px",
                            transition: "color 0.2s",
                          }}
                        >
                          ❤️
                        </span>
                        {post.likes}
                      </button>
                      <button
                        style={styles.iconBtn}
                        onClick={() => handleCommentToggle(idx)}
                        aria-label="Comment"
                      >
                        <span style={{ fontSize: "18px", marginRight: "4px" }}>💬</span>
                        {post.comments}
                      </button>
                      <button
                        style={{
                          ...styles.iconBtn,
                          color: isFavorite ? "#ff9800" : "#888",
                          background: isFavorite ? "#fff3e0" : "#e0f7fa",
                          border: isFavorite ? "1px solid #ff9800" : "none",
                        }}
                        onClick={() => handleFavorite(idx)}
                        aria-label="Bookmark"
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <span style={{ fontSize: "18px", marginRight: "4px" }}>
                          {isFavorite ? "★" : "☆"}
                        </span>
                      </button>
                      <button
                        style={styles.iconBtn}
                        onClick={() => handleShare(idx)}
                        aria-label="Share"
                        title="Copy link"
                      >
                        <span style={{ fontSize: "18px", marginRight: "4px" }}>🔗</span>
                      </button>
                      {shareMsgIdx === idx && (
                        <span style={styles.shareMsg}>Link copied!</span>
                      )}
                    </div>
                    {activeCommentIdx === idx && (
                      <div style={styles.commentSection}>
                        <div style={styles.commentList}>
                          {post.commentList.length === 0 && (
                            <div style={{ color: "#aaa", fontSize: "14px" }}>No comments yet.</div>
                          )}
                          {post.commentList.map((c, i) => (
                            <div key={i} style={styles.commentItem}>
                              <span style={{ color: "#0097a7", fontWeight: 500 }}>User:</span> {c}
                            </div>
                          ))}
                        </div>
                        <div style={styles.commentInputRow}>
                          <input
                            style={styles.commentInput}
                            type="text"
                            value={commentInput}
                            placeholder="Add a comment..."
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCommentSubmit(idx);
                            }}
                          />
                          <button
                            style={styles.commentSubmitBtn}
                            onClick={() => handleCommentSubmit(idx)}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      style={styles.readMoreBtn}
                      onClick={() => openModal(post)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.rightPane}>
          <h2 style={styles.sectionTitle}>Featured Destinations</h2>
          <div style={styles.carouselWrapper}>
            <div style={styles.carouselTrack}>
              {[...carouselDestinations, ...carouselDestinations].map((dest, idx) => (
                <div key={idx} style={styles.carouselItem}>
                  <img src={dest.image} alt={dest.name} style={styles.carouselImg} />
                  <div style={styles.carouselOverlay}>
                    <span style={styles.carouselText}>{dest.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recommended For You</h2>
        <div style={styles.recommendedList}>
          {recommendedBlogs.length === 0 && (
            <div style={{ color: "#aaa", fontSize: "15px" }}>No recommendations yet.</div>
          )}
          {recommendedBlogs.map((post, idx) => {
            const isFollowed = followedAuthors.includes(post.author);
            return (
              <div key={idx} style={styles.recommendedCard}>
                <img src={post.image} alt={post.title} style={styles.recommendedImg} />
                <div style={styles.recommendedContent}>
                  <h4 style={styles.recommendedTitle}>{post.title}</h4>
                  <span style={styles.recommendedAuthor}>{post.author}</span>
                  <button
                    style={{
                      ...styles.followBtn,
                      background: isFollowed ? "#0097a7" : "#e0f7fa",
                      color: isFollowed ? "#fff" : "#0097a7",
                      border: isFollowed ? "1px solid #0097a7" : "1px solid #e0f7fa",
                      marginBottom: "6px",
                    }}
                    onClick={() => handleFollow(post.author)}
                    aria-label="Follow"
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                  <span style={styles.recommendedTags}>
                    {post.tags.map(tag => (
                      <span key={tag} style={styles.tagChip}>{tag}</span>
                    ))}
                  </span>
                  <button style={styles.readMoreBtn} onClick={() => openModal(post)}>Read More</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Authors</h2>
        <div style={styles.authorsList}>
          {topAuthors.map((author, idx) => {
            const isFollowed = followedAuthors.includes(author.name);
            return (
              <div key={idx} style={styles.authorCard}>
                <img src={author.avatar} alt={author.name} style={styles.authorAvatar} />
                <div style={styles.authorInfo}>
                  <span style={styles.authorNameBig}>{author.name}</span>
                  <span style={styles.authorFollowers}>{author.followers} followers</span>
                  <span style={styles.authorBio}>{author.bio}</span>
                  <span style={styles.authorFeatured}>
                    <strong>Featured:</strong> {author.featured}
                  </span>
                  <button
                    style={{
                      ...styles.followBtn,
                      background: isFollowed ? "#0097a7" : "#e0f7fa",
                      color: isFollowed ? "#fff" : "#0097a7",
                      border: isFollowed ? "1px solid #0097a7" : "1px solid #e0f7fa",
                      marginTop: "8px",
                    }}
                    onClick={() => handleFollow(author.name)}
                    aria-label="Follow"
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && modalBlog && (
        <div
          style={{
            ...styles.modalOverlay,
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "80px",
            paddingBottom: "80px",
            overflowY: "auto",
            minHeight: "100vh",
            boxSizing: "border-box",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              ...styles.modalContent,
              maxHeight: "calc(100vh - 160px)",
              overflowY: "auto",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              borderRadius: "24px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={modalBlog.image}
              alt={modalBlog.title}
              style={{
                width: "100%",
                maxHeight: "220px",
                objectFit: "cover",
                borderRadius: "24px",
                marginBottom: "18px",
                marginTop: "18px",
                display: "block",
              }}
            />
            <h2 style={styles.modalTitle}>{modalBlog.title}</h2>
            <div style={styles.modalAuthor}>
              <img src={modalBlog.avatar} alt={modalBlog.author} style={styles.avatar} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={styles.authorName}>{modalBlog.author}</span>
                <button
                  style={{
                    ...styles.followBtn,
                    marginTop: "6px",
                    marginLeft: 0,
                  }}
                  onClick={() => handleFollow(modalBlog.author)}
                  aria-label="Follow"
                >
                  {followedAuthors.includes(modalBlog.author) ? "Following" : "Follow"}
                </button>
              </div>
            </div>
            <p style={styles.modalDesc}>{modalBlog.details}</p>
            <div style={styles.modalDetails}>
              <div><strong>Location:</strong> {modalBlog.location}</div>
              <div><strong>Travel Tips:</strong> {modalBlog.tips}</div>
            </div>
            <button style={styles.closeBtn} onClick={closeModal}>Close</button>
            <style>
              {`
                div[style*="overflowY: auto"]::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
}

const carouselAnim = `
@keyframes verticalScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
`;

const heartPopCSS = `
.heart-pop {
  animation: heartPop 0.7s cubic-bezier(.17,.67,.83,.67);
}
@keyframes heartPop {
  0% { transform: scale(1); color: #e53935; }
  30% { transform: scale(1.5); color: #e53935; }
  60% { transform: scale(1.2); color: #e53935; }
  100% { transform: scale(1); color: #e53935; }
}
`;

const responsiveCSS = `
@media (max-width: 900px) {
  .main-layout { flex-direction: column; }
  .left-pane, .right-pane { max-width: 100% !important; min-width: 0 !important; }
  .carousel-wrapper { height: 260px !important; }
}
@media (max-width: 600px) {
  .blog-card { flex-direction: column !important; min-height: 0 !important; }
  .blog-img { width: 100% !important; height: 160px !important; }
  .blog-content { padding: 12px !important; }
  .carousel-item { height: 120px !important; margin: 8px 0 !important; }
  .carousel-wrapper { height: 180px !important; }
  .section-title { font-size: 1.2rem !important; }
}
`;

const styles = {
  page: {
    fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%)",
    minHeight: "100vh",
    padding: "24px",
    boxSizing: "border-box",
    position: "relative",
  },
  section: {
    marginBottom: "32px",
    marginTop: "32px",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "18px",
    color: "#0097a7",
    letterSpacing: "1px",
    className: "section-title",
  },
  recommendedList: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  recommendedCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    minWidth: "260px",
    maxWidth: "320px",
  },
  recommendedImg: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "16px 0 0 16px",
  },
  recommendedContent: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  recommendedTitle: {
    fontWeight: 600,
    fontSize: "16px",
    color: "#0097a7",
    marginBottom: "4px",
  },
  recommendedAuthor: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "4px",
  },
  recommendedTags: {
    marginBottom: "8px",
  },
  tagChip: {
    background: "#e0f7fa",
    color: "#0097a7",
    borderRadius: "8px",
    padding: "2px 8px",
    fontSize: "13px",
    marginRight: "4px",
    fontWeight: 500,
    display: "inline-block",
  },
  followBtn: {
    borderRadius: "12px",
    padding: "4px 16px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    border: "1px solid #e0f7fa",
    marginLeft: "6px",
    transition: "background 0.2s, color 0.2s, border 0.2s",
  },
  authorBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "10px 0 0 0",
  },
  mainLayout: {
    display: "flex",
    gap: "32px",
    marginBottom: "40px",
    flexWrap: "wrap",
    className: "main-layout",
  },
  leftPane: {
    flex: 2,
    minWidth: "320px",
    maxWidth: "900px",
    overflowY: "auto",
    paddingRight: "8px",
    className: "left-pane",
  },
  rightPane: {
    flex: 1,
    minWidth: "260px",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    className: "right-pane",
  },
  blogList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxHeight: "600px",
    overflowY: "auto",
  },
  blogCard: {
    display: "flex",
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
    overflow: "hidden",
    transition: "transform 0.2s",
    minHeight: "170px",
    className: "blog-card",
  },
  blogImg: {
    width: "140px",
    height: "100%",
    objectFit: "cover",
    className: "blog-img",
  },
  blogContent: {
    flex: 1,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    className: "blog-content",
  },
  blogTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    margin: "0 0 8px 0",
    color: "#0097a7",
  },
  trendingBadge: {
    background: "linear-gradient(90deg, #ff9800 0%, #ff5722 100%)",
    color: "#fff",
    borderRadius: "12px",
    padding: "2px 10px",
    fontWeight: 600,
    fontSize: "13px",
    marginLeft: "6px",
    boxShadow: "0 1px 4px rgba(255,152,0,0.12)",
    letterSpacing: "1px",
    display: "inline-block",
  },
  blogDesc: {
    fontSize: "15px",
    color: "#555",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
    maxHeight: "3.2em",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  blogMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e0f7fa",
  },
  authorName: {
    fontWeight: 500,
    color: "#0097a7",
    fontSize: "15px",
  },
  iconBtn: {
    fontSize: "14px",
    color: "#888",
    background: "#e0f7fa",
    borderRadius: "12px",
    padding: "2px 8px",
    border: "none",
    cursor: "pointer",
    marginLeft: "4px",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },
  shareMsg: {
    fontSize: "13px",
    color: "#0097a7",
    background: "#e0f7fa",
    borderRadius: "8px",
    padding: "2px 8px",
    marginLeft: "6px",
    fontWeight: 500,
    animation: "fadeIn 0.3s",
  },
  readMoreBtn: {
    alignSelf: "flex-start",
    background: "linear-gradient(90deg, #00bcd4 0%, #0097a7 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "8px 20px",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    transition: "background 0.2s",
    marginTop: "8px",
  },
  commentSection: {
    background: "#f1f8fb",
    borderRadius: "12px",
    padding: "12px",
    margin: "8px 0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  commentList: {
    maxHeight: "80px",
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
  commentSubmitBtn: {
    background: "#0097a7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
  },
  carouselWrapper: {
    height: "400px",
    width: "100%",
    overflow: "hidden",
    borderRadius: "18px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
    background: "linear-gradient(180deg, #e0f7fa 0%, #fff 100%)",
    position: "relative",
    className: "carousel-wrapper",
  },
  carouselTrack: {
    display: "flex",
    flexDirection: "column",
    animation: "verticalScroll 12s linear infinite",
    height: "800px",
  },
  carouselItem: {
    position: "relative",
    height: "160px",
    margin: "12px 18px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.3s",
    className: "carousel-item",
  },
  carouselImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    padding: "12px",
    textAlign: "center",
  },
  carouselText: {
    fontSize: "1.2rem",
    fontWeight: 600,
    letterSpacing: "1px",
  },
  authorsList: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  authorCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    minWidth: "260px",
    maxWidth: "320px",
    padding: "16px",
    alignItems: "center",
  },
  authorAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "16px",
    border: "2px solid #e0f7fa",
  },
  authorInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  authorNameBig: {
    fontWeight: 700,
    fontSize: "17px",
    color: "#0097a7",
  },
  authorFollowers: {
    fontSize: "14px",
    color: "#888",
  },
  authorBio: {
    fontSize: "14px",
    color: "#555",
  },
  authorFeatured: {
    fontSize: "14px",
    color: "#0097a7",
    marginTop: "4px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    padding: "32px",
    maxWidth: "420px",
    width: "90vw",
    textAlign: "center",
    position: "relative",
    animation: "fadeIn 0.3s",
  },
  modalImg: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "cover",
    borderRadius: "24px",
    marginBottom: "18px",
    marginTop: "18px",
    display: "block",
  },
  modalTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#0097a7",
    marginBottom: "8px",
  },
  modalAuthor: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  modalDesc: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "18px",
    lineHeight: "1.5",
  },
  modalDetails: {
    fontSize: "15px",
    color: "#444",
    marginBottom: "18px",
    textAlign: "left",
  },
  closeBtn: {
    background: "#0097a7",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "8px 24px",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
};

export default Explore;