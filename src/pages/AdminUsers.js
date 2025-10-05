import React, { useEffect, useState } from "react";

function AdminUsers({ onUserStatusChange }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    const res = await fetch(`http://localhost:5000/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [sort]);

  const handleSuspend = async (id) => {
    const res = await fetch(`http://localhost:5000/api/admin/users/${id}/suspend`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: data.status } : u));
      if (onUserStatusChange) onUserStatusChange(); // notify Analytics to refresh blogs
    } else alert(data.message || "Failed to update user");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin · Users</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email" />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="username">Name A→Z</option>
          <option value="-username">Name Z→A</option>
        </select>
        <button onClick={fetchUsers}>Search</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5}>Loading...</td></tr> :
              users.length === 0 ? <tr><td colSpan={5}>No users</td></tr> :
                users.map(u => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>{u.status}</td>
                    <td>
                      <button onClick={() => handleSuspend(u._id)}>
                        {u.status === "suspended" ? "Activate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
