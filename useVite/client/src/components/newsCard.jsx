import React from "react";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown } from "lucide-react"; // Import thumbs icons

const NewsCard = ({ title, imageUrl }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/article/${encodeURIComponent(title)}`); // Redirect to article page
  };

  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden w-full max-w-[900px] mx-auto cursor-pointer hover:shadow-xl transition"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative w-full h-[200px]">
        <img
          src={imageUrl || "test.png"}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* 👍👎 Thumbs Rating Box */}
        <div className="absolute top-2 left-2 bg-gray-200 p-2 rounded-lg flex flex-col items-center shadow-md">
          {/* Thumbs Up Icon */}
          <ThumbsUp size={20} className="text-green-500" />
          <span className="text-xs font-semibold text-black">1K+</span>
          <div className="mt-3.5"></div> 
          {/* Thumbs Down Icon */}
          <ThumbsDown size={20} className="text-red-500 mt-1" />
          <span className="text-xs font-semibold text-black">5</span>
        </div>
      </div>

      {/* Article Title */}
      <div className="px-4 py-3 border-t bg-gray-100">
        <p className="font-semibold text-black">{title}</p>
      </div>
    </div>
  );
};

export default NewsCard;
