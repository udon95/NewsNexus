import React from "react";

const TopicList = ({
  allTopics = [],
  selectedTopics = [],
  handleTopicSelection,
}) => {
  return (
    <div className="flex flex-col flex-grow items-center justify-center w-full max-w-[900px] mx-auto mb-1">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 w-full">
        {allTopics.map((topic) => (
          <button
            key={topic}
            className={`p-2 min-w-[180px] whitespace-nowrap rounded-lg shadow-md  ${
              selectedTopics.includes(topic)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => handleTopicSelection(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicList;
