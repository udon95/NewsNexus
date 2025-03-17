import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, FlagIcon } from "lucide-react";

const RateAndFlag = () => {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    if (downvoted) setDownvoted(false);
  };

  const handleDownvote = () => {
    setDownvoted(!downvoted);
    if (upvoted) setUpvoted(false);
  };

  return (
    <div className="flex items-center justify-end space-x-4 mt-4 pr-4">
      {/* 👍 Upvote Button */}
      <span className="text-black text-sm font-semibold">1K+ liked this</span>
      <button
        
        className={`transition-colors flex items-center space-x-2 ${
          upvoted ? "text-green-500" : "text-gray-500"
        } hover:text-green-500`}
        onClick={handleUpvote}
      >
        <ThumbsUp size={24} />
       
      </button>

      {/* 👎 Downvote Button */}
      <button
        className={`transition-colors ${
          downvoted ? "text-red-500" : "text-gray-500"
        } hover:text-red-500`}
        onClick={handleDownvote}
      >
        <ThumbsDown size={24} />
      </button>

      {/* 🚩 Community Notes */}
      <button
        className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
        title="Community Notes"
      >
        <FlagIcon className="h-6 w-6 text-black" />
      </button>

      {/* 🅁 Report Button */}
      <button
        className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center font-bold text-black"
        title="Report Article"
      >
        R
      </button>
    </div>
  );
};

export default RateAndFlag;
