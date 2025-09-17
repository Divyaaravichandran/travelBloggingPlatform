import React, { useEffect, useState } from "react";
import "./profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [bannerPic, setBannerPic] = useState(
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    country: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Debug: track modal state changes
  useEffect(() => {
    console.log("isEditModalOpen:", isEditModalOpen);
  }, [isEditModalOpen]);

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
        if (response.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
          return;
        }
        alert(data.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error("Error updating profile picture:", err);
      alert(err.message || "Error updating profile picture");
    }
  };

  // Handle edit profile modal
  const openEditModal = () => {
    console.log("Edit Profile clicked");
    alert("Opening Edit Profile");
    if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || ''
      });
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm({
      username: '',
      email: '',
      phone: '',
      country: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setUser(data.user);
        closeEditModal();
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    } finally {
      setIsUpdating(false);
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
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="edit-btn" type="button" onClick={() => (window.location.href = "/profile/edit")}>Edit Profile</button>
            {localStorage.getItem('token') ? (
              <button className="edit-btn" type="button" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Logout</button>
            ) : (
              <button className="edit-btn" type="button" onClick={() => (window.location.href = '/login')}>Login</button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-box">
          <h3>{loadingBlogs ? "..." : blogs.length}</h3>
          <p>Blogs</p>
        </div>
        <div className="stat-box">
          <h3>{user?.followers ? user.followers.length : 0}</h3>
          <p>Followers</p>
        </div>
        <div className="stat-box">
          <h3>{user?.following ? user.following.length : 0}</h3>
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={editForm.country}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeEditModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="save-btn">
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
