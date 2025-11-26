// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/userModel");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
}));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in .env file. Exiting.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const mapUser = (u) => ({
  id: u._id.toString(),
  name: u.name,
  age: u.age,
  city: u.city,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    return res.json(users.map(mapUser));
  } catch (err) {
    console.error("GET /users error:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, age, city } = req.body;
    if (!name || age === undefined || !city) {
      return res.status(400).json({ message: "All fields required: name, age, city" });
    }
    if (isNaN(Number(age))) return res.status(400).json({ message: "Age must be a number" });

    const newUser = new User({ name: name.trim(), age: Number(age), city: city.trim() });
    const saved = await newUser.save();
    return res.status(201).json({ message: "User added successfully", user: mapUser(saved) });
  } catch (err) {
    console.error("POST /users error:", err);
    return res.status(500).json({ message: "Error adding user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, age, city } = req.body;
    if (!name || age === undefined || !city) {
      return res.status(400).json({ message: "All fields required: name, age, city" });
    }
    if (isNaN(Number(age))) return res.status(400).json({ message: "Age must be a number" });

    const updated = await User.findByIdAndUpdate(id, { name: name.trim(), age: Number(age), city: city.trim() }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User updated successfully", user: mapUser(updated) });
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    return res.status(500).json({ message: "Error updating user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted successfully", user: mapUser(deleted) });
  } catch (err) {
    console.error("DELETE /users/:id error:", err);
    return res.status(500).json({ message: "Error deleting user" });
  }
});

app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});