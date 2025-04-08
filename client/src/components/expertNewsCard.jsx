import React from "react";
import NewsCard from "./newsCard"; //  Ensure correct path to NewsCard

const expertArticles = [
  {
    title: "My Favorite Top 5 Singaporean Xiao Mei Mei",
    imageUrl: "/assets/test.png", // Replace with actual image URL
    rating: 4,
  },
  {
    title: "Personal Commentary: Soaring MRT Transport Prices",
    imageUrl: "",
    rating: 3,
  },
];

const ExpertNewsCard = ({ searchQuery = "", disableNavigation }) => {
  const filteredExpertArticles = expertArticles.filter((news) =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="w-full max-w-[900px] mx-auto space-y-6 font-grotesk">
    {filteredExpertArticles.map((news, index) => (
      <div key={index} className="relative ">
        <div
          className="relative cursor-pointer"
          onClickCapture={(e) => {
            if (disableNavigation) {
              e.preventDefault();
              e.stopPropagation();
              alert("You need to subscribe as Premium to access Expert articles!");
            }
          }}
        >
          <NewsCard
            title={news.title}
            imageUrl={news.imageUrl}
            rating={news.rating}
          />
          <span className="absolute top-3 right-12 bg-[#BFD8FF] text-blue-900 text-xs font-bold px-3 py-1 rounded-md shadow-md">
            Expert
          </span>
        </div>
      </div>
    ))}
  </div>
  );
};

export default ExpertNewsCard;
