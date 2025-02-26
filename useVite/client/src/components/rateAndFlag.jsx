import React from "react";
import Rating from "@mui/material/Rating";
import { FlagIcon } from "@heroicons/react/24/solid";

const RateAndFlag = ({ rating, setRating }) => {
  return (
    <div className="w-full flex items-center justify-end px-6 sm:px-8 space-x-4 font-grotesk">
      {/* ⭐ Half-Star Rating with MUI */}
      <Rating
        name="half-rating"
        value={rating}
        precision={0.5}
        onChange={(event, newValue) => setRating(newValue)}
        max={4}
      />

      {/* 🚩 Community Notes */}
      <button
        className="w-12 h-12  bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
        title="Community Notes"
      >
        <FlagIcon className="h-6 w-6 text-black" />
      </button>

      {/* 🅁 Report Button */}
      <button
        className="w-12 h-12  bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center font-bold text-black"
        title="Report Article"
      >
        R
      </button>
    </div>
  );
};

export default RateAndFlag;
