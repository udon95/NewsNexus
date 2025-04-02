import React, { useState } from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";
import { useArticleContext } from "../../context/ArticleContext.jsx";
import SearchBar from "../search.jsx"; // Import Search.jsx

export const FreeManageMyArticles = () => {
  const navigate = useNavigate();
  const { postedArticles, draftArticles } = useArticleContext();

  // List of available topics
  const topics = [
    "All Topics",
    "Finance",
    "Politics",
    "Entertainment",
    "Sports",
    "Weather",
    "Lifestyle",
    "Beauty",
    "Hollywood",
    "China",
    "Horticulture",
    "Culinary",
    "LGBTQ++",
    "Singapore",
    "Environment",
    "Investment",
    "USA",
    "Luxury",
    "Korea",
  ];

  // States for filtering
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [articleType, setArticleType] = useState("all"); // "all", "posted", "draft"
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Function to filter articles by topic and search query
  const filterArticles = (articles) => {
    let filtered = articles;

    if (selectedTopic !== "All Topics") {
      filtered = filtered.filter((article) => article.includes(selectedTopic));
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((article) =>
        article.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Handle article click event
  const handleArticleClick = (article) => {
    console.log(`Clicked on: ${article}`);
    navigate(`/article/${encodeURIComponent(article)}`);
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              
              {/* Topic Filter (First Row) */}
              <div className="mb-4 flex items-center gap-4">
                <label className="text-lg">Filter by Topic:</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="p-2 border rounded-lg shadow-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {topics.map((topic, index) => (
                    <option key={index} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Article Type Toggle (Second Row) */}
              <div className="mb-4 flex items-center gap-4">
                <label className="text-lg">Show:</label>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg shadow-md ${
                      articleType === "all"
                        ? "bg-black text-white"
                        : "bg-gray-200 text-black"
                    }`}
                    onClick={() => setArticleType("all")}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg shadow-md ${
                      articleType === "posted"
                        ? "bg-black text-white"
                        : "bg-gray-200 text-black"
                    }`}
                    onClick={() => setArticleType("posted")}
                  >
                    Posted
                  </button>
                  <button
                    className={`px-2 py-2 rounded-lg shadow-md ${
                      articleType === "draft"
                        ? "bg-black text-white"
                        : "bg-gray-200 text-black"
                    }`}
                    onClick={() => setArticleType("draft")}
                  >
                    Draft
                  </button>
                </div>
              </div>

              {/* Search Bar (Third Row, Below Toggle, Left-Aligned) */}
              <div className="mb-4 flex">
                <div className="w-full max-w-[700px]"> 
                  <SearchBar onSearch={setSearchQuery} />
                </div>
              </div>

              {/* Filtered Article Lists */}
              {(articleType === "all" || articleType === "posted") && (
                <ArticleList
                  title="My Posted Articles:"
                  articles={filterArticles(postedArticles)}
                  isDraft={false}
                  onArticleClick={handleArticleClick}
                />
              )}
              {(articleType === "all" || articleType === "draft") && (
                <ArticleList
                  title="My Drafts:"
                  articles={filterArticles(draftArticles)}
                  isDraft={true}
                  onArticleClick={handleArticleClick}
                />
              )}             
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeManageMyArticles;