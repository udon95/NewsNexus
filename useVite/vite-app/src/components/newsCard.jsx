import React from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook

const NewsCard = ({ title, imageUrl, rating }) => {
  const navigate = useNavigate();

  // Function to generate stars
  const renderStars = () => {
    return [...Array(4)].map((_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400 text-xl" : "text-gray-400 text-xl"}>
        ★
      </span>
    ));
  };

  // Handle clicking on the card
  const handleCardClick = () => {
    navigate(`/article/${encodeURIComponent(title)}`); // Redirect to article page
  };

  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden w-full max-w-[900px] mx-auto cursor-pointer hover:shadow-xl transition"
      onClick={handleCardClick} // Make the whole card clickable
    >
      {/* Image Section with Overlayed Vertical Stars */}
      <div className="relative w-full h-[200px]">
        <img 
          src={imageUrl || "https://via.placeholder.com/900x500"} // Default placeholder
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Star Ratings - Now Vertical */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1 bg-opacity-50 p-1 rounded-lg">
          {renderStars()}
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
