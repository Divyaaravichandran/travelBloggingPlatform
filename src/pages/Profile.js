import React, { useEffect, useState } from "react";
import "./profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [bannerPic, setBannerPic] = useState(
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600"
  );

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          console.log("User data received:", data);
          setUser(data);
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPic(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("http://localhost:5000/api/auth/update-profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Profile picture updated successfully!");
        // Refresh user data
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData);
        }
      } else {
        alert(data.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error("Error updating profile picture:", err);
      alert("Error updating profile picture");
    }
  };

  // Function to refresh blogs
  const refreshBlogs = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/user/${user._id}`);
      const data = await response.json();
      
      if (response.ok) {
        const transformedBlogs = data.map(post => ({
          id: post._id,
          thumbnail: post.image ? `http://localhost:5000/uploads/posts/${post.image}` : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
          title: post.title,
          description: post.description,
          likes: post.likes || 0,
          comments: post.comments ? post.comments.length : 0,
        }));
        
        setBlogs(transformedBlogs);
      }
    } catch (err) {
      console.error("Error refreshing blogs:", err);
    }
  };

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:5000/api/posts/user/${user._id}`);
        const data = await response.json();
        
        if (response.ok) {
          // Transform API data to match our UI structure
          const transformedBlogs = data.map(post => ({
            id: post._id,
            thumbnail: post.image ? `http://localhost:5000/uploads/posts/${post.image}` : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
            title: post.title,
            description: post.description,
            likes: post.likes || 0,
            comments: post.comments ? post.comments.length : 0,
          }));
          
          setBlogs(transformedBlogs);
        } else {
          console.error("Failed to fetch user posts:", data.message);
          // Fallback to dummy data
          setBlogs([
            {
              id: 1,
              thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
              title: "Exploring the Alps",
              description: "A breathtaking journey through the snowy peaks.",
              likes: 120,
              comments: 45,
            },
            {
              id: 2,
              thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
              title: "Sunsets in Bali",
              description: "Golden sands and stunning sunsets by the sea.",
              likes: 95,
              comments: 30,
            },
            {
              id: 3,
              thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
              title: "New York City Vibes",
              description: "The city that never sleeps, explored in 3 days.",
              likes: 150,
              comments: 60,
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        // Fallback to dummy data
        setBlogs([
          {
            id: 1,
            thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
            title: "Exploring the Alps",
            description: "A breathtaking journey through the snowy peaks.",
            likes: 120,
            comments: 45,
          },
          {
            id: 2,
            thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            title: "Sunsets in Bali",
            description: "Golden sands and stunning sunsets by the sea.",
            likes: 95,
            comments: 30,
          },
          {
            id: 3,
            thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
            title: "New York City Vibes",
            description: "The city that never sleeps, explored in 3 days.",
            likes: 150,
            comments: 60,
          },
        ]);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchUserPosts();
  }, [user]);

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
                : "https://via.placeholder.com/120"
            }
            alt="Profile"
            className="profile-pic"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/120";
              console.log("Profile picture failed to load:", user?.profilePicture);
            }}
          />
          <label className="profile-pic-upload-btn">
            <i className="fas fa-camera"></i>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
          </label>
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
          <h3>{loadingBlogs ? "..." : blogs.length}</h3>
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
        {loadingBlogs ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
            <p style={{ color: '#0097a7' }}>Loading your blogs...</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>No blogs yet. Create your first post!</p>
              </div>
            ) : (
              blogs.map((blog) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
