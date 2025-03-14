// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const pool = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const articleRoutes = require("./routes/articleRoutes"); // Import articles routes

// const app = express();

// app.use(express.json()); // Allows JSON request bodies
// app.use(cors());
// app.use(helmet());
// app.use("/api/articles", articleRoutes);

// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Ensure routes are correctly mounted
// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/* ---------------------- ROOMS API ---------------------- */

// Fetch all rooms
app.get("/rooms", async (req, res) => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("member_count", { ascending: false }); // Sorting by most members first

  if (error) return res.status(500).json(error);
  res.json(data);
});


// Join a room
app.post("/rooms/join", async (req, res) => {
  const { userid, roomid } = req.body;
  const { data, error } = await supabase.from("room_members").insert([{ userid, roomid }]);
  if (error) return res.status(500).json(error);
  res.json(data);
});

// Exit a room
app.delete("/rooms/exit", async (req, res) => {
  const { userid, roomid } = req.body;
  const { error } = await supabase.from("room_members").delete().eq("userid", userid).eq("roomid", roomid);
  if (error) return res.status(500).json(error);
  res.json({ message: "Exited room" });
});

/* ---------------------- POSTS API ---------------------- */

// Fetch posts (general or room-specific)
app.get("/posts", async (req, res) => {
  const { roomid } = req.query;
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (roomid) query = query.eq("roomid", roomid);
  const { data, error } = await query;
  if (error) return res.status(500).json(error);
  res.json(data);
});

// Create a new post
app.post("/posts", async (req, res) => {
  const { userid, title, content, media_url, is_general, roomid } = req.body;
  const { data, error } = await supabase.from("posts").insert([{ userid, title, content, media_url, is_general, roomid }]);
  if (error) return res.status(500).json(error);
  res.json(data);
});

/* ---------------------- COMMENTS API ---------------------- */

// Fetch comments for a post
app.get("/comments", async (req, res) => {
  const { postid } = req.query;
  const { data, error } = await supabase.from("comments").select("*").eq("postid", postid);
  if (error) return res.status(500).json(error);
  res.json(data);
});

// Post a comment
app.post("/comments", async (req, res) => {
  const { postid, userid, content } = req.body;
  const { data, error } = await supabase.from("comments").insert([{ postid, userid, content }]);
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
