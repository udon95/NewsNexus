import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient.js";
import TopicsList from "./topicList.jsx"; // Adjust the path if needed

const FetchTopics = ({ selectedTopics, handleTopicSelection }) => {
  const [topics, setTopics] = useState([]);
  // const [user, setUser] = useState(null);

  useEffect(() => {
    const loadTopics = async () => {
      // 1. Pull your stored profile out of localStorage
      const raw = localStorage.getItem("userProfile");
      let userId = null;
      let cachedInterests = null;

      if (raw) {
        try {
          const profile = JSON.parse(raw);
          userId = profile.user?.userid;
          cachedInterests = profile.interests;
        } catch (e) {
          console.error("Could not parse userProfile:", e);
        }
      }
      if (Array.isArray(cachedInterests) && cachedInterests.length) {
        setTopics(cachedInterests);
        return;
      }

      if (userId) {
        const { data, error } = await supabase
          .from("topicinterest")
          .select("interesttype")
          .eq("userid", userId)
          .single();

        if (error) {
          console.error("Error fetching user interests:", error);
          setTopics([]);
        } else {
          const list = (data.interesttype || "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length);
          setTopics(list);
        }
        return;
      }

      // Fetch all categories
      const { data, error } = await supabase
        .from("topic_categories")
        .select("name");

      if (error) {
        console.error("Error fetching topic categories:", error);
        setTopics([]);
      } else {
        setTopics(data.map((row) => row.name));
      }
    };

    loadTopics();
  }, []); 

  return (
    <TopicsList
      allTopics={topics}
      selectedTopics={selectedTopics}
      handleTopicSelection={handleTopicSelection}
    />
  );
};

export default FetchTopics;
