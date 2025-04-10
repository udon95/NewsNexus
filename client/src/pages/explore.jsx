import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import Search from "../components/search.jsx";
import Rank from "../components/articlesRank.jsx";
import Expert from "../components/expertNewsCard.jsx";
import LatestNews from "../components/latestNews.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import supabase from "../api/supabaseClient";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialTopic = searchParams.get("topic") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [topics, setTopics] = useState([
    { label: "All Categories", name: "", value: "" },
  ]);
  const { user, userType } = useAuthHook();
  const isPremium = userType === "Premium";
  const isSearching = searchQuery.trim() !== "";

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");

      if (error) {
        console.error("Error fetching topics:", error);
        return;
      }

      const formatted = [
        { label: "All Categories", name: "", value: "" },
        ...data.map((t) => ({
          label: t.name,
          name: t.name,
          value: t.topicid, // UUID
        })),
      ];

      setTopics(formatted);
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const params = { query: searchQuery };
    if (selectedTopic) params.topic = selectedTopic;
    setSearchParams(params);
  }, [searchQuery, selectedTopic, setSearchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchParams({ query });
  };

  const userInterests =
    user?.interests ||
    JSON.parse(localStorage.getItem("userProfile"))?.interests;

  const currentTopic = topics.find((t) => t.value === selectedTopic);
  let pageTitle = "Explore All Articles:";
  if (currentTopic && currentTopic.name) {
    pageTitle = `Explore “${currentTopic.name}” Articles:`;
  } else if (userInterests && userInterests.length > 0) {
    pageTitle = "Explore My Articles:";
  } else if (user) {
    pageTitle = "Explore ‘My Articles’:";
  }

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Search & Filter */}
      <div className="flex flex-row justify-center items-end min-w-[900px] gap-4 mt-6 px-4">
  {/* Search Bar */}
  <div className="w-full max-w-[600px]">
    <Search onSearch={handleSearch} />
  </div>

  {/* Category Filter Dropdown */}
  <select
    value={selectedTopic}
    onChange={(e) => setSelectedTopic(e.target.value)}
    className="h-[48px] w-full max-w-[200px] px-3 py-2 border border-gray-300 rounded-md z-10"
  >
    {topics.map((topic) => (
      <option key={topic.value} value={topic.value}>
        {topic.label}
      </option>
    ))}
  </select>
</div>



      {/* Search Results */}
      {isSearching ? (
        <div className="w-full font-grotesk mt-8">
          <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
            Search Results:
          </h1>

          <div className="flex justify-center w-full">
            <Rank searchQuery={searchQuery} topic={selectedTopic} />
          </div>

          <div className="w-full font-grotesk mt-5">
            <div className="flex justify-center mb-5 w-full">
              <Expert
                searchQuery={searchQuery}
                disableNavigation={!isPremium}
                topic={selectedTopic}
              />
            </div>
          </div>

          <div className="flex justify-center mb-5 w-full">
            <LatestNews searchQuery={searchQuery} topic={selectedTopic} />
          </div>
        </div>
      ) : (
        <>
          {/* Default View */}
          <div className="w-full font-grotesk mt-8">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              {pageTitle}
            </h1>

            <div className="flex justify-center w-full">
              <Rank searchQuery={searchQuery} topic={selectedTopic} />
            </div>
          </div>

          <div className="w-full font-grotesk mt-5">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Expert:
            </h1>

            <div className="flex justify-center mb-5 w-full">
              <Expert disableNavigation={!isPremium} topic={selectedTopic} />
            </div>
          </div>

          <div className="w-full font-grotesk">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Latest News:
            </h1>

            <div className="flex justify-center mb-5 w-full">
              <LatestNews searchQuery={searchQuery} topic={selectedTopic} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
