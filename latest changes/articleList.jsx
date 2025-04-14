import React, { useState, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const ArticleList = ({
    title,
    articles,
    isDraft,
    isFree,
    isPremium,
    isRoom,
    onArticleClick,
    onDeleteSuccess,
    articleData = { viewCounts: {}, likeCounts: {} },
  }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Tracks which article's menu is open
  const navigate = useNavigate();
  const { viewCounts, likeCounts } = articleData;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".article-menu-dropdown") &&
        !event.target.closest(".article-menu-trigger")
      ) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateExpiryDate = (article) => {
    if (!article.time) return "Unknown";

    const creationDate = new Date(article.time); // Parses "2025-04-06 17:08:36.384"
    creationDate.setDate(creationDate.getDate() + 7);

    return creationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateExpiryDateRoom = (article) => {
    if (!article.created_at) return "Unknown";

    const creationDate = new Date(article.created_at); // Parses "2025-04-06 17:08:36.384"
    creationDate.setDate(creationDate.getDate() + 7);

    return creationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteArticle = async (articleid) => {
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) return;

    const { error } = await supabase.from("articles").delete().eq("articleid", articleid);

    if (error) {
      console.error("Error deleting article:", error);
      return;
    }

    setOpenMenuIndex(null);

    if (onDeleteSuccess) {
      onDeleteSuccess(articleid);
    }
  };

  const handleDeleteRoomArticle = async (postid) => {
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) return;

    const { error } = await supabase.from("room_articles").delete().eq("postid", postid);

    if (error) {
      console.error("Error deleting article:", error);
      return;
    }

    setOpenMenuIndex(null);

    if (onDeleteSuccess) {
      onDeleteSuccess(postid);
    }
  };

  return (
    <div className="mt-6 font-grotesk w-full pb-4">
      <h2 className="text-2xl font-bold font-grotesk mb-2 w-3/3 md:w-2/3">
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
        {articles.map((article, index) => {
          const roomimageUrl =
            article.room_article_images?.[article.room_article_images.length - 1]?.image_url;

          return (
            <li
              key={index}
              className="relative bg-white rounded-md shadow-md border border-gray-300 text-base aspect-square flex flex-col p-4 cursor-pointer"
            >
              {/* Number and Article Name */}
              <div className="flex-1 p-4 relative ">
                <button
                  className="flex items-start gap-2 font-grotesk w-full text-left focus:outline-none"
                  onClick={() => onArticleClick(article)} // Calls parent function when clicked
                >
                  <span className="inline-block w-full pr-10 overflow-hidden whitespace-nowrap text-ellipsis text-lg font-semibold text-black">
                    {index + 1}. {article.title}
                  </span>
                </button>
                {!isRoom && (
                  <div className="w-full h-32 mt-5 bg-gray-100 rounded-t-md">
                    <img src={article.imagepath} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {isRoom && roomimageUrl && (
                  <div className="w-full h-32 mt-5 bg-gray-100 rounded-t-md">
                    <img src={roomimageUrl} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {!isDraft && !isRoom && (
                  <div className="absolute bottom-4 left-4 text-sm text-gray-700 space-y-1">
                    <p>Views: {viewCounts[article.articleid] || 0}</p>
                    <p>Likes: {likeCounts[article.articleid] || 0}</p>
                  </div>
                )}

                {/* Three-Dot Menu Button */}
                <button
                  className="article-menu-trigger absolute top-2 right-2 p-2 text-lg font-bold text-gray-600 hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents triggering article click
                    setOpenMenuIndex(openMenuIndex === index ? null : index);
                  }}
                >
                  <EllipsisVertical />
                </button>
                {isDraft && !isRoom && (
                  <div className="absolute bottom-4 left-4 text-gray-500 text-sm">
                    Expires: {calculateExpiryDate(article)}
                  </div>
                )}
                {isDraft && isRoom && (
                  <div className="absolute bottom-4 left-4 text-gray-500 text-sm">
                    Expires: {calculateExpiryDateRoom(article)}
                  </div>
                )}
                {/* Dropdown Menu (Appears on Click) */}
                {openMenuIndex === index && (
                  <div className="article-menu-dropdown absolute top-10 right-2 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
                    <ul className="flex flex-col">
                      {!isDraft && isFree && ( // Show "Edit" for free user posted
                        <li>
                          <button 
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/freeDashboard/editPosted/${encodeURIComponent(article.title)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {!isDraft && isPremium && !isRoom &&( // Show "Edit" for premium user general posted
                        <li>
                          <button 
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/premiumDashboard/editPosted/General/${encodeURIComponent(article.title)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {!isDraft && isPremium && isRoom && ( // Show "Edit" for premium user room posted
                        <li>
                          <button 
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/premiumDashboard/editPosted/Room/${encodeURIComponent(article.title)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {isDraft && isFree && ( // Show "Edit" for free user draft
                        <li>
                          <button
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/freeDashboard/writeArticle/${encodeURIComponent(article.articleid)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {isDraft && isPremium && !isRoom && ( // Show "Edit" for premium user draft
                        <li>
                          <button
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/premiumDashboard/writeArticle/${encodeURIComponent(article.articleid)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {isDraft && isPremium && isRoom && ( // Show "Edit" for premium user room draft
                        <li>
                          <button
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => {
                              navigate(`/premiumDashboard/writeArticle/${encodeURIComponent(article.postid)}`);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                      )}
                      {!isRoom && ( // Show "Delete" for article
                        <li>
                          <button
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => handleDeleteArticle(article.articleid)}
                          >
                            Delete
                          </button>
                        </li>
                      )}
                      {isRoom && ( // Show "Delete" for room article
                        <li>
                          <button
                            className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                            onClick={() => handleDeleteRoomArticle(article.postid)}
                          >
                            Delete
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArticleList;