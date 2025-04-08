import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navbar.jsx";
import Search from "../components/search.jsx";
import Rank from "../components/articlesRank.jsx";
import Expert from "../components/expertNewsCard.jsx";
import News from "../components/newsCard.jsx";
import LatestNews from "../components/latestNews.jsx";
import useAuthHook from "../hooks/useAuth.jsx";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialTopic = searchParams.get("topic") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const isSearching = searchQuery.trim() !== "";
  const { user, userType, loading } = useAuthHook(); // Now 'user' is defined
  const isPremium = userType === "Premium";
  const topicParam = searchParams.get("topic"); // e.g., "Politics"

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchParams({ query });
  };
  const userInterests =
    user?.interests ||
    JSON.parse(localStorage.getItem("userProfile"))?.interests;

  let pageTitle = "Explore All Articles:";
  if (topicParam) {
    pageTitle = `Explore “${topicParam}” Articles:`; // Set the page title based on the selected topic
  } else if (userInterests && userInterests.length > 0) {
    pageTitle = `Explore My Articles:`; // If user has interests, use them
  } else if (user) {
    pageTitle = "Explore ‘My Articles’:";
  }
  useEffect(() => {
    const params = { query: searchQuery };
    if (selectedTopic) params.topic = selectedTopic;
    setSearchParams(params);
  }, [searchQuery, selectedTopic, setSearchParams]);

  // const handleSearch = (query) => {
  //   setSearchQuery(query);
  // };
  const categories = [
    { label: "All Categories", value: "" },
    { label: "Politics", value: "Politics" },
    { label: "Finance", value: "Finance" },
    { label: "Entertainment", value: "Entertainment" },
    { label: "Sports", value: "Sports" },
    { label: "Technology", value: "Technology" },
  ];
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-col sm:flex-row justify-center items-center min-w-[900px] gap-4 mt-5 px-4">
        <div className="w-full max-w-[600px]">
          <Search onSearch={handleSearch} />
        </div>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full max-w-[200px] p-2 mt-10 border border-gray-300 rounded-md"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      {isSearching ? (
        <div className="w-full font-grotesk mt-8">
          <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
            Search Results:
          </h1>
          <div className="w-full font-grotesk ">
            <div className="flex justify-center w-full ">
              <Rank searchQuery={searchQuery} topic={topicParam} />
            </div>
          </div>

          <div className="w-full font-grotesk mt-5">
            <div className="flex justify-center mb-5 w-full">
              <Expert
                searchQuery={searchQuery}
                disableNavigation={!isPremium}
                topic={topicParam}
              />
            </div>
          </div>

          <div className="w-full font-grotesk ">
            <div className="flex justify-center mb-5 w-full "></div>
            <LatestNews searchQuery={searchQuery} topic={topicParam} />
          </div>
        </div>
      ) : (
        <>
          <div className="w-full font-grotesk mt-8">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              {pageTitle}
            </h1>
            <div className="flex justify-center w-full ">
              <Rank searchQuery={searchQuery} topic={topicParam} />
            </div>
          </div>

          <div className="w-full font-grotesk mt-5">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Expert:
            </h1>
            <div className="flex justify-center mb-5 w-full ">
              <Expert disableNavigation={!isPremium} topic={topicParam} />
            </div>
          </div>

          <div className="w-full font-grotesk ">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Latest News:
            </h1>
            <div className="flex justify-center mb-5 w-full ">
              <LatestNews searchQuery={searchQuery} topic={topicParam} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
