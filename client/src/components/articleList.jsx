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
    <div className="mt-6  font-grotesk w-full ">
      <h2 className="text-2xl font-bold font-grotesk mb-2 w-3/3 md:w-2/3">
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-[1000px]">
        {articles.map((article, index) => (
          <li
            key={index}
            className="
            relative 
            bg-white 
            rounded-md 
            shadow-md 
            border border-gray-300 
            text-base 
            aspect-square 
            flex 
            flex-col 
            p-4 
            cursor-pointer
          "
          >
            {/* Number and Article Name */}
            <div className="flex-1 p-4 relative ">
              <button
                className="flex items-start gap-2 font-grotesk w-full text-left focus:outline-none"
                onClick={() => onArticleClick(article)} // Calls parent function when clicked
              >
                <span
                  className="
                  inline-block
                  w-full
                  pr-10
                  overflow-hidden
                  whitespace-nowrap
                  text-ellipsis
                  text-lg
                  font-semibold
                  text-black
                "
                >
                  {index + 1}. {article.title}
                </span>
                {/* <span className="text-lg text-black flex-1">{article}</span> */}
              </button>
              <div className="w-full h-30 mt-5 bg-gray-100 rounded-t-md " />
              {!isDraft && (
                <div className="absolute bottom-4 left-4 text-sm text-gray-700 space-y-1">
                  <p>Views: 123</p>
                  <p>Likes: 45</p>
                </div>
              )}

              {/* Three-Dot Menu Button */}
              <button
                className="absolute top-2 right-2 p-2 text-lg font-bold text-gray-600 hover:text-black"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering article click
                  setOpenMenuIndex(openMenuIndex === index ? null : index);
                }}
              >
                <EllipsisVertical />
              </button>
              {isDraft && (
                <div className="absolute bottom-4 left-4 text-gray-500 text-sm">
                  Expires: {calculateExpiryDate(index)}
                </div>
              )}
              {/* Dropdown Menu (Appears on Click) */}
              {openMenuIndex === index && (
                <div className="absolute top-10 right-2 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleList;
