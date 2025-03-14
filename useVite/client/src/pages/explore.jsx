import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import Search from "../components/search.jsx";
import Rank from "../components/articlesRank.jsx";
import Expert from "../components/expertNewsCard.jsx";
import News from "../components/newsCard.jsx";
import LatestNews from "../components/latestNews.jsx";
import useAuthHook from "../hooks/useAuth.jsx";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
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


  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <Search onSearch={handleSearch} />
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
