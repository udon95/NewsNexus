// src/components/FetchTopics.jsx
import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient.js";
import TopicsList from "./topicList.jsx"; // Adjust the path if needed

const FetchTopics = ({ selectedTopics, handleTopicSelection }) => {
  const [topics, setTopics] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return;

    try {
      // 2) parse it
      const { user } = JSON.parse(raw);

      // 3) stash your app‑level user record
      setUser(user); // user.userid, user.username, user.usertype
    } catch (err) {
      console.error("Failed to load userProfile from localStorage:", err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const fetchTopics = async (req) => {
      const { userid } = req.params;
      if (user) {
        // If user is logged in, fetch their selected topics from the 'topicinterests' table
        const { data, error } = await supabase
          .from("topicinterest")
          .select("interesttype")
          .eq("userid", userid);

        if (!error && data) {
          const userTopics = data.map((entry) => entry.interesttype).flat();
          setTopics(userTopics);
        } else {
          console.error("Error fetching user topics:", error);
        }
      } else {
        // If no user is logged in, fetch all available categories from 'topic_categories'
        const { data, error } = await supabase
          .from("topic_categories")
          .select("topicid, name");

        if (!error && data) {
          setTopics(data.map((topic) => topic.name));
        } else {
          console.error("Error fetching all topics:", error);
        }
      }
    };

    fetchTopics();
  }, [user]);

  return (
    <TopicsList
      allTopics={topics}
      selectedTopics={selectedTopics}
      handleTopicSelection={handleTopicSelection}
    />
  );
};

export default FetchTopics;
