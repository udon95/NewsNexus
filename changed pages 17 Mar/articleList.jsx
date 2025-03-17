import React, { useState } from "react";
import { EllipsisVertical } from "lucide-react";

const ArticleList = ({ title, articles, isDraft, onArticleClick }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Function to calculate expiry date (7 days from creation)
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
      <h2 className="text-2xl font-bold font-grotesk mb-2 w-full">{title}</h2>

      {/* ✅ Grid Layout for Articles */}
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-[900px]">
        {articles.map((article, index) => (
          <li
            key={index}
            className="relative flex flex-col p-4 rounded-md bg-white shadow-sm border border-gray-200 
                      text-base w-[280px] h-[220px] overflow-hidden"
          >
            {/* ✅ Title & Menu Button in a Row */}
            <div className="flex justify-between items-start w-full">
              {/* ✅ Article Number & Scrollable Title */}
                <button
                  className="flex flex-row items-start gap-2 font-grotesk text-left focus:outline-none flex-1"
                  onClick={() => onArticleClick(article)}
                >
                  <span className="text-lg font-semibold text-black">
                    {index + 1}.
                  </span>
                  <span className="text-lg text-black overflow-hidden break-words overflow-wrap break-word whitespace-pre-line max-h-[120px] overflow-y-auto">
                    {article}
                  </span>
                </button>

              {/* Three-Dot Menu Button */}
              <button
                className="p-2 text-lg font-bold text-gray-600 hover:text-black self-start"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuIndex(openMenuIndex === index ? null : index);
                }}
              >
                <EllipsisVertical />
              </button>
            </div>

            {/* ✅ Expiry Date for Drafts (Always Visible) */}
            {isDraft && (
              <div className="absolute bottom-2 left-4 text-gray-500 text-sm border-t border-gray-200 pt-2">
                Expires: {calculateExpiryDate(index)}
              </div>
            )}

            {/* ✅ Dropdown Menu */}
            {openMenuIndex === index && (
              <div className="absolute top-10 right-0 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
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
                  {!isDraft && (
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