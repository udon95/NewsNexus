import React from "react";

const Topic = ({ selectedInterests, handleInterestSelect, handleSubmit }) => {
  const interests = ["Technology", "Finance", "Health", "Travel", "Sports", "Education"];

  return (
    <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 max-w-xl w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Interests</h2>
      <div className="grid grid-cols-2 gap-4">
        {interests.map((interest) => (
          <button
            key={interest}
            onClick={() => handleInterestSelect(interest)}
            className={`px-4 py-2 rounded-lg ${
              selectedInterests.includes(interest) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Complete Registration 
      </button>
    </div>
  );
};

export default Topic;
