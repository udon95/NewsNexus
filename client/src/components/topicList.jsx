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
            className="text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all text-white bg-[#7FB0FE] hover:bg-[#00317f]"
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
