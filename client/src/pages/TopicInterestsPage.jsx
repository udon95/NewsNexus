import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/TopicInterests.css"; //Only necessary styles
import "../styles/Header.css"; //Header styles
import "../styles/Footer.css"; //Footer styles

const TopicInterestsPage = () => {
  const topics = [
    "Finance", "Politics", "Entertainment",
    "Sports", "Weather", "Lifestyle",
    "Beauty", "Hollywood", "China",
    "Horticulture", "Culinary", "LGBTQ++",
    "Singapore", "Environment", "Investment",
    "USA", "Luxury", "Korea"
  ];

  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleSelection = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="topics-container">
      <Header /> {/*Ensures header is applied correctly */}

      <main className="content-wrapper">
        <h1 className="topics-title">Topic Interests:</h1> {/*Title properly aligned */}

        <div className="topics-grid">
          {topics.map((topic, index) => (
            <button
              key={index}
              className={`topic-button ${selectedTopics.includes(topic) ? "selected" : ""}`}
              onClick={() => toggleSelection(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <button className="next-button">Next</button> {/*Button aligned properly */}
      </main>

      <Footer /> {/*Footer styling enforced */}
    </div>
  );
};

export default TopicInterestsPage;
