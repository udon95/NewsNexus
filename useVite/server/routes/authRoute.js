require("dotenv").config();
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Import Supabase client
const bcrypt = require("bcryptjs");

//  User Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   console.log("Login attempt:", { email, password });

//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) return res.status(401).json({ error: error.message });
//   if (!data.user)
//     return res.status(401).json({ error: "Authentication failed" });

//   console.log("Authenticated User:", data.user);

//   // Fetch user details from the database
//   const { data: userData, error: userError } = await supabase
//     .from("users")
//     .select("*")
//     .eq("auth_id", data.user.id) // Match auth_id
//     .single();

//   console.log("User Data from DB:", userData);

//   if (userError || !userData)
//     return res.status(404).json({ error: "User not found in DB" });

//   res.json({ user: data.user, session: data.session, role: userData.usertype });
// });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // console.log("Login attempt:", { email, password });

  // Authenticate user with Supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) return res.status(401).json({ error: authError.message });
  if (!authData.user)
    return res.status(401).json({ error: "Authentication failed" });

  // console.log("Authenticated User:", data.user);

  const userId = authData.user.id;

  try {
    // Fetch user details, profile, and role in ONE query
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select(
        `
        userid, email, username, password, status, auth_id,
        profile:profile(uuserid, gender, dob),
        usertype:usertype(usertype)
      `
      )
      .eq("auth_id", userId) // Match Supabase auth_id
      .single();

    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError?.message);
      return res.status(404).json({ error: "User details not found" });
    }
    const isMatch = await bcrypt.compare(password, userProfile.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Fetch user interests separately
    const { data: interestData, error: interestError } = await supabase
      .from("topicinterest")
      .select("interesttype")
      .eq("userid", userProfile.userid)
      .single();

    if (interestError) {
      console.error("Interest fetch error:", interestError?.message);
    }

    // Extract interests (ensure it doesn't break if null)
    const interests = interestData?.interesttype || "";

    // Return full user details
    return res.json({
      message: "Login Successful",
      user: {
        userid: userProfile.userid,
        email: userProfile.email,
        username: userProfile.username,
        password: userProfile.password,
        status: userProfile.status,
        auth_id: userProfile.auth_id,
      },
      profile: userProfile.profile || {}, // Ensure no null values
      role: userProfile.usertype?.usertype || "Unknown",
      interests,
      session: authData.session, // Supabase session data
    });
    // return res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res.status(500).json({ error: "Failed to log in and fetch user data" });
  }
});

//  User Registration
router.post("/register", async (req, res) => {
  const { username, email, password, dob, gender, topics } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPw = await bcrypt.hash(password, salt);
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
        password: hashPw,
        status: "Free",
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
    // if (topics && topics.length > 0) {
    //   const topicRecords = topics.map((topic) => ({
    //     userid: userId,
    //     interesttype: topic,
    //   }));
    //   const { error: topicError } = await supabase
    //     .from("topicinterest")
    //     .insert(topicRecords);
    //   if (topicError)
    //     return res.status(500).json({ error: topicError.message });
    // }

    if (topics && topics.length > 0) {
      const interestsString = topics.join(", ");

      const { error: topicError } = await supabase
        .from("topicinterest")
        .insert([{ userid: userId, interesttype: interestsString }]); // Store as one row

      if (topicError) {
        return res.status(500).json({ error: topicError.message });
      }
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

//  Get User Role
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

router.get("/user-interest/:userid", async (req, res) => {
  const { userid } = req.params;

  try {
    const { data: interestData, error: interestError } = await supabase
      .from("topicinterest")
      .select("interesttype")
      .eq("userid", userid)
      .single();

    if (interestError) {
      return res.status(500).json({ error: "Failed to fetch user interest" });
    }
    return res.json({ interests: interestData?.interesttype || "" });
  } catch (error) {
    console.error("Unexpected error fetching interests:", error);
    return res.status(500).json({ error: "Error retrieving interests" });
  }
});

router.get("/profile/:userid", async (req, res) => {
  const { userid } = req.params;

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("uuserid", userid)
    .single();

  if (error)
    return res.status(500).json({ error: "Failed to fetch user profile" });

  res.json({ profile: data });
});

router.get("/user-details/:userid", async (req, res) => {
  const { userid } = req.params;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("userid", userid)
    .single();

  if (error)
    return res.status(500).json({ error: "Failed to fetch user details" });

  res.json({ details: data });
});

router.get("/user-full/:userid", async (req, res) => {
  const { userid } = req.params;

  if (!userid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch user details, profile, and user role in ONE query
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        userid, email, username, password, status, auth_id,
        profile:profile(uuserid, gender, dob),
        usertype:usertype(usertype)
      `
      )
      .eq("userid", userid)
      .single();

    if (error || !data) {
      console.error("Error fetching user profile:", error?.message);
      return res.status(404).json({ error: "User details not found" });
    }

    // Fetch interests separately
    const { data: interestData, error: interestError } = await supabase
      .from("topicinterest")
      .select("interesttype")
      .eq("userid", userid)
      .single();

    if (interestError) {
      console.error("Interest fetch error:", interestError?.message);
    }

    // Extract interests
    const interests = interestData?.interesttype || "No interests set";

    // Return formatted response
    res.json({
      user: {
        userid: data.userid,
        email: data.email,
        username: data.username,
        password: data.password,
        status: data.status,
        auth_id: data.auth_id,
      },
      profile: data.profile || {},
      role: data.usertype?.usertype || "Unknown",
      interests, // Corrected interest retrieval
    });
  } catch (error) {
    console.error("Unexpected error fetching full user profile:", error);
    res.status(500).json({ error: "Failed to fetch full user profile" });
  }
});

module.exports = router;
