// src/components/FetchTopics.jsx
import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient.js";
import TopicsList from "./topicList.jsx"; // Adjust the path if needed

const FetchTopics = ({ selectedTopics, handleTopicSelection }) => {
  const [topics, setTopics] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

useEffect(() => {
    const fetchTopics = async () => {
      if (user) {
        // If user is logged in, fetch their selected topics from the 'topicinterests' table
        const { data, error } = await supabase
          .from("topicinterests")
          .select("interests")
          .eq("userid", user.id);

        if (!error && data) {
          const userTopics = data.map((entry) => entry.interests).flat();
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
