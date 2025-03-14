import React, { useState } from "react";
import TopicsList from "../components/topicList";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const topics = [
  "Finance",
  "Politics",
  "Entertainment",
  "Sports",
  "Weather",
  "Lifestyle",
  "Beauty",
  "Hollywood",
  "China",
  "Horticulture",
  "Culinary",
  "LGBTQ++",
  "Singapore",
  "Environment",
  "Investment",
  "USA",
  "Luxury",
  "Korea",
];
const TopicInterestsPage = ({ handleSubmit }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showError, setShowError] = useState(false); // Error state
  const navigate = useNavigate();

  const handleTopicSelection = (topic) => {
    if (selectedTopics.includes(topic)) {
      // If already selected, remove it
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      setShowError(false);
    } else if (selectedTopics.length < 6) {
      // Add only if limit (6) is not reached
      setSelectedTopics([...selectedTopics, topic]);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  return (
    <div
      className="w-full min-w-screen min-h-screen
     flex flex-col bg-white"
    >
      <main className="flex flex-col flex-grow items-left justify-center w-full max-w-[900px] mx-auto  px-6 sm:px-6">
        <h1 className="text-3xl font-bold font-grotesk mb-4">
          Topic Interests:
        </h1>
        {showError && (
          <p className="text-red-600 text-sm font-semibold mb-4 animate-fadeIn">
            ❌ You can only select up to 6 topics.
          </p>
        )}
        <div className="flex justify-center w-full">
          <TopicsList
            allTopics={topics}
            selectedTopics={selectedTopics}
            handleTopicSelection={handleTopicSelection}
          />
        </div>
        <button
          onClick={() => handleSubmit(selectedTopics)}
          className="bg-[#3f414c] text-[white] cursor-pointer text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl border-[none]"
        >
          Submit
        </button>{" "}
      </main>
    </div>
  );
};

export default TopicInterestsPage;
