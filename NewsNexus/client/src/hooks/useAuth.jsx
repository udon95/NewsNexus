import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const useAuthHook = () => {
  const { user, userType, signInWithPass, signOut, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState("");
  const [localProfile, setLocalProfile] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handles Login Functionality
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const {
        user,
        userType,
        interests = [],
        profile = {},
      } = await signInWithPass(email, password);
      if (!user) throw new Error("Authentication failed: No user found.");

      alert("Login successful!");
      const formattedInterests = Array.isArray(interests)
        ? interests
        : interests.split(", ").map((topic) => topic.trim()) || [];

      // Store user data in sessionStorage & localStorage
      const fullUserData = {
        user,
        role: userType,
        interests: formattedInterests,
        profile: profile || {},
      };
      sessionStorage.setItem("userProfile", JSON.stringify(fullUserData));
      localStorage.setItem("userProfile", JSON.stringify(fullUserData));

      setInterests(formattedInterests);

      // Redirect based on role
      if (userType === "Free") navigate("/explore");
      else if (userType === "Premium") navigate("/explore");
      else navigate("/adminDashboard");
    } catch (error) {
      console.error("Login failed:", error.message);
      setError(error.message);
      alert(error.message);
    }
  };

  // Handles Logout Functionality
  const handleLogout = async () => {
    try {
      await signOut();
      sessionStorage.removeItem("userProfile");
      localStorage.removeItem("userProfile");
      setInterests([]);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    const storedUser =
      sessionStorage.getItem("userProfile") ||
      localStorage.getItem("userProfile");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const storedInterests = parsedUser.interests || [];

      // console.log("Loaded interests from storage:", storedInterests);

      // Ensure stored interests are properly formatted as an array
      const formattedInterests = Array.isArray(storedInterests)
        ? storedInterests
        : storedInterests.split(", ").map((topic) => topic.trim());

      setInterests(formattedInterests);
    }
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleLogin,
    handleLogout,
    user,
    userType,
    interests,
    profile,
  };
};

export default useAuthHook;
