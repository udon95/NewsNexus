import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../index.css";
import Navbar from "../components/navbar.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import PasswordInput from "../components/showPW.jsx";

function LoginPage() {
  const navigate = useNavigate();

  const { email, setEmail, password, setPassword, error, handleLogin } =
    useAuthHook();
  // const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
  }, []);
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
              <PasswordInput
                // type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3  rounded-lg  bg-[#F3F3F3]   focus:ring-2 focus:ring-blue-500  shadow-md w-full"
                placeholder="Enter your password"
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
        <button
          type="button"
          onClick={resendConfirmationEmail}
          className="mt-4 text-sm underline"
        >
          Resend confirmation email
        </button>
      </main>
    </div>
  );
}

export default LoginPage;
