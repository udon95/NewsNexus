import React, { useState } from "react";
import { EllipsisVertical } from "lucide-react";

const ArticleList = ({ title, articles, isDraft, onArticleClick }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Tracks which article's menu is open

  const calculateExpiryDate = (index) => {
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() + 7);
    return creationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-6 first:mt-0 font-grotesk w-full flex flex-col items-start">
      <h2 className="text-2xl font-bold font-grotesk mb-2 w-3/3 md:w-2/3">
        {title}
      </h2>
      <ul className="w-3/3 md:w-2/3 space-y-2 ">
        {articles.map((article, index) => (
          <li
            key={index}
            className="relative flex justify-between items-center gap-3 p-3 px-4 rounded-md bg-white shadow-md border border-gray-300 text-base w-full max-w-screen"
          >
            {/* Number and Article Name */}
            <button
              className="flex items-start gap-2 font-grotesk w-full text-left focus:outline-none"
              onClick={() => onArticleClick(article)} // Calls parent function when clicked
            >
              <span className="text-lg font-semibold text-black">
                {index + 1}.
              </span>
              <span className="text-lg text-black flex-1">{article}</span>
            </button>

            {/* Three-Dot Menu Button */}
            <button
              className="p-2 text-lg font-bold text-gray-600 hover:text-black relative"
              onClick={(e) => {
                e.stopPropagation(); // Prevents triggering article click
                setOpenMenuIndex(openMenuIndex === index ? null : index);
              }}
            >
              <EllipsisVertical />
            </button>
            {isDraft && (
              <div className="absolute bottom-2 left-4 text-gray-500 text-sm  border-gray-200 pt-2">
                Expires: {calculateExpiryDate(index)}
              </div>
            )}
            {/* Dropdown Menu (Appears on Click) */}
            {openMenuIndex === index && (
              <div className="absolute top-full right-0 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
                <ul className="flex flex-col">
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Edit
                    </button>
                  </li>
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Delete
                    </button>
                  </li>
                  {!isDraft && ( // Show "Share" only if it's not a draft
                    <li>
                      <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                        Share
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleList;
