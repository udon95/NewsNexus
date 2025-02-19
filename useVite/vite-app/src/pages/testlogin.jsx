import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Clear previous errors

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (!data.user.email_confirmed_at) {
      setError("Please verify your email before logging in.");
      await supabase.auth.signOut();
    } else {
      alert("Login successful!");
      navigate("/profile"); // Redirect user after login
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Login</h2>

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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-80 mt-4"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
