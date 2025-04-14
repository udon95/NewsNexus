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
  const { data, error } = await supabase
    .from("managerooms")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// POST a new room
// Accessible at POST /rooms
router.post("/new", async (req, res) => {
  const { name, userLimit, description, category, privacy } = req.body;

  const { data, error } = await supabase
    .from("managerooms")
    .insert({
      name,
      user_limit: userLimit,
      description,
      category,
      privacy,
    })
    .select(); // Returns the inserted rows

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Assume the insert returns an array with a single room object
  res.json(data[0]);
});

// PUT update a room by id
// Accessible at PUT /rooms/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, userLimit, description, category, privacy } = req.body;

  const { data, error } = await supabase
    .from("managerooms")
    .update({
      name,
      user_limit: userLimit,
      description,
      category,
      privacy,
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data[0]);
});

// DELETE a room by id
// Accessible at DELETE /rooms/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("managerooms").delete().eq("id", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // 204 means no content is returned on successful deletion
  res.sendStatus(204);
});

// POST feedback endpoint
// Accessible at POST /rooms/feedback
router.post("/feedback", async (req, res) => {
  const { rating, share, areas } = req.body;

  if (rating === undefined || share === undefined || areas === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({ rating, share, areas })
    .select();

  if (error) {
    console.error("Database insertion failed:", error);
    return res.status(500).json({ message: error.message });
  }

  res.status(200).json({
    message: "Feedback submitted successfully",
    id: data[0].id,
  });
});

// Export the router so that it can be mounted in server.js
module.exports = router;
