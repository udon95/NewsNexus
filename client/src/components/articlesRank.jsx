import React from "react";
import { useNavigate } from "react-router-dom";
import lhlImage from "../assets/lhl.png"; // ✅ Rank #1 (LHL Article)
import rank2Image from "../assets/sports.jpg"; // ✅ Rank #2 Image
import rank3Image from "../assets/food.jpg"; // ✅ Rank #3 Image

const ArticlesRank = () => {
  const navigate = useNavigate();

  // Mapping article data
  const articles = [
    { id: 1, title: "Personal Legacy of Lee Hsien Loong", image: lhlImage, link: "/article" },
    { id: 2, title: "Rank #02 Article", image: rank2Image, link: "/article/2" },
    { id: 3, title: "Rank #03 Article", image: rank3Image, link: "/article/3" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-left mt-6">
        Explore All <span className="italic">"My"</span> Articles:
      </h1>

      {/* Article Ranking Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => navigate(article.link)}
            className="bg-gray-100 rounded-xl shadow-lg p-4 flex flex-col items-center w-full border border-gray-300 cursor-pointer hover:bg-gray-200 transition"
          >
            {/* Rank Title */}
            <h2 className="text-lg font-semibold mb-2">Rank #{article.id}</h2>

            {/* Article Image */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-40 object-cover rounded-lg mb-4 bg-gray-300"
            />

            {/* Bottom Divider */}
            <div className="w-full h-0.5 bg-gray-300"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArticlesRank;
