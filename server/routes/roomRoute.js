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

// GET rooms the user joined (not created by them)
router.get("/joined/:userid", async (req, res) => {
  const { userid } = req.params;

  const { data, error } = await supabase
    .from("room_members")
    .select("roomid, rooms(*)")
    .eq("userid", userid)
    .is("exited_at", null);

  if (error) return res.status(500).json({ error: error.message });

  const joinedRooms = data
    .map((entry) => entry.rooms)
    .filter((room) => room.created_by !== userid); // exclude own rooms

  res.status(200).json(joinedRooms); // includes room_type field
});

// GET rooms the user created
// When mounted at /rooms, this endpoint will be accessible at GET /rooms
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("created_by", userid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// 🔹 CREATE new room
router.post("/", async (req, res) => {
  const { name, description, room_type, created_by } = req.body;

  if (!name || !description || !room_type || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert([{ name, description, room_type, created_by }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Room created", data });
});

// 🔹 UPDATE room by ID
router.put("/:roomid", async (req, res) => {
  const { roomid } = req.params;
  const { name, description, room_type } = req.body;

  if (!name && !description && !room_type) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const { data, error } = await supabase
    .from("rooms")
    .update({ name, description, room_type })
    .eq("roomid", roomid);

  if (error) {
    console.error("Error updating room:", error.message);
    return res.status(500).json({ error: "Failed to update room" });
  }

  res.status(200).json({ message: "Room updated successfully", data });
});

// 🔹 DELETE room by ID
router.delete("/:roomid", async (req, res) => {
  const { roomid } = req.params;
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("roomid", roomid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Room deleted" });
});

router.post("/invite", async (req, res) => {
  const { invitee_username, roomid } = req.body;

  const { count, error: countError } = await supabase
  .from("room_invites")
  .select("*", { count: "exact", head: true })
  .eq("roomid", roomid);

  if (countError)
  return res.status(500).json({ error: "Failed to count invites" });

  if (count >= 10) {
  return res.status(400).json({ error: "Invite limit of 10 reached" });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("userid")
    .eq("username", invitee_username)
    .single();

  if (userError || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { error: insertError } = await supabase.from("room_invites").insert([
    {
      userid: user.userid,
      roomid,
    },
  ]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res.status(200).json({ message: "Invitation sent" });
});

router.post("/accept", async (req, res) => {
  const { userid, roomid } = req.body;

  const { error } = await supabase
    .from("room_members")
    .upsert(
      [{ userid, roomid, joined_at: new Date().toISOString(), exited_at: null }],
      { onConflict: ['userid', 'roomid'] }
    );

  if (error) return res.status(500).json({ error: error.message });

  const { error: deleteError } = await supabase
    .from("room_invites")
    .delete()
    .eq("userid", userid)
    .eq("roomid", roomid);

  if (deleteError) return res.status(500).json({ error: deleteError.message });

  res.status(200).json({ message: "Joined room" });
});

router.post("/decline", async (req, res) => {
  const { userid, roomid } = req.body;

  const { error } = await supabase
    .from("room_invites")
    .delete()
    .eq("userid", userid)
    .eq("roomid", roomid);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Invitation declined" });
});

router.post("/exit", async (req, res) => {
  const { userid, roomid } = req.body;

  const { error } = await supabase
    .from("room_members")
    .update({ exited_at: new Date().toISOString() })
    .eq("userid", userid)
    .eq("roomid", roomid);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Exited room" });
});

module.exports = router;
