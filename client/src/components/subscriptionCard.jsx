import React from "react";

const SubscriptionCard = ({ title, content }) => {
  return (
    <div className="w-full max-w-3xl p-8 rounded-2xl border-2 border-black shadow-md bg-white flex flex-col space-y-4">
      <div className="flex items-center space-x-12">
        <div className="text-3xl font-medium bg-white rounded-md text-center w-32 flex-shrink-0">
          {title}
        </div>
        <div className="flex-grow text-left">{content}</div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
