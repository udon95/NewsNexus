import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";
import useAuthHook from "../hooks/useAuth.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { user, userType, handleLogout, loading } = useAuthHook();
  const navigate = useNavigate();
  const [profileColor, setProfileColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("black");
  const { color: contextColor } = useAuth();

  useEffect(() => {
    if (contextColor) {
      setProfileColor(contextColor);
      setTextColor(getTextColor(contextColor));
    }
  }, [contextColor]);

  const getLuminance = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Convert RGB to relative luminance using the formula
    const a = [r, g, b].map((x) =>
      x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    );
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getTextColor = (color) => {
    const luminance = getLuminance(color);
    return luminance > 0.5 ? "black" : "white"; // Dark background -> Light text, and vice versa
  };

  const handleProfileClick = () => {
    if (!userType) {
      const cachedProfile =
        localStorage.getItem("userProfile") ||
        sessionStorage.getItem("userProfile");
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
            className="sm:ml-10 h-10 sm:h-12  w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          {/* Show Profile Button if User is Logged In */}
          {!user && !loading && (
            <>
              <button
                className="px-2 py-1 bg-[#191A23] font-grotesk text-white rounded-lg hover:bg-opacity-90 w-[80px]"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
              <button
                className="px-2 py-1 bg-[#191A23] font-grotesk text-white rounded-lg hover:bg-opacity-90 w-[80px]"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </>
          )}
          {user ? (
            <button
              className="h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
              onClick={handleProfileClick}
              title="Profile"
              style={{ backgroundColor: profileColor, color: textColor }}
            >
              {user.username}
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
