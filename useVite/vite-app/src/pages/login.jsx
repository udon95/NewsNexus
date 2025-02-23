import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      {/* Login Section */}
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-8 font-grotesk">
            Login
          </h2>

          <form className="space-y-6 w-full font-grotesk">
            {/* Email Field */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label htmlFor="email" className="text-2xl font-normal text-black w-40 text-left">
                E-mail:
              </label>
              <input
                id="email"
                type="email"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <label htmlFor="password" className="text-2xl font-normal text-black w-40 text-left">
                Password:
              </label>
              <input
                id="password"
                type="password"
                className="p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-md w-full"
                placeholder="Enter your password"
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
                Forgot
              </button>
              <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90">
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


