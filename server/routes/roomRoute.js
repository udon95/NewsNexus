const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import Supabase client

// const bodyParser = require("body-parser");
// const { Pool } = require("pg");

// Create and configure the PostgreSQL pool
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "roomsystem",
//   password: "geqinxuan",
//   port: 5432,
// });

// Middleware (if you want to use bodyParser in this file)
// Note: You can also move these to server.js if you prefer centralized middleware.
// router.use(bodyParser.json());

// GET all rooms
// When mounted at /rooms, this endpoint will be accessible at GET /rooms
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("managerooms").select("*");

  if (error) {
    console.error("Error fetching rooms:", error.message);
    return res.status(500).json({ error: "Failed to fetch rooms" });
  }

  res.status(200).json(data);
});

// 🔹 CREATE new room
router.post("/", async (req, res) => {
  const room = req.body;

  if (!room.name || !room.privacy) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase.from("managerooms").insert([room]);

  if (error) {
    console.error("Error creating room:", error.message);
    return res.status(500).json({ error: "Failed to create room" });
  }

  res.status(201).json(data[0]);
});

// 🔹 UPDATE room by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { error } = await supabase.from("managerooms").update(updates).eq("id", id);

  if (error) {
    console.error("Error updating room:", error.message);
    return res.status(500).json({ error: "Failed to update room" });
  }

  res.status(200).json({ message: "Room updated successfully" });
});

// 🔹 DELETE room by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("managerooms").delete().eq("id", id);

  if (error) {
    console.error("Error deleting room:", error.message);
    return res.status(500).json({ error: "Failed to delete room" });
  }

  res.status(200).json({ message: "Room deleted successfully" });
});

module.exports = router;