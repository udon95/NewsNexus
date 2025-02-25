import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import supabase from "../api/supabaseClient";

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
      });

      if (error) throw error;

      // Fetch user type from `usertype` table
      const { data: userTypeData, error: userTypeError } = await supabase
        .from("usertype")
        .select("usertype")
        .eq("userid", data.user.id)
        .single();

      if (userTypeError) throw userTypeError;

      const userRole = userTypeData?.usertype;

      // Redirect based on role
      if (userRole === "Admin") {
        navigate("/admin-dashboard"); // Admin Redirect
      } else {
        navigate("/home"); // Free & Premium Users Redirect
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-8 font-grotesk">
            Login
          </h2>
          {error && <p className="text-red-500">{error}</p>}
          <form className="space-y-6 w-full font-grotesk" onSubmit={handleLogin}>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label className="text-2xl font-normal text-black w-40 text-left">
                E-mail:
              </label>
              <input
                type="email"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label className="text-2xl font-normal text-black w-40 text-left">
                Password:
              </label>
              <input
                type="password"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
                onClick={() => navigate("/register")}
              >
                Register
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
