// server.js (replace your existing file)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/userModel");

const app = express();
app.use(express.json());
app.use(cors()); // dev-friendly, tighten up in production

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env. Add MONGO_URI and restart.");
  process.exit(1);
}

// don't pass deprecated/removed options (mongoose v6+/mongodb driver v4+)
async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // start server only after DB connected
    app.listen(PORT, () => {
      console.log(`App is running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // exit so process managers (nodemon) don't keep retrying with a half-broken state
    process.exit(1);
  }
}

// --- routes ---
// lightweight mapper to return id as string
const mapUser = (u) => (u ? {
  id: u._id.toString(),
  name: u.name,
  age: u.age,
  city: u.city,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt
} : null);

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

app.get("/", (req, res) => {
  res.json({ message: "User Manager API is ready" });
});

// start the whole thing
start();
