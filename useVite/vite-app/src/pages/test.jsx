import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // ✅ Step 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data || !data.user) {
        setError("Error creating user. Please try again.");
        return;
      }

      const user = data.user;

      // ✅ Step 2: Insert into `users` table
      const { error: userError } = await supabase
        .from("users")
        .insert([
          {
            userid: user.id,
            auth_id: user.id,
            email: email,
            username: username,
            password: password, // Should be hashed in production
            status: "Pending",
          },
        ]);

      if (userError) {
        setError(`Users Table Error: ${userError.message}`);
        return;
      }

      // ✅ Step 3: Insert into `profile` table
      const { error: profileError } = await supabase
        .from("profile")
        .insert([
          {
            uuserid: user.id, // Foreign key reference to users.userid
            dob: dob,
            gender: gender,
          },
        ]);

      if (profileError) {
        console.error("Profile Insert Error:", profileError.message);
        setError(`Profile Table Error: ${profileError.message}`);
        return;
      }

      // ✅ Step 4: Insert into `usertype` table
      const { error: userTypeError } = await supabase
        .from("usertype")
        .insert([{ userid: user.id, usertype: "Free" }]);

      if (userTypeError) {
        setError(`UserType Table Error: ${userTypeError.message}`);
        return;
      }

      alert("Verification email sent! Please check your inbox.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Register</h2>

      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      />
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      />
      <input
        type="password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      />
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      />
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2 w-80"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Prefer Not to Say">Prefer Not to Say</option>
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSignup}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-80 mt-4"
      >
        Sign Up
      </button>
    </div>
  );
};

export default Register;
