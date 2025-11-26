// App.jsx
import './App.css';
import axios from "axios";
import { useState, useEffect } from 'react';

function App() {
  // Use REACT_APP_BASE_URL in .env or default to localhost backend
  const BASE_URL =  "https://user-data-k2g4.onrender.com/" || "http://localhost:8000";

  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ id: null, name: "", age: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(""); // small inline notification

  const flash = (msg, ms = 2500) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), ms);
  };

  // Fetch users
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      const normalized = res.data.map(u => ({
        id: u.id || u._id,
        name: u.name,
        age: u.age,
        city: u.city
      }));
      setUsers(normalized);
      setFilterUsers(normalized);
    } catch (err) {
      console.error("Error fetching users:", err);
      flash("Error fetching users — check console");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.city || "").toLowerCase().includes(q)
    );
    setFilterUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/users/${id}`);
      flash("User deleted");
      getAllUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      flash("Delete failed");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserData({ id: null, name: "", age: "", city: "" });
  };

  const handleAddRecord = () => {
    setUserData({ id: null, name: "", age: "", city: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setUserData({ id: user.id, name: user.name || "", age: user.age || "", city: user.city || "" });
    setIsModalOpen(true);
  };

  const handleData = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: (userData.name || "").trim(), age: Number(userData.age), city: (userData.city || "").trim() };
    if (!payload.name || isNaN(payload.age) || !payload.city) {
      flash("Please fill all fields correctly");
      return;
    }

    try {
      if (userData.id) {
        await axios.put(`${BASE_URL}/users/${userData.id}`, payload);
        flash("User updated");
      } else {
        await axios.post(`${BASE_URL}/users`, payload);
        flash("User added");
      }
      getAllUsers();
      closeModal();
    } catch (err) {
      console.error("Error saving user:", err);
      flash("Save failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">User Manager</h1>
          <p className="text-center text-sm text-gray-600">Small MERN CRUD — improved UI & fixes</p>
        </header>

        {notice && <div className="bg-green-100 text-green-800 p-2 rounded mb-4 text-center">{notice}</div>}

        <div className="flex gap-4 mb-4">
          <input
            type="search"
            placeholder="Search by name or city..."
            onChange={handleSearchChange}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={handleAddRecord} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add</button>
          <button onClick={getAllUsers} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Refresh</button>
        </div>

        <div className="bg-white shadow rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Age</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No users found.</td></tr>
                ) : filterUsers.map((u, i) => (
                  <tr key={u.id} className={i % 2 ? "bg-gray-50" : ""}>
                    <td className="p-3 align-top">{i + 1}</td>
                    <td className="p-3 align-top">{u.name}</td>
                    <td className="p-3 align-top">{u.age}</td>
                    <td className="p-3 align-top">{u.city}</td>
                    <td className="p-3 text-center align-top">
                      <button onClick={() => handleEdit(u)} className="mr-2 px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
              <button onClick={closeModal} className="absolute top-3 right-3 text-2xl">&times;</button>
              <h2 className="text-xl font-semibold mb-4">{userData.id ? "Edit User" : "Add User"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm">Full Name</label>
                  <input name="name" value={userData.name} onChange={handleData} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Age</label>
                  <input name="age" value={userData.age} onChange={handleData} type="number" min="0" className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm">City</label>
                  <input name="city" value={userData.city} onChange={handleData} className="w-full p-2 border rounded" required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">{userData.id ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
