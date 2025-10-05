import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #eee" };
const td = { padding: 10, borderBottom: "1px solid #f3f3f3" };
const card = { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", cursor: "pointer" };
const label = { color: "#678", fontSize: 13 };
const value = { color: "#0b6270", fontSize: 24, fontWeight: 700 };
const panel = { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };
const panelTitle = { margin: "0 0 8px 0", color: "#0b6270" };

function AdminAnalytics({ refreshSignal }) {
  const [data, setData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [showBlogs, setShowBlogs] = useState(false);
  const token = localStorage.getItem("token");

  const loadAnalytics = async () => {
    const res = await fetch("http://localhost:5000/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) setData(json);
  };

  const loadBlogs = async () => {
    const res = await fetch("http://localhost:5000/api/admin/blogs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) setBlogs(json);
  };

  useEffect(() => { loadAnalytics(); }, [token]);
  useEffect(() => { if (showBlogs) loadBlogs(); }, [refreshSignal, showBlogs]);

  if (!data) return <div style={{ padding: 16 }}>Loading analytics…</div>;

  const signups = data.charts.signups.map(s => ({ month: `${s._id.y}-${String(s._id.m).padStart(2,'0')}`, count: s.count }));
  const blogsByCategory = data.charts.blogsByCategory.map(c => ({ category: c._id || "Uncategorized", count: c.count }));

  const handleShowBlogs = () => { loadBlogs(); setShowBlogs(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    const res = await fetch(`http://localhost:5000/api/admin/blogs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setBlogs(prev => prev.filter(b => b._id !== id));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin · Analytics</h2>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={card}><div style={label}>Total Users</div><div style={value}>{data.totals.totalUsers}</div></div>
        <div style={card}><div style={label}>Active Users</div><div style={value}>{data.totals.activeUsers}</div></div>
        <div style={card}><div style={label}>New Signups (this month)</div><div style={value}>{data.totals.newSignupsThisMonth}</div></div>
        <div style={card} onClick={handleShowBlogs}>
          <div style={label}>Total Blogs</div>
          <div style={value}>{data.totals.totalBlogs}</div>
          <div style={{ color: "#0a98a7", fontSize: 12 }}>Click to view</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <div style={panel}>
          <h3 style={panelTitle}>New signups per month</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={signups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0a98a7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={panel}>
          <h3 style={panelTitle}>Blogs by category</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={blogsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff8a00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      {showBlogs && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3>All Blogs</h3>
            <button onClick={() => setShowBlogs(false)}>Close</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Title</th>
                  <th style={th}>Author</th>
                  <th style={th}>Date</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? <tr><td colSpan={4} style={{ padding: 20 }}>No blogs</td></tr> :
                  blogs.map(b => (
                    <tr key={b._id}>
                      <td style={td}>{b.title}</td>
                      <td style={td}>{b.username}</td>
                      <td style={td}>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td style={td}>
                        <button onClick={() => handleDelete(b._id)} style={{ color: "#a33" }}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
