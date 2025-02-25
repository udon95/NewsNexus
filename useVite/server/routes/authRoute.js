require("dotenv").config();
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import Supabase client

// 🔹 User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", req.body);


  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Authenticate user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(401).json({ error: error.message });

  // Fetch user role  
  const { data: userRole, error: roleError } = await supabase
    .from("usertype")
    .select("usertype")
    .eq("userid", data.user.id)
    .single();

  if (roleError)
    return res.status(500).json({ error: "Failed to fetch user role" });

  res.json({ user: data.user, session: data.session, role: userRole.usertype });
});

// 🔹 User Registration
router.post("/register", async (req, res) => {
  const { username, email, password, dob, gender, topics } = req.body;

  try {
    // 1) Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, dob, gender } },
    });
    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // 2) Insert into 'users' table
    const { error: userError } = await supabase.from("users").insert([
      {
        userid: userId,
        email,
        username,
        password,
        status: "Pending",
        auth_id: userId,
      },
    ]);
    if (userError) return res.status(500).json({ error: userError.message });

    // 3) Insert into 'profile'
    const { error: profileError } = await supabase
      .from("profile")
      .insert([{ uuserid: userId, gender, dob }]);
    if (profileError)
      return res.status(500).json({ error: profileError.message });

    // 4) Insert topics
    if (topics && topics.length > 0) {
      const topicRecords = topics.map((topic) => ({
        userid: userId,
        interesttype: topic,
      }));
      const { error: topicError } = await supabase
        .from("topicinterest")
        .insert(topicRecords);
      if (topicError)
        return res.status(500).json({ error: topicError.message });
    }

    // 5) Set user role to 'Free'
    await supabase
      .from("usertype")
      .insert([{ userid: userId, usertype: "Free" }]);

    return res.json({ user: authData.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 🔹 Get User Role
router.get("/user-role/:userid", async (req, res) => {
  const { userid } = req.params;

  const { data, error } = await supabase
    .from("usertype")
    .select("usertype")
    .eq("userid", userid)
    .single();

  if (error)
    return res.status(500).json({ error: "Failed to fetch user role" });

  res.json({ role: data.usertype });
});

module.exports = router;
