import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navbar.jsx";
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
  const [topics, setTopics] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const { user, userType } = useAuthHook();
  const isPremium = userType === "Premium";
  const isSearching = searchQuery.trim() !== "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const params = { query };
    if (selectedTopic) params.topic = selectedTopic;
    setSearchParams(params);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    const params = { topic: value };
    if (searchQuery) params.query = searchQuery;
    setSearchParams(params);
  };

  useEffect(() => {
    const loadAll = async () => {
      const { data: topicData, error: topicError } = await supabase
        .from("topic_categories")
        .select("topicid, name");

      if (!topicError && topicData) {
        setTopics(topicData);

        if (user) {
          const { data: interestData, error: interestError } = await supabase
            .from("topicinterest")
            .select("interesttype")
            .eq("userid", user.userid);

          if (!interestError && interestData?.length > 0) {
            const parsedInterests = interestData[0].interesttype.split(", ");
            setUserInterests(parsedInterests);

            // ✅ Fallback to recommended if no topic selected in URL and interests exist
            if (!searchParams.get("topic") && parsedInterests.length > 0) {
              setSelectedTopic("recommended");
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("topic", "recommended");
                return params;
              });
            }
          }
        }
      }
    };

    loadAll();
  }, [user]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.query = searchQuery;
    if (selectedTopic) params.topic = selectedTopic;
    setSearchParams(params);
  }, [searchQuery, selectedTopic]);

  const selectedTopicName = topics.find((t) => t.topicid === selectedTopic)?.name;
  const interestTopicIDs = topics
    .filter((t) => userInterests.includes(t.name))
    .map((t) => t.topicid);

  let pageTitle = "Explore All Articles:";
  if (selectedTopic === "recommended") {
    pageTitle = "Explore My Articles:";
  } else if (selectedTopicName) {
    pageTitle = `Explore “${selectedTopicName}” Articles:`;
  }

  let resolvedTopic = "";
  if (selectedTopic === "recommended") {
    resolvedTopic = interestTopicIDs;
  } else if (selectedTopic) {
    resolvedTopic = selectedTopic;
  }

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-col sm:flex-row justify-center items-center min-w-[900px] gap-4 mt-5 px-4">
        <div className="w-full max-w-[600px]">
          <Search onSearch={handleSearch} initialQuery={searchQuery} />
        </div>
        <select
          value={selectedTopic}
          onChange={(e) => handleTopicChange(e.target.value)}
          className="w-full max-w-[200px] p-2 mt-10 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          <option value="recommended">Recommended for you</option>
          {topics.map((cat) => (
            <option key={cat.topicid} value={cat.topicid}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {isSearching ? (
        <>
          <div className="w-full font-grotesk mt-8">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Search Results:
            </h1>
            <div className="flex justify-center w-full">
              <Rank searchQuery={searchQuery} topic={resolvedTopic} />
            </div>
          </div>
          <div className="w-full font-grotesk mt-5">
            <div className="flex justify-center mb-5 w-full">
              <Expert searchQuery={searchQuery} disableNavigation={!isPremium} topic={resolvedTopic} />
            </div>
          </div>
          <div className="w-full font-grotesk">
            <div className="flex justify-center mb-5 w-full">
              <LatestNews searchQuery={searchQuery} topic={resolvedTopic} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full font-grotesk mt-8">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              {pageTitle}
            </h1>
            <div className="flex justify-center w-full">
              <Rank searchQuery={searchQuery} topic={resolvedTopic} />
            </div>
            <div className="w-full font-grotesk mt-5">
              <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
                Expert:
              </h1>
              <div className="flex justify-center mb-5 w-full">
                <Expert disableNavigation={!isPremium} topic={resolvedTopic} />
              </div>
            </div>
          </div>
          <div className="w-full font-grotesk mt-5">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Latest News:
            </h1>
            <div className="flex justify-center mb-5 w-full">
              <LatestNews searchQuery={searchQuery} topic={resolvedTopic} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
