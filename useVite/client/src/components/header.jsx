import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";
import useAuthHook from "../hooks/useAuth.jsx";

const Header = () => {
  const { user, userType, handleLogout } = useAuthHook();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    // console.log("Navigating to:", userType); 
    if (!userType) {
      // console.warn("UserType is null! Fetching from sessionStorage...");
      const cachedProfile = sessionStorage.getItem("userProfile");
      if (cachedProfile) {
        const data = JSON.parse(cachedProfile);
        setUserType(data.userType || "Unknown");
      }
    }
    if (userType === "Free") {
      navigate("/freeDashboard");
    } else if (userType === "Premium") {
      navigate("/premiumDashboard");
    } else if (userType === "Admin") {
      navigate("/adminDashboard");
    } else {
      navigate("/login"); 
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div
        className="max-w-screen-xl 
      mx-auto 
      flex items-center justify-between
      px-14       /* Base padding */
      sm:px-6    /* For ≥640px */
      md:px-8    /* For ≥768px */
      lg:px-12   /* For ≥1024px */
      py-4
    "
      >
        <Link to="/">
          <img
            loading="lazy"
            src={logo}
            className="h-10 sm:h-12  w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          {/* Show Profile Button if User is Logged In */}
          {user ? (
            <button
              className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
              onClick={handleProfileClick}
              title="Profile"
            >
              {user.email.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              className="px-2 py-1 bg-[#191A23] font-grotesk text-white rounded-lg hover:bg-opacity-90 w-[80px]"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}

          {user !== null && (
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium hover:underline"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
