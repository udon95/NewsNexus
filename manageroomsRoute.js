const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// 获取所有房间（由当前用户创建）
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("created_by", userid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// 创建房间
router.post("/", async (req, res) => {
  const { name, description, privacy, created_by } = req.body;

  if (!name || !description || !privacy || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase.from("rooms").insert([
    { name, description, privacy, created_by }
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Room created", data });
});

// 删除房间
router.delete("/:roomid", async (req, res) => {
  const roomid = req.params.roomid;
  const { error } = await supabase.from("rooms").delete().eq("roomid", roomid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Room deleted" });
});

// 邀请用户进入房间
router.post("/invite", async (req, res) => {
  const { inviter_id, invitee_username, roomid } = req.body;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("userid")
    .eq("username", invitee_username)
    .single();

  if (userError || !user) return res.status(404).json({ error: "User not found" });

  const { error } = await supabase.from("room_members").insert([
    {
      userid: user.userid,
      roomid,
      invited_by: inviter_id,
      joined_at: null,
      exited_at: null
    }
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Invitation sent" });
});

// 接受邀请
router.post("/accept", async (req, res) => {
  const { userid, roomid } = req.body;

  const { error } = await supabase
    .from("room_members")
    .update({ joined_at: new Date().toISOString() })
    .eq("userid", userid)
    .eq("roomid", roomid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Joined room" });
});

// 退出房间
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
