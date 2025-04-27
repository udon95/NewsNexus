import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { EllipsisVertical } from "lucide-react";



const ArticleList = ({ title, articles, isDraft, onArticleClick, isRoom, isPremium }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="mt-6 first:mt-0 font-grotesk w-full flex flex-col items-start">
      <h2 className="text-2xl font-bold font-grotesk mb-2 w-3/3 md:w-2/3">{title}</h2>
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
              {/* <span className="text-lg text-black flex-1">{article}</span> */}
              <span className="text-lg text-black flex-1">{article.title || article}</span>
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


            {/* Dropdown Menu (Appears on Click) */}
            {openMenuIndex === index && (
              <div className="absolute top-full right-0 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
                <ul className="flex flex-col">
                <li>
                <button
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                  onClick={() => {
                    setOpenMenuIndex(null);
                    const id = isRoom ? article.postid : article.articleid;
                    const route = isPremium ? `/edit/premium/${id}` : `/edit/free/${id}`;
                    console.log("Navigating to:", route); // 👈 Add this
                    navigate(route);
                  }}
                >
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
