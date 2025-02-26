import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import supabase from "../api/supabaseClient.js";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { persistSession: true }, // Keeps user logged in
      });

      if (error) throw new Error(error.message);

      // Fetch user role from backend
      const userId = data.user.id;
      const response = await fetch(
        `http://localhost:5000/auth/user-role/${userId}`
      );
      const userData = await response.json();

      if (!response.ok) throw new Error(userData.error);

      // Redirect based on role
      if (userData.role === "Admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/"); // Redirect Free/Premium users to Home
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      {/* Login Section */}
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-8 font-grotesk">
            Login
          </h2>

          <form
            className="space-y-6 w-full font-grotesk"
            onSubmit={handleLogin}
          >
            {/* Email Field */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label
                htmlFor="email"
                className="text-2xl font-normal text-black w-40 text-left"
              >
                E-mail:
              </label>
              <input
                id="email"
                type="email"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label
                htmlFor="password"
                className="text-2xl font-normal text-black w-40 text-left"
              >
                Password:
              </label>
              <input
                id="password"
                type="password"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Buttons Section */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
              <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90">
                <p>
                  <a href="{{ .ConfirmationURL }}">Reset Password</a>
                </p>
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
