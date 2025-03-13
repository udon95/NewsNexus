import React from "react";
import NewsCard from "./newsCard";

const newsData = [
  {
    title: "Latest Malaysian Forest Fire",
    imageUrl: "/vite.svg",
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

const LatestNews = ({ searchQuery = "" }) => {
  const filteredNewsData = newsData.filter((news) =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="w-full max-w-[900px] mx-auto ">
      {/* News Cards */}
      <div className="space-y-6">
        {filteredNewsData.map((news, index) => (
          <NewsCard
            key={index}
            title={news.title}
            imageUrl={news.imageUrl}
            rating={news.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
