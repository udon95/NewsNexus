import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { React, useEffect } from "react";

const FloatingWriteButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let user = null;
  let role = null;

  try {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const parsed = JSON.parse(stored);
      user = parsed?.user;
      role = parsed?.role;
    }
  } catch (err) {
    console.error("Error reading user from localStorage:", err);
  }

  if (!user) return null;

  const currentPath = location.pathname;

  const hiddenPaths = [
    "/freeDashboard/writeArticle",
    "/premiumDashboard/writeArticle",
  ];
  if (hiddenPaths.includes(currentPath)) return null;

  const handleClick = () => {
    if (currentPath.startsWith("/room/")) {
      const roomid = currentPath.split("/")[2]; // get room ID from URL
      navigate(`/premiumDashboard/writeArticle?type=room&roomid=${roomid}`);
    } else {
      // Normal behavior
      if (role === "Premium") {
        navigate("/premiumDashboard/writeArticle");
      } else {
        navigate("/freeDashboard/writeArticle");
      }
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
