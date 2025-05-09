const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import Supabase client

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
  const { name, description, room_type, created_by, member_limit } = req.body;

  if (!name || !description || !room_type || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const limit =
  typeof member_limit === "number" && member_limit > 0
    ? Math.min(member_limit, 100)
    : 20;

const { data, error } = await supabase
  .from("rooms")
  .insert([{ name, description, room_type, created_by, member_limit: limit }])
  .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Room created", data });
});

// 🔹 UPDATE room by ID
router.put("/:roomid", async (req, res) => {
  const { roomid } = req.params;
  const { name, description, room_type, member_limit } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (room_type !== undefined) updateData.room_type = room_type;
  if (
    member_limit !== undefined &&
    Number.isInteger(member_limit) &&
    member_limit > 0
  ) {
    updateData.member_limit = Math.min(member_limit, 100);
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const { data, error } = await supabase
    .from("rooms")
    .update(updateData)
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
  const bucketName = "room-article-images";

  try {
    // 1. Get all postids in the room
    const { data: posts, error: postsError } = await supabase
      .from("room_articles")
      .select("postid")
      .eq("roomid", roomid);

    if (postsError) throw postsError;

    const postIds = posts.map((p) => p.postid);

    // 2. Get image URLs for those posts
    if (postIds.length > 0) {
      const { data: images, error: imagesError } = await supabase
        .from("room_article_images")
        .select("image_url")
        .in("postid", postIds);

      if (imagesError) throw imagesError;

      const imagePaths = images.map((img) => {
        const parts = img.image_url.split(`/object/public/${bucketName}/`);
        return parts[1]; // extract path after bucket prefix
      });

      // 3. Delete from storage bucket
      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(imagePaths);

        if (storageError) throw storageError;
      }
    }

    // 4. Delete the room 
    const { error: roomDeleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("roomid", roomid);

    if (roomDeleteError) throw roomDeleteError;

    return res.status(200).json({ message: "Room and images deleted" });
  } catch (err) {
    console.error("Delete failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
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


