import React from "react";
import {useNavigate} from "react-router-dom";
import "../index.css";


function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav className="w-full bg-blue-200 py-3 shadow-md overflow-x-auto ">
        <div className="max-w-screen-lg mx-auto flex flex-nowrap justify-center items-center text-sm sm:text-lg text-blue-900 whitespace-nowrap gap-6 px-4">
          <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
          <a href="/" className="hover:underline px-4 sm:px-6 font-bold">
            Home
          </a>
          <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
          <a href="/explore" className="hover:underline px-4 sm:px-6 font-bold">
            Explore
          </a>
          <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
          <a
            href="/subscription"
            className="hover:underline px-4 sm:px-6 font-bold"
          >
            Subscription
          </a>
          <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
          <a
            href="/guidelines"
            className="hover:underline px-4 sm:px-6 font-bold"
          >
            Platform Guidelines
          </a>
          <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
        </div>
      </nav>

      {/* Login Section */}
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4 sm:px-6">
        <div className="flex flex-col  bg-white shadow-lg rounded-lg p-4 max-w-xl w-full">
          <h2 className="text-7xl sm:text-5xl font-bold text-gray-900 mb-4 font-grotesk">
            Login
          </h2>
          <form className="space-y-3 sm:space-y-5">
            {/* Email Field */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="email"
                className="text-sm sm:text-lg font-medium text-black w-24"
              >
                Email:
              </label>
              <input
                id="email"
                type="email"
                className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="password"
                className="text-sm sm:text-lg font-medium text-black w-24"
              >
                Password:
              </label>
              <input
                id="password"
                type="password"
                className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                placeholder="Enter your password"
              />
            </div>

            {/* Buttons Section */}
            <div className="flex justify-end gap-3 mt-4 sm:mt-4">
              <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto"
              onClick={() => navigate("/register")}>
                Register
              </button>
              <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto">
                Forgot
              </button>
              <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto">
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
