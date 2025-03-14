// import React from "react";

// const TopicList = ({
//   topics,
//   selectedTopics,
//   toggleSelection,

// }) => {
//   return (
//     <div className="flex flex-col flex-grow items-left justify-center w-full max-w-[900px] mx-auto">
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         {topics.map((topic, index) => {
//           const isDisabled =
//             selectedTopics.length >= 6 && !selectedTopics.includes(topic);

//           return (
//             <button
//               key={index}
//               onClick={() => toggleSelection(topic)}
//               title={isDisabled ? "You can't select more than 6 topics." : ""}
//               className={`text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all ${
//                 selectedTopics.includes(topic)
//                   ? "bg-black text-white"
//                   : "bg-[#7FB0FE] text-white hover:bg-[#00317f]"
//               } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
//               disabled={isDisabled}
//             >
//               {topic}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default TopicList;

import React from "react";

const TopicList = ({
  allTopics = [],
  selectedTopics = [],
  handleTopicSelection,
}) => {
  return (
    <div className="flex flex-col flex-grow items-center justify-center w-full max-w-[900px] mx-auto mb-1">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 w-full">
        {allTopics.map((topic) => (
          <button
            key={topic}
            className={`p-2 min-w-[180px] whitespace-nowrap rounded-lg shadow-md ${
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
