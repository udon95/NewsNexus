import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import useAuthHook from "../hooks/useAuth"; // adjust path if needed
import React from "react";

const FloatingWriteButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthHook();

  if (!user) return null;

  // Don't show on write pages
  const currentPath = location.pathname;
  if (
    currentPath === "/freeDashboard/writeArticle" ||
    currentPath === "/premiumDashboard/writeArticle"
  ) {
    return null;
  }

  const handleClick = () => {
    if (user.usertype === "Premium") {
      navigate("/premiumDashboard/writeArticle");
    } else {
      navigate("/freeDashboard/writeArticle");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition duration-300"
      aria-label="Write Article"
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingWriteButton;
