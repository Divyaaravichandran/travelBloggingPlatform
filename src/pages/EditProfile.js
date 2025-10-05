import React, { useEffect, useState } from "react";

function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", phone: "", country: "", bio: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setForm({
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            country: data.country || "",
            bio: data.bio || "",
          });
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchMe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");
    setSaving(true);
    try {
      const parseJsonSafe = async (res) => {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try { return await res.json(); } catch (_) { return { message: res.statusText }; }
        }
        const text = await res.text();
        return { message: text };
      };
      // 1) Update basic info (POST for compatibility)
      console.log("Sending form data:", form);
      const infoRes = await fetch("http://localhost:5000/api/auth/update-profile-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const infoData = await parseJsonSafe(infoRes);
      if (!infoRes.ok) {
        if (infoRes.status === 401) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
          return;
        }
        return alert((infoData && infoData.message) || `Failed to update profile details (status ${infoRes.status})`);
      }

      // 2) Optional avatar upload
      if (avatarFile) {
        const fd = new FormData();
        fd.append("profilePicture", avatarFile);
        const picRes = await fetch("http://localhost:5000/api/auth/update-profile-picture", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const picData = await parseJsonSafe(picRes);
        if (!picRes.ok) {
          return alert((picData && picData.message) || `Failed to upload profile picture (status ${picRes.status})`);
        }
      }

      alert("Profile updated successfully");
      window.location.href = "/profile";
    } catch (err) {
      alert(err?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f5f7fa,#c3cfe2)", padding: 20 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ margin: 0, color: "#0b6270" }}>Edit Profile</h1>
          <p style={{ color: "#456" }}>Update your information and profile picture</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 24 }}>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Username</label>
                  <input name="username" value={form.username} onChange={handleChange} required style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #dbeafe" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #dbeafe" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #dbeafe" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Country</label>
                  <input name="country" value={form.country} onChange={handleChange} required style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #dbeafe" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Bio</label>
                <textarea 
                  name="bio" 
                  value={form.bio} 
                  onChange={handleChange} 
                  rows="3"
                  placeholder="Tell us about yourself..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #dbeafe", resize: "vertical", minHeight: "80px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Profile Picture</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <div style={{ color: "#678", fontSize: 13, marginTop: 6 }}>Accepted: jpg, png, webp, gif. Max 5MB.</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => (window.location.href = "/profile")} style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 16px", border: "none", borderRadius: 10, background: "#0a98a7", color: "#fff", fontWeight: 600 }}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProfile;


