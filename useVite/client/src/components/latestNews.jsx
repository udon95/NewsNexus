// src/pages/LatestNews.jsx
import React from "react";
import NewsCard from "./newsCard";

const newsData = [
  {
    title: "Latest Malaysian Forest Fire",
    imageUrl: "/vite.svg", // Replace with actual image URL
    rating: 4,
  },
  {
    title: "US Currency Strengthens Again",
    imageUrl: "",
    rating: 3,
  },
  {
    title: "Personal Top 5 Singaporean Xiao Mei Mei",
    imageUrl: "",
    rating: 2,
  },
];

const LatestNews = () => {
  return (
    <div className="w-full max-w-[900px] mx-auto ">
      <h2 className="text-3xl font-bold font-grotesk mb-4">Latest News :</h2>

      {/* News Cards */}
      <div className="space-y-6">
        {newsData.map((news, index) => (
          <NewsCard key={index} title={news.title} imageUrl={news.imageUrl} rating={news.rating} />
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
