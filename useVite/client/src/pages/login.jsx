import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
// import supabase from "../api/supabaseClient.js";
import useAuthHook from "../hooks/useAuth.jsx";

function LoginPage() {
    const navigate = useNavigate();
  // const [email, setEmail] = use
  // State("");
  // const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  // const navigate = useNavigate();
  // // const { signInWithPass } = useAuth();

  // // const handleLogin = async (e) => {
  // //   e.preventDefault();
  // //   setError("");
  // //   try {
  // //     const { data, error } = await supabase.auth.signInWithPassword({
  // //       email,
  // //       password,
  // //     });

  // //     // if (error) throw new Error(error.message);
  // //     if (error) throw error;

  // //     if (!data.user) throw new Error("Authentication failed: No user found.");

  // //     console.log("Login successful:", data.user);

  // //     alert("Login successful!"); //  Show success alert

  // //     sessionStorage.setItem("userProfile", JSON.stringify(data.user));

  // //     // Fetch user session
  // //     const { data: sessionData } = await supabase.auth.getSession();
  // //     if (!sessionData || !sessionData.session) {
  // //       throw new Error("Session not found. Please try logging in again.");
  // //     }

  // //     console.log("Session Data:", sessionData);

  // //     // Fetch user role from backend
  // //     const userId = data.user.id;
  // //     if (!userId) throw new Error("User ID is missing.");
  // //     const response = await fetch(
  // //       `http://localhost:5000/auth/user-role/${userId}`
  // //       // ,
  // //       // {
  // //       //   method: "GET",
  // //       //   headers: { "Content-Type": "application/json" },
  // //       // }
  // //     );
  // //     const userData = await response.json();

  // //     if (!response.ok) throw new Error(userData.error);
  // //     console.log("User Role:", userData);

  // //     // Redirect based on role
  // //     if (userData.role === "Free") {
  // //       navigate("/freeDashboard");
  // //     } else {
  // //       navigate("/"); // Redirect Free/Premium users to Home
  // //     }
  // //   } catch (error) {
  // //     console.error("Login failed:", error.message);
  // //     setError(error.message);
  // //     alert(error.message);
  // //   }
  // // };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password
  //   });

  //     if (error) throw error;
  //     if (!data.user) throw new Error("Authentication failed: No user found.");

  //     alert("Login successful!");
  //     console.log("Login successful:", data.user);

  //     // Fetch user role from backend
  //     const userId = data.user.id;
  //     if (!userId) throw new Error("User ID is missing.");

  //     const response = await fetch(
  //       `http://localhost:5000/auth/user-full/${userId}`
  //     );
  //     const userData = await response.json();

  //     if (!response.ok) throw new Error(userData.error);

  //     console.log("User Full Data:", userData);

  //     // Store full user profile in both sessionStorage & localStorage
  //     const fullUserData = {
  //       user: userData.user,
  //       profile: userData.profile,
  //       role: userData.role,
  //       interests: userData.interests,
  //     };

  //     sessionStorage.setItem("userProfile", JSON.stringify(fullUserData));
  //     localStorage.setItem("userProfile", JSON.stringify(fullUserData));

  //     // Redirect based on role
  //     if (userData.role === "Free") {
  //       navigate("/freeDashboard");
  //     } else if (userData.role === "Premium") {
  //       navigate("/premiumDashboard");
  //     }  else {
  //       navigate("/adminDashboard")
  //     }
  //   } catch (error) {
  //     console.error("Login failed:", error.message);
  //     setError(error.message);
  //     alert(error.message);
  //   }
  // };

  const { email, setEmail, password, setPassword, error, handleLogin } = useAuthHook();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      {/* Login Section */}
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full sm:max-w-3xl max-w-md p-6">
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
                value={email}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-6 w-full">
              <button
                type="button"
                className=" sm:w-auto px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
              <button
                type="button"
                className="sm:w-auto px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Reset Password
              </button>
              <button
                type="submit"
                className="  px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
              >
                Submit
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}

          </form>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
