import './App.css'
import axios from "axios";
import { useState, useEffect } from 'react';

function App() {
  // Directly use your deployed backend
  const BASE_URL = "https://user-data-k2g4.onrender.com";

  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ id: null, name: "", age: "", city: "" });

  // Get all users
  const getAllUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data);
      setFilterUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Search filter
  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText) ||
        user.city.toLowerCase().includes(searchText)
    );
    setFilterUsers(filteredUsers);
  };

  // Delete user
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/users/${id}`);
        getAllUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
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
    setUserData(user);
    setIsModalOpen(true);
  };

  const handleData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userData.id) {
        // Update existing user
        await axios.put(`${BASE_URL}/users/${userData.id}`, userData);
      } else {
        // Add new user
        await axios.post(`${BASE_URL}/users`, userData);
      }
      getAllUsers();
      closeModal();
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  return (
    <>
      <section className='flex justify-center pt-20 items-center'>
        <div className='w-[600px] mx-[20px]'>
          <h1 className='text-2xl font-bold text-center p-2 mb-3 border-2 text-gray-600 border-dashed border-gray-500'>
            CRUD Application with React.js Frontend and Node.js Backend
          </h1>

          <div className='flex justify-between items-center mb-[20px]'>
            <input
              type="search"
              placeholder='Search Text Here'
              onChange={handleSearchChange}
              className='border w-[300px] p-1 rounded-sm outline-none'
            />
            <button
              onClick={handleAddRecord}
              className='p-1 text-white rounded-sm bg-green-500 hover:bg-green-700'
            >
              Add Record
            </button>
          </div>

          <table className='w-full border-collapse'>
            <thead>
              <tr>
                <th className='border border-gray-300 bg-gray-400 p-1'>S.No</th>
                <th className='border border-gray-300 bg-gray-400 p-1'>Name</th>
                <th className='border border-gray-300 bg-gray-400 p-1'>Age</th>
                <th className='border border-gray-300 bg-gray-400 p-1'>City</th>
                <th className='border border-gray-300 bg-gray-400 p-1'>Edit</th>
                <th className='border border-gray-300 bg-gray-400 p-1'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filterUsers && filterUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className='border border-gray-300 p-1'>{index + 1}</td>
                  <td className='border border-gray-300 p-1'>{user.name}</td>
                  <td className='border border-gray-300 p-1'>{user.age}</td>
                  <td className='border border-gray-300 p-1'>{user.city}</td>
                  <td className='border p-1 border-gray-300'>
                    <button
                      onClick={() => handleEdit(user)}
                      className='p-0.5 px-2 text-white rounded-sm bg-blue-500 hover:bg-blue-700'
                    >
                      Edit
                    </button>
                  </td>
                  <td className='border p-1 border-gray-300'>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className='p-0.5 text-white rounded-sm bg-red-500 hover:bg-red-700'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isModalOpen && (
            <div className='fixed z-10 left-0 top-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-20'>
              <div className='bg-white p-5 border rounded-lg shadow-lg w-80 relative'>
                <span
                  onClick={closeModal}
                  className='absolute top-2 right-3 font-bold text-2xl text-gray-700 hover:text-black cursor-pointer'
                >
                  &times;
                </span>
                <h2 className='text-2xl mb-4'>{userData.id ? "Edit User" : "Add User"}</h2>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                  <div>
                    <label className='block mb-1' htmlFor="name">Full Name</label>
                    <input
                      onChange={handleData}
                      className='w-full p-2 rounded-sm border outline-none'
                      value={userData.name}
                      type="text"
                      name='name'
                      required
                    />
                  </div>
                  <div>
                    <label className='block mb-1' htmlFor="age">Age</label>
                    <input
                      onChange={handleData}
                      className='w-full p-2 rounded-sm border outline-none'
                      type="number"
                      value={userData.age}
                      name='age'
                      required
                    />
                  </div>
                  <div>
                    <label className='block mb-1' htmlFor="city">City</label>
                    <input
                      onChange={handleData}
                      className='w-full p-2 rounded-sm border outline-none'
                      type="text"
                      value={userData.city}
                      name='city'
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className='p-2 text-white rounded-sm bg-green-500 hover:bg-green-700'
                  >
                    {userData.id ? "Update User" : "Add User"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default App;
