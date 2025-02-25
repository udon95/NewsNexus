import React, { useEffect, useState } from "react";
import supabase from "../api/supabaseClient.js";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch logged-in user from Supabase

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Fetched User from Supabase:", user);
      setUser(user);
    };

    fetchUser();

    // Listen for authentication changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth State Changed:", session);
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const userEmail = user?.email;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "P";

  // Logout function  
  const logout = async () => {
    console.log("Checking Supabase Instance:", supabase); // 🔍 Debugging step
  
    if (!supabase) {
      alert("Supabase is not initialized!");
      return;
    }
  
    try {
      console.log("Attempting to log out...");
  
      const { error } = await supabase.auth.signOut();
  
      console.log("SignOut Response:", error); // 🔍 Debugging step
  
      if (error) {
        console.error("Logout failed:", error.message);
        alert("Logout failed: " + error.message);
        return;
      }
  
      console.log("User logged out successfully");
  
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      alert("Unexpected error: " + error.message);
    }
  };
  
  

  const renderNavLinks = () => {
    return <></>;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-[60px] py-4">
        <Link to="/">
          <img
            loading="lazy"
            src={logo}
            className="h-10 sm:h-12 w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
        </Link>

        <nav className="nav-items flex items-center gap-6">
          {renderNavLinks()}

          {/* Show Profile Button if User is Logged In */}
          {userEmail ? (
            <button
              className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
              onClick={() => navigate("/profile")}
              title="Profile"
            >
              {userInitial}
            </button>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}

          {/* Show Logout if Logged In */}

          <button
            onClick={logout}
            className="text-red-500 font-medium hover:underline"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
