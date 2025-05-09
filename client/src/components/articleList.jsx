import React, { useState, useEffect } from "react";
import { EllipsisVertical, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const ArticleList = ({
  title,
  articles,
  isDraft,
  isPremium,
  isRoom,
  onDeleteSuccess,
  articleData = { viewCounts: {} },
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Tracks which article's menu is open
  const navigate = useNavigate();
  const { viewCounts } = articleData;
  const [voteCounts, setVoteCounts] = useState({});
  const [showAll, setShowAll] = useState(false);
  const visibleArticles = showAll ? articles : articles.slice(0, 3);

  useEffect(() => {
    const deleteExpiredDrafts = async () => {
      const now = new Date();
  
      for (const article of articles) {
        if (!isDraft) continue;
  
        const createdAt = isRoom
          ? new Date(article.created_at)
          : new Date(article.time);
  
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(expiryDate.getDate() + 7);
  
        if (now >= expiryDate) {
          const id = isRoom ? article.postid : article.articleid;
          if (isRoom) {
            await handleDeleteRoomArticle(id, true);
          } else {
            await handleDeleteArticle(id, true);
          }
        }
      }
    };
  
    deleteExpiredDrafts();
  }, [articles, isDraft, isRoom]);  

  useEffect(() => {
    const fetchVotes = async () => {
      if (!isDraft && !isRoom && articles.length > 0) {
        const articleIds = articles.map((a) => a.articleid);
        const { data, error } = await supabase
          .from("ratings")
          .select("articleid, vote_type")
          .in("articleid", articleIds);

        if (error) {
          console.error("Error fetching votes:", error);
          return;
        }

        const voteMap = {};
        articleIds.forEach((id) => {
          voteMap[id] = { up: 0, down: 0 };
        });

        data.forEach((vote) => {
          if (vote.vote_type === "upvote") {
            voteMap[vote.articleid].up += 1;
          } else if (vote.vote_type === "downvote") {
            voteMap[vote.articleid].down += 1;
          }
        });

        setVoteCounts(voteMap);
      }
    };

    fetchVotes();
  }, [articles]);

  const formatCount = (count) => {
    if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
    return count.toString();
  };

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

    const creationDate = new Date(article.time);
    creationDate.setDate(creationDate.getDate() + 7);

    const day = creationDate.getDate();
    const month = creationDate.getMonth() + 1; // Months are 0-based
    const year = creationDate.getFullYear();

    return `( ${day}/${month}/${year} )`;
  };

  const calculateExpiryDateRoom = (article) => {
    if (!article.created_at) return "Unknown";

    const creationDate = new Date(article.created_at);
    creationDate.setDate(creationDate.getDate() + 7);

    const day = creationDate.getDate();
    const month = creationDate.getMonth() + 1;
    const year = creationDate.getFullYear();

    return `( ${day}/${month}/${year} )`;
  };

  const handleDeleteArticle = async (articleid, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this article?"
      );
      if (!confirmed) return;
    }
  
    const bucketName = "articles-images";
  
    const { data: images, error: fetchError } = await supabase
      .from("article_images")
      .select("image_url")
      .eq("articleid", articleid);
  
    if (fetchError) {
      console.error("Error fetching article images:", fetchError);
      return;
    }
  
    if (images && images.length > 0) {
      const imagePaths = images.map((img) => {
        const parts = img.image_url.split(`/object/public/${bucketName}/`);
        return parts[1]; 
      });
  
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove(imagePaths);
  
      if (storageError) {
        console.error("Error deleting images from storage:", storageError);
      }
    }
  
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("articleid", articleid);
  
    if (error) {
      console.error("Error deleting article:", error);
      return;
    }
  
    setOpenMenuIndex(null);
  
    if (onDeleteSuccess) {
      onDeleteSuccess(articleid);
    }
  };

  const handleDeleteRoomArticle = async (postid, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this article?"
      );
      if (!confirmed) return;
    }
  
    const bucketName = "room-article-images";
  
    const { data: images, error: fetchError } = await supabase
      .from("room_article_images")
      .select("image_url")
      .eq("postid", postid);
  
    if (fetchError) {
      console.error("Error fetching room article images:", fetchError);
      return;
    }
  
    if (images && images.length > 0) {
      const imagePaths = images.map((img) => {
        const parts = img.image_url.split(`/object/public/${bucketName}/`);
        return parts[1]; 
      });
  
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove(imagePaths);
  
      if (storageError) {
        console.error("Error deleting images from storage:", storageError);
      }
    }
  
    const { error } = await supabase
      .from("room_articles")
      .delete()
      .eq("postid", postid);
  
    if (error) {
      console.error("Error deleting room article:", error);
      return;
    }
  
    setOpenMenuIndex(null);
  
    if (onDeleteSuccess) {
      onDeleteSuccess(postid);
    }
  };

  return (
    <div className="mt-6 font-grotesk w-full pb-4">
      <h2 className="text-3xl font-bold mb-2 w-3/3 md:w-2/3">
        {title}
      </h2>
      {articles.length === 0 ? (
        <p className="px-4 py-6 text-center text-gray-500">
          {isDraft ? "No drafts available." : "No articles available."}
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-[890px] w-full">
            {visibleArticles.map((article, index) => {
              const roomimageUrl = article.room_article_images?.[0]?.image_url;
              const imageSrc = isRoom ? roomimageUrl : article.imagepath;

              return (
                <li
                  key={index}
                  // DEVI MADE CHANGES HERE SO THAT WHEN ARTICLE CARD CLICKED LEAD TO ARTICLE...ONLY IF EDIT CLICKED FROM 3DOT LEAD TO EDIT PAGE
                  onClick={() => {
                    if (!isDraft) {
                      const route = isRoom
                        ? `/room/${article.roomid}`
                        : `/article/${article.title}`;
                      navigate(route);
                    }
                  }}
                  
                  className="w-full min-h-[15rem] border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
                >
                  {/* Article Information */}
                  <div className="flex-1 relative ">
                    <div className="w-full h-40 bg-gray-200 rounded-t-2xl overflow-hidden relative">
                      <img
                        src={imageSrc}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="pr-10 px-4 py-2 text-base text-left text-black overflow-hidden whitespace-nowrap text-ellipsis font-medium">
                      {article.title}
                    </p>
                    {!isDraft && !isRoom && (
                      <div className="flex justify-between items-center flex-wrap px-4 pb-2 pt-1 text-sm gap-4">
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-2">
                            <Eye />
                            {viewCounts[article.articleid] || 0}
                          </div>
                          <div className="flex items-center gap-2 text-green-500">
                            <ThumbsUp />
                            <span className="font-semibold text-black">
                              {formatCount(voteCounts[article.articleid]?.up || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-red-500">
                            <ThumbsDown />
                            <span className="font-semibold text-black">
                              {formatCount(voteCounts[article.articleid]?.down || 0)}
                            </span>
                          </div>
                        </div>

                        <button
                          className="article-menu-trigger p-1 text-lg font-bold text-black hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(openMenuIndex === index ? null : index);
                          }}
                        >
                          <EllipsisVertical />
                        </button>
                      </div>
                    )}
                    {isDraft && (
                      <div className="flex justify-between items-center flex-wrap px-4 pb-2 pt-1 text-sm gap-2">
                        <div className="max-w-[80%] text-black overflow-hidden whitespace-nowrap text-ellipsis">
                          Expires: {isRoom ? calculateExpiryDateRoom(article) : calculateExpiryDate(article)}
                        </div>

                        <button
                          className="article-menu-trigger p-1 text-lg font-bold text-black hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(openMenuIndex === index ? null : index);
                          }}
                        >
                          <EllipsisVertical />
                        </button>
                      </div>
                    )}
                    {isRoom && !isDraft && (
                      <div className="flex justify-end px-4 pb-2 pt-1">
                        <button
                          className="article-menu-trigger p-1 text-lg font-bold text-black hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(openMenuIndex === index ? null : index);
                          }}
                        >
                          <EllipsisVertical />
                        </button>
                      </div>
                    )}
                  
                    {/* Dropdown Menu (Appears on Click) */}
                    {openMenuIndex === index && (
                      <div className="article-menu-dropdown absolute bottom-10 right-2 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50">
                        <ul className="flex flex-col">
                          {/* Edit Button */}
                          <li>
                            <button
                              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = isRoom ? article.postid : article.articleid;
                                const route = isPremium ? `/premiumDashboard/edit/${id}` : `/freeDashboard/edit/${id}`;
                                navigate(
                                  route
                                );
                              }}
                            >
                              Edit
                            </button>
                          </li>
                          {/* Delete Button */}
                          <li>
                            <button
                              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = isRoom ? article.postid : article.articleid;
                                isRoom ? handleDeleteRoomArticle(id) : handleDeleteArticle(id);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {articles.length > 3 && (
            <div className="flex justify-end mt-4 pr-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-black text-bold text-base hover:text-blue-800"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticleList;
