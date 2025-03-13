import React from "react";
import { useNavigate } from "react-router-dom";
import rank1Image from "../assets/test.png"; //  Rank #1 (LHL Article)
import rank2Image from "../assets/test.png"; //  Rank #2 Image
import rank3Image from "../assets/test.png"; //  Rank #3 Image

const articles = [
  {
    id: 1,
    title: "Personal Legacy of Lee Hsien Loong",
    image: rank1Image,
   
  },
  { id: 2, title: "Rank #02 Article", image: rank2Image },
  { id: 3, title: "Rank #03 Article", image: rank3Image},
];

const ArticlesRank = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  
  const filteredArticles = articles.filter((news) =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleCardClick = (title) => {
    // e.g., /article/Personal%20Legacy%20of%20Lee%20Hsien%20Loong
    navigate(`/article/${encodeURIComponent(title)}`);
  };
  return (
    <div className="w-full max-w-5xl mx-auto px-16 font-grotesk">
      {/* Page Title */}
      {/* <h1 className="text-2xl sm:text-3xl text-left mt-6">
        <p>
          Explore All <em>‘My’</em> Articles:{" "}
        </p>
      </h1> */}

      {/* Article Ranking Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3  max-w-[900px]">
        {filteredArticles.map((article) => (
          <button
            key={article.id}
            onClick={() => handleCardClick(article.title)}
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
            <div className="w-full h-0.5 bg-gray-300 mb-4">{article.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArticlesRank;
