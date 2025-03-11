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

const ExpertNewsCard = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 space-y-6 font-grotesk">
      {expertArticles.map((news, index) => (
        <div key={index} className="relative">
          {/*  Wrap the NewsCard inside a div with relative positioning */}
          <div className="relative">
            <NewsCard
              title={news.title}
              imageUrl={news.imageUrl}
              rating={news.rating}
            />

            {/*  "Expert" Tag (Moved Inside the Card, Adjusted to Top Right) */}
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
