// import React from "react";

// const Topic = ({ selectedInterests, handleInterestSelect, handleSubmit }) => {
//   const interests = ["Technology", "Finance", "Health", "Travel", "Sports", "Education"];

//   return (
//     <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 max-w-xl w-full">
//       <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Interests</h2>
//       <div className="grid grid-cols-2 gap-4">
//         {interests.map((interest) => (
//           <button
//             key={interest}
//             onClick={() => handleInterestSelect(interest)}
//             className={`px-4 py-2 rounded-lg ${
//               selectedInterests.includes(interest) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
//             }`}
//           >
//             {interest}
//           </button>
//         ))}
//       </div>
//       <button onClick={handleSubmit} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//         Complete Registration
//       </button>
//     </div>
//   );
// };

// export default Topic;

import React, { useState } from "react";
import TopicList from "../components/topicList";
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

  const toggleSelection = (topic) => {
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
        {showError && (
          <p className="text-red-600 text-sm font-semibold mb-4 animate-fadeIn">
            ❌ You can only select up to 6 topics.
          </p>
        )}
        <div className="flex justify-center w-full">
          <TopicList
            topics={topics}
            selectedTopics={selectedTopics}
            toggleSelection={toggleSelection}
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
