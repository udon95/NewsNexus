require("dotenv").config();
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user with Supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) return res.status(401).json({ error: authError.message });
  if (!authData.user)
    return res.status(401).json({ error: "Authentication failed" });

  const userId = authData.user.id;

  try {
    // Fetch user details, profile, and role in ONE query
    let { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select(
        `
        userid, email, username, password, status, auth_id,
        profile:profile(uuserid, gender, dob),
        usertype:usertype(usertype, color)
      `
      )
      .eq("auth_id", userId) // Match Supabase auth_id
      .single();

    if (profileError || !userProfile) {
      // If not found in users table, check if it's an admin
      let { data: adminProfile, error: adminError } = await supabase
        .from("admin")
        .select("adminid, email, username, password")
        .eq("email", email) // Admins are matched via email
        .single();

      if (adminProfile) {
        // Validate Admin Password
        const isMatch = await bcrypt.compare(password, adminProfile.password);
        if (!isMatch)
          return res.status(400).json({ error: "Invalid credentials" });

        // Return Admin Profile
        return res.json({
          message: "Admin Login Successful",
          user: {
            userid: adminProfile.adminid,
            email: adminProfile.email,
            username: adminProfile.username,
            status: "Active",
          },
          role: "Admin",

          session: authData.session, // Supabase session
        });
      } else {
        return res.status(404).json({ error: "User details not found" });
      }
    }
    if (userProfile) {
      const isMatch = await bcrypt.compare(password, userProfile.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });

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
      console.log("color: ", userProfile.usertype.color);
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
        color: userProfile.usertype?.color || "Unknown",
        interests,
        session: authData.session, // Supabase session data
      });
    }
    let { data: adminProfile, error: adminError } = await supabase
      .from("admin")
      .select("adminid, email, username, password") // No auth_id in admin
      .eq("email", email) // Admins are matched via email
      .single();

    if (adminProfile) {
      //  Validate Admin Password
      const isMatch = await bcrypt.compare(password, adminProfile.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });

      //  Return Admin Profile
      return res.json({
        message: "Admin Login Successful",
        user: {
          userid: adminProfile.adminid,
          email: adminProfile.email,
          username: adminProfile.username,
          status: "Active",
        },
        role: "Admin",
        session: authData.session, // Supabase session
      });
    }
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

    if (!username || !email || !password || !dob || !gender) {
      return res
        .status(400)
        .json({ error: "Missing required registration fields." });
    }

    // Calculate age from dob
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check if the user is at least 16 years old
    if (age < 16) {
      return res
        .status(400)
        .json({ error: "You must be at least 16 years old to register." });
    }

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
        status: "Active",
        auth_id: userId,
      },
    ]);
    if (userError) return res.status(500).json({ error: userError.message });

    const { error: profileError } = await supabase
      .from("profile")
      .insert([{ uuserid: userId, gender, dob }]);
    if (profileError)
      return res.status(500).json({ error: profileError.message });

    if (topics && topics.length > 0) {
      const interestsString = topics.join(", ");

      const { error: topicError } = await supabase
        .from("topicinterest")
        .insert([{ userid: userId, interesttype: interestsString }]); // Store as one row

      if (topicError) {
        return res.status(500).json({ error: topicError.message });
      }
    }

    await supabase
      .from("usertype")
      .insert([{ userid: userId, usertype: "Free" }]);

    return res.json({ user: authData.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://van.dpyq2cohucoc7.amplifyapp.com/reset-password", //  Change to your frontend reset page
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Password reset email sent. Check your inbox." });
});

//  Get User Role
router.get("/user-role/:userid", async (req, res) => {
  const { userid } = req.params;

  const { data, error } = await supabase
    .from("usertype")
    .select("*")
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

router.put("/update-profile", async (req, res) => {
  const { userId, username, email, dob, gender } = req.body;

  if (!userId || !username || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update basic user details in the "users" table
    const { error: errorUser } = await supabase
      .from("users")
      .update({ username, email })
      .eq("userid", userId);

    if (errorUser) throw errorUser;

    // Update additional details in the "profile" table
    const { error: errorProfile } = await supabase
      .from("profile")
      .update({ dob, gender })
      .eq("uuserid", userId);

    if (errorProfile) throw errorProfile;

    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Update Interests Endpoint
router.post("/update-interests", async (req, res) => {
  const { userId, interests } = req.body;

  if (!userId || interests === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update the topicinterest table with the new interests string.
    const { error } = await supabase
      .from("topicinterest")
      .update({ interesttype: interests })
      .eq("userid", userId);

    if (error) throw error;

    return res.json({ message: "Interests updated successfully" });
  } catch (err) {
    console.error("Error updating interests:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/update-password", async (req, res) => {
  const { userId, oldPassword, newPassword, newPasswordConfirm } = req.body;

  // Validate presence of fields
  if (!userId || !oldPassword || !newPassword || !newPasswordConfirm) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check that the new passwords match
  if (newPassword !== newPasswordConfirm) {
    return res
      .status(400)
      .json({ error: "New password and confirmation do not match" });
  }

  // Check for minimum length
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters long" });
  }

  try {
    // Fetch the user's current password from the "users" table
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("userid", userId)
      .single();

    if (fetchError) throw fetchError;

    // Compare provided old password with the hashed password in the DB
    const isMatch = await bcrypt.compare(oldPassword, userData.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }
    const { data: updateAuthData, error: updateAuthError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });
    if (updateAuthError) throw updateAuthError;
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the "users" table
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedNewPassword })
      .eq("userid", userId);

    if (updateError) throw updateError;

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/verify-old-password", async (req, res) => {
  const { userId, oldPassword } = req.body;
  if (!userId || !oldPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Fetch the hashed password for the user
    const { data: userData, error } = await supabase
      .from("users")
      .select("password")
      .eq("userid", userId)
      .single();
    if (error || !userData) {
      return res.status(500).json({ error: "Failed to fetch user data" });
    }
    // Compare the provided old password with the hashed password
    const isMatch = await bcrypt.compare(oldPassword, userData.password);
    return res.json({ valid: isMatch });
  } catch (err) {
    console.error("Error verifying old password:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/public-profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    // 1. Fetch basic user details (e.g. username)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`userid, username, status`)
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const { data: typeRow, error: typeError } = await supabase
      .from("usertype")
      .select("usertype")
      .eq("userid", userData.userid)
      .single();

    if (typeError) {
      // you can either default it or treat it as not‑found
      return res.status(500).json({ error: "Could not load usertype" });
    }

    const userId = userData.userid;

    // 2. Fetch articles written by the user
    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select(
        "articleid, userid, title, imagepath, text, rating, time, status, topicid"
      )
      .eq("userid", userId);

    if (articlesError) {
      return res.status(500).json({ error: "Failed to fetch articles" });
    }

    // 3. Fetch list of public rooms the user has joined
    let publicRooms = [];
    if (userData.usertype === "Premium") {
      const { data: userRooms, error: roomsError } = await supabase
        .from("room_members")
        .select(
          `
          roomid,
          joined_at,
          exited_at,
          join_count,
          exit_count,
          rooms (
            name
          )
        `
        )
        .eq("userid", userId);

      if (roomsError) {
        return res.status(500).json({ error: "Failed to fetch user rooms" });
      }

      if (userRooms) {
        publicRooms = userRooms.map((rm) => ({
          roomid: rm.roomid,
          joined_at: rm.joined_at,
          exited_at: rm.exited_at,
          join_count: rm.join_count,
          exit_count: rm.exit_count,
          room_name: rm.rooms?.name || "",
        }));
      }
    }

    return res.json({
      user: {
        userid: userData.userid,
        username: userData.username,
        usertype: typeRow.usertype, // front-end can check if usertype === "Expert" to show icon
        status: userData.status,
      },
      articles: articlesData || [],
      rooms: publicRooms || [],
    });
  } catch (err) {
    console.error("Error fetching public profile:", err);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;
