const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "roomsystem",
  password: "geqinxuan",
  port: 5432,
});

app.get("/api/rooms", async (req, res) => {
  const result = await pool.query("SELECT * FROM managerooms ORDER BY id ASC");
  res.json(result.rows);
});

app.post("/api/rooms", async (req, res) => {
  const { name, userLimit, description, category, privacy } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO managerooms (name, user_limit, description, category, privacy) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, userLimit, description, category, privacy]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  const { id } = req.params;
  const { name, userLimit, description, category, privacy } = req.body;

  try {
    const result = await pool.query(
      "UPDATE managerooms SET name = $1, user_limit = $2, description = $3, category = $4, privacy = $5 WHERE id = $6 RETURNING *",
      [name, userLimit, description, category, privacy, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/rooms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM managerooms WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { rating, share, areas } = req.body;

  if (rating === undefined || share === undefined || areas === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query =
      "INSERT INTO feedback (rating, share, areas) VALUES ($1, $2, $3) RETURNING id";
    const values = [rating, share, areas];

    const result = await pool.query(query, values);
    res.status(200).json({
      message: "Feedback submitted successfully",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Database insertion failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
