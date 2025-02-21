// src/components/NewsCard.jsx
import React from "react";

const NewsCard = ({ title, imageUrl, rating }) => {
  // Function to generate stars
  const renderStars = () => {
    return [...Array(4)].map((_, index) => (
      <span key={index} className={index < rating ? "text-black" : "text-gray-400"}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden w-full max-w-[900px] mx-auto">
      <div className="flex p-4">
        {/* Star Ratings */}
        <div className="flex flex-col space-y-1 pr-3">{renderStars()}</div>

        {/* Image Placeholder */}
        <div className="w-full h-[150px] bg-gray-200 flex items-center justify-center">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Article Title */}
      <div className="px-4 py-2 border-t bg-gray-100">
        <p className="font-semibold text-black">{title}</p>
      </div>
    </div>
  );
};

export default NewsCard;
