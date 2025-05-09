import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navbar.jsx";
import Search from "../components/exploreSearch.jsx";
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
  const [resolvedTopicId, setResolvedTopicId] = useState(""); // 🆕 NEW
  const [topics, setTopics] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Latest");
  const [isInterestsLoaded, setIsInterestsLoaded] = useState(false);

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

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
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

        // Match name from URL to topicid
        if (initialTopic && topicData.length > 0) {
          const matched = topicData.find(
            (t) =>
              t.name.toLowerCase().trim() === initialTopic.toLowerCase().trim()
          );
          if (matched) {
            setSelectedTopic(matched.topicid);
            setResolvedTopicId(matched.topicid);
          } else {
            setSelectedTopic(""); // fallback
          }
        }

        if (user) {
          const { data: interestData, error: interestError } = await supabase
            .from("topicinterest")
            .select("interesttype")
            .eq("userid", user.userid);

          if (!interestError && interestData?.length > 0) {
            const parsedInterests = interestData[0].interesttype
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            setUserInterests(parsedInterests);

            if (!initialTopic && parsedInterests.length > 0) {
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

      setIsInterestsLoaded(true);
    };

    loadAll();
  }, [user]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.query = searchQuery;
    if (selectedTopic) params.topic = selectedTopic;
    setSearchParams(params);
  }, [searchQuery, selectedTopic]);

  const selectedTopicName = topics.find(
    (t) => t.topicid === selectedTopic
  )?.name;
  const interestTopicIDs = topics
    .filter((t) =>
      userInterests.map((i) => i.toLowerCase()).includes(t.name.toLowerCase())
    )
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

  if (selectedTopic === "recommended" && !isInterestsLoaded) {
    return null;
  }

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-col sm:flex-row justify-center items-center min-w-[900px] gap-4 mt-5 px-4">
        <div className="w-full max-w-[900px]">
          <Search
            onSearch={handleSearch}
            initialQuery={searchQuery}
            initialTimeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            topics={topics}
            selectedTopic={selectedTopic}
            onTopicChange={handleTopicChange}
          />
        </div>
      </div>

      {isSearching ? (
        <>
          <div className="w-full font-grotesk mt-8">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Search Results:
            </h1>
            <div className="flex justify-center w-full">
              <Rank
                searchQuery={searchQuery}
                topic={resolvedTopicId || resolvedTopic}
                selectedTime={timeFilter}
              />
            </div>
          </div>
          <div className="w-full font-grotesk mt-5">
            <div className="flex justify-center mb-5 w-full">
              <Expert
                searchQuery={searchQuery}
                disableNavigation={!isPremium}
                topic={resolvedTopicId || resolvedTopic}
              />
            </div>
          </div>
          <div className="w-full font-grotesk">
            <div className="flex justify-center mb-5 w-full">
              <LatestNews
                searchQuery={searchQuery}
                topic={resolvedTopicId || resolvedTopic}
                timeFilter={timeFilter}
              />
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
              <Rank
                searchQuery={searchQuery}
                topic={resolvedTopicId || resolvedTopic}
                selectedTime={timeFilter}
              />
            </div>
            <div className="w-full font-grotesk mt-5">
              <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
                Expert:
              </h1>
              <div className="flex justify-center mb-5 w-full">
                <Expert
                  disableNavigation={!isPremium}
                  topic={resolvedTopicId || resolvedTopic}
                />
              </div>
            </div>
          </div>
          <div className="w-full font-grotesk mt-5">
            <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
              Latest News:
            </h1>
            <div className="flex justify-center mb-5 w-full">
              <LatestNews
                searchQuery={searchQuery}
                topic={resolvedTopicId || resolvedTopic}
                timeFilter={timeFilter}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
