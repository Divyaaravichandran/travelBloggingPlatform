import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerPic, setBannerPic] = useState(
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600"
  );

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch user data");
          if (response.status === 401) {
            // Token is invalid, redirect to login
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } catch (err) {
        setError("Error connecting to server. Please try again.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPic(URL.createObjectURL(file));
    }
  };

  // Default profile picture
  const defaultProfilePic = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face";

  // Dummy blogs
  const blogs = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
      title: "Exploring the Alps",
      description: "A breathtaking journey through the snowy peaks.",
      likes: 120,
      comments: 45,
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      title: "Sunsets in Bali",
      description: "Golden sands and stunning sunsets by the sea.",
      likes: 95,
      comments: 30,
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
      title: "New York City Vibes",
      description: "The city that never sleeps, explored in 3 days.",
      likes: 150,
      comments: 60,
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading profile...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#d32f2f'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => navigate("/login")}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Cover Banner */}
      <div className="profile-banner" style={{ backgroundImage: `url(${bannerPic})` }}>
        <div className="banner-overlay"></div>
        <label className="banner-upload-btn">
          <i className="fas fa-camera"></i>
          <input type="file" accept="image/*" onChange={handleBannerChange} />
        </label>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-pic-container">
          <img
            src={
              user?.profilePicture
                ? `http://localhost:5000/uploads/${user.profilePicture}`
                : defaultProfilePic
            }
            alt="Profile"
            className="profile-pic"
          />
        </div>

        <div className="profile-info">
          <h2 className="username">{user?.username || "Username"}</h2>
          <p className="bio">🌍 Traveler | 📸 Photographer | ✈️ Adventure Seeker</p>
          <button className="edit-btn">Edit Profile</button>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-box">
          <h3>12</h3>
          <p>Blogs</p>
        </div>
        <div className="stat-box">
          <h3>250</h3>
          <p>Followers</p>
        </div>
        <div className="stat-box">
          <h3>180</h3>
          <p>Following</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="social-links">
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="https://mywebsite.com" target="_blank" rel="noreferrer">
          <i className="fas fa-link"></i>
        </a>
      </div>

      {/* Blogs */}
      <div className="blogs-section">
        <h2 className="blogs-title">My Blogs</h2>
        <div className="blogs-grid">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <img src={blog.thumbnail} alt={blog.title} className="blog-thumb" />
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-desc">{blog.description}</p>
                <div className="blog-meta">
                  <span>❤️ {blog.likes}</span>
                  <span>💬 {blog.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
