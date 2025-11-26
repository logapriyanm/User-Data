// src/App.jsx
import './App.css';
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';

function App() {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
  const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });

  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ id: null, name: "", age: "", city: "" });
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Theme state - using 'light' | 'dark' to match your CSS
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply theme to document using class system
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    isMountedRef.current = true;
    getAllUsers();
    return () => { isMountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSuccess = (msg) => toast.success(msg);
  const showError = (msg) => toast.error(msg);

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      const normalized = (Array.isArray(res.data) ? res.data : []).map(u => ({
        id: u.id || u._id,
        name: u.name || "",
        age: u.age ?? "",
        city: u.city || ""
      }));
      if (isMountedRef.current) {
        setUsers(normalized);
        setFilterUsers(normalized);
      }
    } catch (err) {
      console.error("Error fetching users:", err?.response?.data || err.message || err);
      showError("Error fetching users");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const q = (e.target.value || "").toLowerCase();
    const filtered = users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.city || "").toLowerCase().includes(q)
    );
    setFilterUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!id) return showError("Invalid user id");
    if (!window.confirm("Delete this user?")) return;
    const p = api.delete(`/users/${id}`);
    toast.promise(p, {
      loading: "Deleting...",
      success: () => {
        getAllUsers();
        return "User deleted";
      },
      error: (err) => {
        console.error("Error deleting user:", err?.response?.data || err.message || err);
        return err?.response?.data?.message || "Delete failed";
      }
    });
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
    setUserData({ id: user.id, name: user.name || "", age: user.age ?? "", city: user.city || "" });
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
      showError("Please fill all fields correctly");
      return;
    }

    if (userData.id) {
      const p = api.put(`/users/${userData.id}`, payload);
      toast.promise(p, {
        loading: "Updating user...",
        success: () => {
          getAllUsers();
          closeModal();
          return "User updated";
        },
        error: (err) => {
          console.error("Error updating user:", err?.response?.data || err.message || err);
          return err?.response?.data?.message || "Update failed";
        }
      });
    } else {
      const p = api.post('/users', payload);
      toast.promise(p, {
        loading: "Creating user...",
        success: () => {
          getAllUsers();
          closeModal();
          return "User added";
        },
        error: (err) => {
          console.error("Error creating user:", err?.response?.data || err.message || err);
          return err?.response?.data?.message || "Create failed";
        }
      });
    }
  };

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 app-bg">
      <div className="max-w-4xl mx-auto bg-card-var rounded-2xl shadow-xl overflow-hidden">
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            className: 'toast-custom',
          }} 
        />

        <header className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-green-500">User Management System</h1>
            
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => getAllUsers()}
              className="px-4 py-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md text-sm text-var transition-all duration-200 dark:bg-gray-700/80 dark:hover:bg-gray-700 dark:border-gray-600"
              title="Refresh"
            >
              Refresh
            </button>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center dark:bg-gray-700/80 dark:hover:bg-gray-700 dark:border-gray-600"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="search"
              placeholder="Search by name or city..."
              onChange={handleSearchChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 text-var transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700/90"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddRecord}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Add User
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm dark:border-gray-700">
            {loading ? (
              <div className="p-12 text-center text-var">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-left font-semibold text-var">#</th>
                    <th className="p-4 text-left font-semibold text-var">Name</th>
                    <th className="p-4 text-left font-semibold text-var">Age</th>
                    <th className="p-4 text-left font-semibold text-var">City</th>
                    <th className="p-4 text-center font-semibold text-var">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-var">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-4xl mb-2 opacity-60">👥</span>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm opacity-70 mt-1">Try adjusting your search or add a new user</p>
                        </div>
                      </td>
                    </tr>
                  ) : filterUsers.map((u, i) => (
                    <tr 
                      key={u.id || i} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 dark:border-gray-700 dark:hover:bg-gray-800 ${
                        i % 2 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-700"
                      }`}
                    >
                      <td className="p-4 font-medium text-var">{i + 1}</td>
                      <td className="p-4 font-semibold text-var">{u.name}</td>
                      <td className="p-4 text-var">{u.age}</td>
                      <td className="p-4 text-var">{u.city}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
            <div className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative transform transition-all border border-gray-200 bg-card-var dark:border-gray-700">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-green-600">{userData.id ? "Edit User" : "Add New User"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-var">Full Name</label>
                  <input
                    name="name"
                    value={userData.name}
                    onChange={handleData}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 text-white transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700/90"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-var">Age</label>
                  <input
                    name="age"
                    value={userData.age}
                    onChange={handleData}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 text-white transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700/90"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-var">City</label>
                  <input
                    name="city"
                    value={userData.city}
                    onChange={handleData}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 text-white transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700/90"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    {userData.id ? "Update" : "Create"}
                  </button>
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