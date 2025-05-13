import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
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
    "/adminDashboard/*",
  ];
  const normalizedPath = currentPath.replace(/\/+$/, ""); // remove trailing slashes

  if (
    hiddenPaths.some((path) =>
      normalizedPath.startsWith(path.replace("/*", ""))
    )
  )
    return null;
  const handleClick = () => {
    if (currentPath.startsWith("/room/")) {
      const roomid = currentPath.split("/")[2]; // get room ID from URL
      // console.log(roomid);
      if (roomid) {
        navigate(`/premiumDashboard/writeArticle?type=room&roomid=${roomid}`);
        return;
      }
    }

    // Normal behavior
    if (role === "Premium") {
      navigate("/premiumDashboard/writeArticle");
    } else {
      navigate("/freeDashboard/writeArticle");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg z-50 transition duration-300"
    >
      <Pencil size={18} />
      <span className="font-semibold text-sm">Publish</span>
    </button>
  );
};

export default FloatingWriteButton;
