const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// 🔹 GET all rooms created by user
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;
  const { data, error } = await supabase
    .from("rooms")
    .select("roomid, name, description, room_type, created_by, member_limit, member_count")
    .eq("created_by", userid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// 🔹 CREATE new room
router.post("/", async (req, res) => {
  const { name, description, room_type, created_by, member_limit } = req.body;

  if (!name || !description || !room_type || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const insertData = {
    name,
    description,
    room_type,
    created_by,
    member_limit: parseInt(member_limit) || 20,
  };

  const { data, error } = await supabase
    .from("rooms")
    .insert([insertData])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Room created", data });
});

// 🔹 UPDATE room by ID
router.put("/:roomid", async (req, res) => {
  const { roomid } = req.params;
  const { name, description, room_type, member_limit } = req.body;

  if (!name && !description && !room_type && !member_limit) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (room_type !== undefined) updateFields.room_type = room_type;
  if (member_limit !== undefined) updateFields.member_limit = parseInt(member_limit);

  const { data, error } = await supabase
    .from("rooms")
    .update(updateFields)
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

// 🔹 Invite user to room
router.post("/invite", async (req, res) => {
  const { invitee_username, roomid } = req.body;

  const { count, error: countError } = await supabase
    .from("room_invites")
    .select("*", { count: "exact", head: true })
    .eq("roomid", roomid);

  if (countError) {
    console.error("Invite count error:", countError.message);
    return res.status(500).json({ error: "Failed to count invites" });
  }

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
    { userid: user.userid, roomid },
  ]);

  if (insertError) {
    console.error("Invite insert error:", insertError.message);
    return res.status(500).json({ error: insertError.message });
  }

  res.status(200).json({ message: "Invitation sent" });
});

// 🔹 Accept invite
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

// 🔹 Decline invite
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

module.exports = router;
