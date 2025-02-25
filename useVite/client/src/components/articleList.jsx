import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from 'lucide-react';
 

const ArticleList = ({ title, articles }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Tracks which article's menu is open

  return (
    <section className="mt-8 first:mt-0 font-grotesk">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <ul className="space-y-2">
        {articles.map((article, index) => (
          <li
            key={index}
            className="relative flex justify-between items-center gap-3 py-2 px-4 rounded-lg bg-white shadow-lg border border-gray-300"
          >
            {/* Number and Article Name */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-black">
                {index + 1}.
              </span>
              <span className="text-lg text-black">{article}</span>
            </div>

            {/* Three-Dot Menu Button */}
            <button
              className="p-2 text-2xl font-bold text-gray-600 hover:text-black"
              onClick={() =>
                setOpenMenuIndex(openMenuIndex === index ? null : index)
              }
            >
              <EllipsisVertical />
            </button>

            {/* Dropdown Menu (Appears on Click) */}
            {openMenuIndex === index && (
              <div className="absolute top-10 right-4 bg-white shadow-md border border-gray-300 rounded-lg py-2 w-36 z-10">
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
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Share
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ArticleList;
