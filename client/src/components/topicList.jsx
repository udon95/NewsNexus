import React from "react";

const TopicList = ({
  allTopics = [],
  selectedTopics = [],
  handleTopicSelection,
}) => {
  return (
    <div className="flex flex-col flex-grow items-center justify-center w-full max-w-[900px] mx-auto mb-1">
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 w-full">
        {allTopics.map((topic) => (
          <button
            key={topic}
            className={`text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all text-white bg-[#7FB0FE] hover:bg-[#00317f]  ${
              selectedTopics.includes(topic)
                ? "bg-blue-500 text-white"
                : "bg-[#7FB0FE] text-black"
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
