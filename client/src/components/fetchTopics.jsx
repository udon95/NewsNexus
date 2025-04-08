// src/components/FetchTopics.jsx
import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient.js";
import TopicsList from "./topicList.jsx"; // Adjust the path if needed

const FetchTopics = ({ selectedTopics, handleTopicSelection }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");

      if (!error && data) {
        // If TopicsList expects an array of objects with topicid and name:
        setTopics(data.map((topic) => topic.name));
        // If you need just an array of names, you could map: setTopics(data.map(t => t.name));
      } else {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
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
