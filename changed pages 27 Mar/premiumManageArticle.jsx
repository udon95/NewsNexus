import React, { useState, useEffect } from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";
import { useArticleContext } from "../../context/ArticleContext.jsx";
import SearchBar from "../search.jsx"; // Import Search.jsx
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export const PremManageArticle = () => {
  const navigate = useNavigate();
  const { postedArticles, draftArticles } = useArticleContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showArticleTypeDropdown, setShowArticleTypeDropdown] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".topic-dropdown")) {
        setShowDropdown(false);
      }
      if (!event.target.closest(".article-type-dropdown")) {
        setShowArticleTypeDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);  

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
              
              <div className="flex flex-wrap items-center gap-8">
                {/* Topic Filter */}
                <div className="flex items-center gap-4 topic-dropdown">
                  <label className="text-lg">Filter by Topic:</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(prev => !prev)}
                      className="flex items-center gap-2 px-2 py-2 bg-[#191A23] text-white border rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <FilterAltIcon />                     
                    </button>

                    {showDropdown && (
                      <ul className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {topics.map((topic, index) => (
                          <li
                            key={index}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                              selectedTopic === topic ? "bg-blue-200 font-semibold" : ""
                            }`}
                            onClick={() => {
                              setSelectedTopic(topic);
                              setShowDropdown(false);
                            }}
                          >
                            {topic}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Article Type Filter */}
                <div className="flex items-center gap-4 article-type-dropdown">
                  <label className="text-lg">Show:</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowArticleTypeDropdown(prev => !prev)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#191A23] text-white border rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {articleType === "all"
                        ? "All"
                        : articleType === "posted"
                        ? "Posted"
                        : "Draft"}
                    </button>

                    {showArticleTypeDropdown && (
                      <ul className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {["all", "posted", "draft"].map((type) => (
                          <li
                            key={type}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                              articleType === type ? "bg-blue-200 font-semibold" : ""
                            }`}
                            onClick={() => {
                              setArticleType(type);
                              setShowArticleTypeDropdown(false);
                            }}
                          >
                            {type === "all"
                              ? "All"
                              : type === "posted"
                              ? "Posted"
                              : "Draft"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Bar (Second Row, Below Filters, Left-Aligned) */}
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

export default PremManageArticle;