import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Navbar from "../navbar";
import { MoreVertical, CornerDownLeft } from "lucide-react"; // Import 3-dot icon + comment icon

const Room = () => {
  const { id: roomid } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null); // Stores comment ID being replied to
  const [replyText, setReplyText] = useState(""); // Stores reply text
  const [replyingToArticle, setReplyingToArticle] = useState(null); // Stores article ID being replied to
  const [articleReplyText, setArticleReplyText] = useState(""); // Stores reply text for article
  const [articleMenu, setArticleMenu] = useState(null);
  const [commentMenu, setCommentMenu] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { type: "article" | "comment", id: string }
  const [selectedReason, setSelectedReason] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [showReplies, setShowReplies] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [expandedCommentsForPost, setExpandedCommentsForPost] = useState({});
  const [trueParentCommentId, setTrueParentCommentId] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [expandedArticles, setExpandedArticles] = useState({});

  const nextSlide = (postid, imageCount) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [postid]:
        (prev[postid] ?? 0) === imageCount - 1 ? 0 : (prev[postid] ?? 0) + 1,
    }));
  };

  const prevSlide = (postid, imageCount) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [postid]:
        (prev[postid] ?? 0) === 0 ? imageCount - 1 : (prev[postid] ?? 0) - 1,
    }));
  };

  const toggleExpandedComments = (postid) => {
    setExpandedCommentsForPost((prev) => ({
      ...prev,
      [postid]: !prev[postid],
    }));
  };

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleContent = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleExpandedArticle = (postid) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [postid]: !prev[postid],
    }));
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .room-article-content h1 {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 1.5rem 0 1rem;
      }
      .room-article-content h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0;
      }
      .room-article-content h3 {
        font-size: 1.125rem;
        font-weight: 500;
        margin: 0.75rem 0;
      }
      .room-article-content p {
        font-size: 1rem;
        margin-bottom: 1.25rem;
        line-height: 1.75;
      }
      .room-article-content ul {
        list-style-type: disc;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .room-article-content ol {
        list-style-type: decimal;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .room-article-content img {
        max-width: 100%;
        height: auto;
        margin: 1rem 0;
        border-radius: 8px;
        display: block;
      }
      .room-article-content a {
        color: #2563eb;
        text-decoration: underline;
        cursor: pointer;
      }
      .room-article-content mark {
        background-color: #fde68a;
        padding: 0 2px;
        border-radius: 3px;
      }
      .room-article-content p[style*="text-indent"] {
        text-indent: 2em;
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleDeleteArticle = async (postid) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("room_articles")
      .delete()
      .eq("postid", postid);

    if (error) {
      console.error("Error deleting article:", error);
      return;
    }

    setArticles((prev) => prev.filter((a) => a.postid !== postid));
    setArticleMenu(null);
  };

  const handleDeleteComment = async (commentid, postid) => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("room_comments")
      .update({ is_deleted: true })
      .eq("commentid", commentid);

    if (error) {
      console.error("Error deleting comment:", error);
      return;
    }

    // Update comment locally instead of removing it
    const markCommentAsDeleted = (comments) =>
      comments.map((comment) => {
        if (comment.commentid === commentid) {
          return { ...comment, is_deleted: true };
        }
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: markCommentAsDeleted(comment.replies),
          };
        }
        return comment;
      });

    setArticles((prev) =>
      prev.map((article) =>
        article.postid === postid
          ? {
              ...article,
              room_comments: markCommentAsDeleted(article.room_comments),
            }
          : article
      )
    );

    setCommentMenu(null);
  };

  const toggleArticleMenu = (postid) => {
    console.log("Toggling menu for post:", postid); // Debugging
    setArticleMenu((prevMenu) => (prevMenu === postid ? null : postid));
    setCommentMenu(null); // Ensure only one menu is open at a time
  };

  const toggleCommentMenu = (commentid) => {
    console.log("Toggling comment menu for comment:", commentid); // Debugging
    setCommentMenu((prevMenu) => (prevMenu === commentid ? null : commentid));
    setArticleMenu(null); // Ensure only one menu is open at a time
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (storedUser?.user?.userid) {
      setUser(storedUser.user);
    } else {
      console.warn("No user found in localStorage.");
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".menu-container") &&
        !event.target.closest(".menu-icon")
      ) {
        setArticleMenu(null);
        setCommentMenu(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!roomid) {
      console.error("Room ID is undefined.");
      return;
    }

    const fetchRoomDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("name, description, member_count")
        .eq("roomid", roomid)
        .single();

      if (error) {
        console.error("Error fetching room details:", error);
        setRoom(null);
      } else {
        setRoom(data);
      }
      setLoading(false);
    };

    const checkMembership = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("room_members")
        .select("exited_at")
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .single();

      if (error || !data || data.exited_at !== null) {
        setIsMember(false);
      } else {
        setIsMember(true);
      }
    };

    const fetchArticles = async () => {
      const { data: articlesData, error: articlesError } = await supabase
        .from("room_articles")
        .select(
          `
          postid,
          title,
          content,
          created_at,
          userid,
          users:userid(username),
          room_comments(*),
          room_article_images(image_url)
        `
        )
        .eq("roomid", roomid)
        .eq("status", "Published")
        .order("created_at", { ascending: false });

      if (articlesError) {
        console.error("Error fetching articles:", articlesError);
        return;
      }

      const { data: notesData, error: notesError } = await supabase
        .from("community_notes")
        .select("target_id, note, username, Status")
        .in(
          "target_id",
          articlesData.map((a) => a.postid)
        );

      if (notesError) {
        console.error("Error fetching community notes:", notesError);
        return;
      }

      const notesMap = {};
      notesData?.forEach((note) => {
        if (note.Status === "Approved") {
          if (!notesMap[note.target_id]) {
            notesMap[note.target_id] = [];
          }
          notesMap[note.target_id].push(note);
        }
      });

      const articlesWithComments = articlesData.map((article) => {
        const commentMap = new Map();
        article.room_comments.forEach((comment) => {
          comment.replies = [];
          commentMap.set(comment.commentid, comment);
        });

        const topLevelComments = [];

        article.room_comments.forEach((comment) => {
          if (!comment.parent_commentid) {
            topLevelComments.push(comment);
          } else {
            let parent = commentMap.get(comment.parent_commentid);
            while (
              parent?.parent_commentid &&
              commentMap.has(parent.parent_commentid)
            ) {
              parent = commentMap.get(parent.parent_commentid);
            }

            if (parent) {
              parent.replies.push(comment);
            } else {
              topLevelComments.push(comment);
            }
          }
        });

        return {
          ...article,
          room_comments: topLevelComments,
          approvedNotes: notesMap[article.postid] || [],
        };
      });

      console.log(
        "Fetched articles data:",
        JSON.stringify(articlesWithComments, null, 2)
      ); // Optional debug
      setArticles(articlesWithComments);
    };

    fetchRoomDetails();
    if (user) checkMembership();
    fetchArticles();
  }, [roomid, user]);

  const handleReplyClick = (commentid, username) => {
    console.log("Reply button clicked for comment ID:", commentid);
    if (replyingTo === commentid) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(commentid);
      const parentIsTopLevel = articles.some((article) =>
        article.room_comments.some(
          (comment) =>
            comment.commentid === commentid && comment.parent_commentid === null
        )
      );

      setReplyText(parentIsTopLevel ? "" : `@${username} `);
      setTrueParentCommentId(commentid); // store actual parent
    }
  };

  const handlePostReply = async (
    postid,
    parentCommentId = null,
    parentUsername = null
  ) => {
    if (!replyText.trim()) return;
    if (!user) {
      alert("You must be logged in to reply.");
      return;
    }

    let formattedReplyText = replyText;

    if (parentCommentId && parentUsername) {
      // Fetch the parent comment from current articles to check its parent_commentid
      const parentIsTopLevel = articles
        .flatMap((article) => article.room_comments)
        .some(
          (comment) =>
            comment.commentid === parentCommentId &&
            comment.parent_commentid === null
        );

      // Only prefix @username if the parent is NOT top-level
      if (!parentIsTopLevel && !replyText.startsWith(`@${parentUsername}`)) {
        formattedReplyText = `@${parentUsername} ${replyText}`;
      }
    }

    const { data, error } = await supabase
      .from("room_comments")
      .insert([
        {
          postid,
          userid: user.userid,
          username: user.username,
          content: formattedReplyText,
          created_at: new Date().toISOString(),
          // parent_commentid: parentCommentId, // Ensure correct parent
          parent_commentid: trueParentCommentId,
        },
      ])
      .select("*");

    if (error) {
      console.error("Error posting reply:", error);
      return;
    }

    const newReply = data[0];

    // **Recursive function to correctly append a reply at any depth**
    const insertReplyInNestedStructure = (comments) => {
      return comments.map((comment) => {
        if (comment.commentid === trueParentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }

        // Check inside deeper nested replies
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: insertReplyInNestedStructure(comment.replies),
          };
        }

        return comment;
      });
    };
    setVisibleReplies((prev) => ({
      ...prev,
      [trueParentCommentId]: true,
    }));

    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.postid === postid) {
          return {
            ...article,
            room_comments: insertReplyInNestedStructure(article.room_comments),
          };
        }
        return article;
      })
    );

    setReplyingTo(null);
    setReplyText("");
  };

  const handleEditComment = async (commentid, postid) => {
    // ADDED HERE FOR EDIT COMMENT
    if (!editedCommentText.trim()) return;

    const { error } = await supabase
      .from("room_comments")
      .update({ content: editedCommentText })
      .eq("commentid", commentid);

    if (error) {
      console.error("Error updating comment:", error);
      return;
    }

    // Update comment locally
    const updateCommentText = (comments) => {
      return comments.map((comment) => {
        if (comment.commentid === commentid) {
          return { ...comment, content: editedCommentText };
        }
        if (comment.replies?.length) {
          return { ...comment, replies: updateCommentText(comment.replies) };
        }
        return comment;
      });
    };

    setArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.postid === postid
          ? {
              ...article,
              room_comments: updateCommentText(article.room_comments),
            }
          : article
      )
    );

    setEditingCommentId(null);
    setEditedCommentText("");
    setCommentMenu(null);
  };

  const handlePostArticleReply = async (postid) => {
    if (!articleReplyText.trim()) return;
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    const { data, error } = await supabase
      .from("room_comments")
      .insert([
        {
          postid: postid,
          userid: user.userid,
          username: user.username,
          content: articleReplyText,
          created_at: new Date().toISOString(),
          parent_commentid: null,
        },
      ])
      .select("*");

    if (error) {
      console.error("Error posting comment:", error);
      return;
    }

    const newComment = { ...data[0], replies: [] }; // add replies array for consistency

    // Immediately update UI
    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.postid === postid) {
          return {
            ...article,
            room_comments: [...article.room_comments, newComment],
          };
        }
        return article;
      })
    );

    // Reset input box
    setReplyingToArticle(null);
    setArticleReplyText("");
  };

  const handleExitRoom = async () => {
    if (isUpdating) return;
    if (!user) {
      alert("You need to be logged in to exit.");
      return;
    }
    if (!isMember) return;

    setIsUpdating(true);

    try {
      const { data: existingEntry, error: fetchError } = await supabase
        .from("room_members")
        .select("*")
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .single();

      if (fetchError || !existingEntry) {
        console.error("Error fetching member info before exit:", fetchError);
        return;
      }

      const updatePayload = { exited_at: new Date().toISOString() };
      if ("exit_count" in existingEntry) {
        updatePayload.exit_count = (existingEntry.exit_count || 0) + 1;
      }

      const { error: updateError } = await supabase
        .from("room_members")
        .update(updatePayload)
        .eq("userid", user.userid)
        .eq("roomid", roomid);

      if (updateError) {
        console.error("Error updating exit info:", updateError);
        return;
      }

      const { error: countError } = await supabase.rpc(
        "decrement_member_count",
        {
          room_id: roomid,
        }
      );

      if (countError) {
        console.error("Error decrementing member count:", countError);
        return;
      }

      setIsMember(false);
      fetchRoomDetails();
      localStorage.setItem("refreshRooms", "true");
    } catch (err) {
      console.error("Unexpected exit error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (isUpdating) return;
    if (!user) {
      alert("You need to be logged in to join.");
      return;
    }
    if (isMember) return;
    setIsUpdating(true);
    try {
      const { data: existingEntry, error: checkError } = await supabase
        .from("room_members")
        .select("*")
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Check membership error:", checkError);
        return;
      }

      if (existingEntry) {
        const updatePayload = { exited_at: null };
        if ("join_count" in existingEntry) {
          updatePayload.join_count = (existingEntry.join_count || 0) + 1;
        }

        const { error: updateError } = await supabase
          .from("room_members")
          .update(updatePayload)
          .eq("userid", user.userid)
          .eq("roomid", roomid);

        if (updateError) {
          console.error("Error rejoining:", updateError);
          return;
        }
      } else {
        const newEntry = {
          userid: user.userid,
          roomid,
          exited_at: null,
        };

        // Add counters only if expected
        const checkResult =
          (await supabase.from("room_members").select("join_count").limit(1))
            .data?.[0] || {};
        if ("join_count" in checkResult) {
          newEntry.join_count = 1;
          newEntry.exit_count = 0;
        }

        const { error: insertError } = await supabase
          .from("room_members")
          .insert([newEntry]);

        if (insertError) {
          console.error("Error joining:", insertError);
          return;
        }
      }

      const { error: countError } = await supabase.rpc(
        "increment_member_count",
        { room_id: roomid }
      );

      if (countError) {
        console.error("Error incrementing member count:", countError);
        return;
      }

      setIsMember(true);
      fetchRoomDetails();
      localStorage.setItem("refreshRooms", "true");
    } catch (err) {
      console.error("Unexpected join error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const CommentCard = ({
    comment,
    replyingTo,
    replyText,
    setReplyText,
    onReplyClick,
    onPostReply,
    user,
    isReply = false, // <- NEW PROP with default
  }) => {
    const isReplying = replyingTo === comment.commentid;
    const replyBoxRef = React.useRef(null);
    const editBoxRef = React.useRef(null);

    useEffect(() => {
      if (isReplying && replyBoxRef.current) {
        replyBoxRef.current.focus();
        // Optional: move cursor to end
        const len = replyBoxRef.current.value.length;
        replyBoxRef.current.setSelectionRange(len, len);
      }
    }, [isReplying]);

    useEffect(() => {
      if (editingCommentId === comment.commentid && editBoxRef.current) {
        editBoxRef.current.focus();
        const len = editBoxRef.current.value.length;
        editBoxRef.current.setSelectionRange(len, len);
      }
    }, [editingCommentId]);

    return (
      <div
        className={`bg-white shadow-md rounded-lg p-4 mt-4 border border-gray-200 ${
          isReply ? "ml-6" : ""
        }`}
      >
        {/* Header: Avatar + Username */}
        <div className="flex justify-between items-center mb-[6px]">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold rounded-lg mr-3">
              {comment.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-lg font-bold text-blue-900">
                @{comment.username}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(comment.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>

          {/* 3-dot menu */}
          <div className="relative">
            <MoreVertical
              size={20}
              className="text-gray-500 hover:text-black cursor-pointer menu-icon"
              onClick={(event) => {
                event.stopPropagation();
                toggleCommentMenu(comment.commentid);
              }}
            />
            {commentMenu === comment.commentid && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50 menu-container">
                {user?.userid === comment.userid ? (
                  <>
                    <button
                      className="block w-full text-left p-2 hover:bg-gray-100 text-gray-700"
                      // onClick={() => console.log("Edit comment", comment.commentid)} HERE ADDED FOR EDIT COMMENT
                      onClick={() => {
                        setEditingCommentId(comment.commentid);
                        setEditedCommentText(comment.content);
                        setCommentMenu(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                      onClick={() =>
                        handleDeleteComment(comment.commentid, comment.postid)
                      }
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                    onClick={() =>
                      setReportTarget({
                        type: "comment",
                        id: comment.commentid,
                      })
                    }
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content of Comment Card */}
        <div className="w-full">
          {editingCommentId === comment.commentid ? (
            <div className="w-full mt-4 min-h-[100px]">
              <textarea
                ref={editBoxRef}
                className="w-full p-2 border rounded"
                value={editedCommentText}
                onChange={(e) => setEditedCommentText(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() =>
                    handleEditComment(comment.commentid, comment.postid)
                  }
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditedCommentText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {comment.is_deleted ? (
                <p className="italic text-gray-500">
                  This comment has been deleted
                </p>
              ) : (
                <p
                  className={`text-gray-700 whitespace-pre-wrap break-words transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedComments[comment.commentid]
                      ? "max-h-full"
                      : "max-h-[3.3em]"
                  }`}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: expandedComments[comment.commentid]
                      ? "unset"
                      : 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {comment.content.split(/(@\w+)/g).map((part, index) =>
                    part.startsWith("@") ? (
                      <strong key={index} className="text-blue-900 font-bold">
                        {part}
                      </strong>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </p>
              )}

              {comment.content.length > 100 && (
                <span
                  onClick={() => toggleContent(comment.commentid)}
                  className="text-blue-500 cursor-pointer mt-1 inline-block"
                >
                  {expandedComments[comment.commentid]
                    ? "Show less"
                    : "Show more"}
                </span>
              )}
            </>
          )}
        </div>

        {/* Reply button */}
        <div className="flex flex-col items-end mt-2">
          {!isReplying &&
            editingCommentId !== comment.commentid &&
            !comment.is_deleted && (
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() =>
                  onReplyClick(comment.commentid, comment.username)
                }
                aria-label="Reply"
              >
                <CornerDownLeft size={18} />
              </button>
            )}
        </div>

        {/* Reply box (conditionally rendered) */}
        {isReplying && !comment.is_deleted && (
          <div className="w-full mt-3">
            <textarea
              ref={replyBoxRef}
              className="w-full p-2 border rounded"
              placeholder="Write your reply..."
              value={replyingTo === comment.commentid ? replyText : ""}
              onChange={(e) => {
                if (replyingTo === comment.commentid) {
                  setReplyText(e.target.value);
                }
              }}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() =>
                  onPostReply(
                    comment.postid,
                    comment.commentid,
                    comment.username
                  )
                }
              >
                Post Reply
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setReplyText("");
                  onReplyClick(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-4xl font-bold">
            Room: {room ? room.name : "Not Found"}
          </h1>
          <div className="flex gap-3">
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                !isMember || isUpdating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleExitRoom}
              disabled={!isMember || isUpdating}
            >
              Exit
            </button>

            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember || isUpdating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              onClick={handleJoinRoom}
              disabled={isMember || isUpdating}
            >
              {isMember ? "Joined" : "Join"}
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-6">
          {room ? room.description : "No description available."}
        </p>

        {/* Check if there are articles */}
        {articles.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
            <p className="text-gray-500 text-lg">
              No articles have been posted in this room yet.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.postid}
              className="bg-white shadow-md rounded-lg p-6 mt-6"
            >
              {/* Article Image or Placeholder */}
              {article.room_article_images?.length > 0 ? (
                <div className="relative w-full h-[400px] overflow-hidden mb-4 rounded-lg">
                  <img
                    src={
                      article.room_article_images[
                        carouselIndex[article.postid] ?? 0
                      ]?.image_url
                    }
                    alt="Article"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg z-20">
                    {article.users?.username?.charAt(0).toUpperCase() || "?"}
                  </div>

                  {article.room_article_images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          prevSlide(
                            article.postid,
                            article.room_article_images.length
                          )
                        }
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 px-4 py-2 w-10 h-10 bg-white text-gray rounded-full flex items-center justify-center"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          nextSlide(
                            article.postid,
                            article.room_article_images.length
                          )
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-2 w-10 h-10 bg-white text-gray rounded-full flex items-center justify-center"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-[300px] mb-4 rounded-lg overflow-hidden bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium z-10">
                    No Image
                  </span>
                  <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg z-20">
                    {article.users?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                </div>
              )}

              {/* Article Title & 3-dot Menu (Correctly Aligned) */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <div className="relative">
                  <MoreVertical
                    size={24}
                    className="text-gray-500 hover:text-black cursor-pointer menu-icon"
                    onClick={(event) => {
                      event.stopPropagation(); // Prevents menu from closing immediately
                      toggleArticleMenu(article.postid);
                    }}
                  />
                  {articleMenu === article.postid && (
                    <div className="absolute right-0 mt-2 w-45 bg-white shadow-lg rounded-md p-2 z-50 menu-container">
                      {user?.userid === article.userid ? (
                        <>
                          {/* Owner sees Edit and Delete */}
                          <button
                            className="block w-full text-left p-2 hover:bg-gray-100 text-black"
                            onClick={() =>
                              console.log("Edit article", article.postid)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                            onClick={() => handleDeleteArticle(article.postid)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Owner sees Edit and Delete */}
                          <button
                            className="block w-full text-left p-2 hover:bg-gray-100 text-black"
                            onClick={() =>
                              setReportTarget({
                                type: "community_note",
                                id: article.postid,
                              })
                            }
                          >
                            + Comunity Note
                          </button>
                          <button
                            className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                            onClick={() =>
                              setReportTarget({
                                type: "article",
                                id: article.postid,
                              })
                            }
                          >
                            Report
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600">
                <span className="text-lg font-bold text-blue-900">
                  @{article.users?.username || "Unknown"}
                </span>
                <span className="text-black">
                  {" "}
                  {new Date(article.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>

              {article.approvedNotes?.length > 0 && (
                <div className="border border-purple-400 bg-[#f4edff] text-purple-800 rounded-md p-3 mt-3 mb-4">
                  <p className="font-semibold text-sm mb-1">Community Note:</p>
                  {article.approvedNotes.map((note, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-right">– {note.username}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="room-article-content mt-4 text-gray-800">
                {(() => {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(
                    article.content,
                    "text/html"
                  );
                  const paragraphs = Array.from(doc.body.querySelectorAll("p"));

                  if (
                    paragraphs.length <= 2 ||
                    expandedArticles[article.postid]
                  ) {
                    return (
                      <>
                        <div
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                        {paragraphs.length > 2 && (
                          <button
                            onClick={() =>
                              toggleExpandedArticle(article.postid)
                            }
                            className="text-gray-500 hover:text-gray-700 font-semibold mt-4 mx-auto block text-center"
                          >
                            SHOW LESS
                          </button>
                        )}
                      </>
                    );
                  } else {
                    const firstTwo = paragraphs
                      .slice(0, 2)
                      .map((p) => p.outerHTML)
                      .join("");
                    return (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: firstTwo }} />
                        <button
                          onClick={() => toggleExpandedArticle(article.postid)}
                          className="text-gray-500 hover:text-gray-700 font-semibold mt-4 mx-auto block text-center"
                        >
                          SHOW MORE
                        </button>
                      </>
                    );
                  }
                })()}
              </div>

              <button
                className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg prose-p:mb-2"
                onClick={() => setReplyingToArticle(article.postid)}
              >
                Reply
              </button>

              {replyingToArticle === article.postid && (
                <div className="mt-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Write your comment..."
                    value={articleReplyText}
                    onChange={(e) => setArticleReplyText(e.target.value)}
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handlePostArticleReply(article.postid)}
                  >
                    Post Comment
                  </button>
                  <button
                    className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded"
                    onClick={() => setReplyingToArticle(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {(expandedCommentsForPost[article.postid]
                ? article.room_comments
                : article.room_comments.slice(0, 3)
              ).map((comment) => (
                <React.Fragment key={comment.commentid}>
                  <CommentCard
                    comment={comment}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    onReplyClick={handleReplyClick}
                    onPostReply={handlePostReply}
                    setReplyText={setReplyText}
                    user={user}
                    isReply={false}
                    toggleCommentMenu={toggleCommentMenu}
                    commentMenu={commentMenu}
                  />
                  {comment.replies?.length > 0 && (
                    <div className="flex justify-end pr-3 mt-4 mb-1">
                      <button
                        className="text-sm text-blue-500 font-semibold hover:underline"
                        onClick={() => toggleReplies(comment.commentid)}
                      >
                        {visibleReplies[comment.commentid]
                          ? "Hide replies"
                          : `View ${comment.replies.length} Repl${
                              comment.replies.length > 1 ? "ies" : "y"
                            }`}
                      </button>
                    </div>
                  )}

                  {visibleReplies[comment.commentid] &&
                    comment.replies?.map((reply) => (
                      <React.Fragment key={reply.commentid}>
                        <CommentCard
                          comment={reply}
                          replyingTo={replyingTo}
                          replyText={replyText}
                          onReplyClick={handleReplyClick}
                          onPostReply={handlePostReply}
                          setReplyText={setReplyText}
                          user={user}
                          isReply={true}
                        />
                        {reply.replies?.map((subReply) => (
                          <CommentCard
                            key={subReply.commentid}
                            comment={subReply}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            onReplyClick={handleReplyClick}
                            onPostReply={handlePostReply}
                            setReplyText={setReplyText}
                            user={user}
                            isReply={true}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}

              {article.room_comments.length > 3 && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => toggleExpandedComments(article.postid)}
                    className="text-md font-semibold text-grey-600 hover:underline"
                  >
                    {expandedCommentsForPost[article.postid]
                      ? "Show less comments"
                      : `Show all ${article.room_comments.length} comments`}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        
        {reportTarget && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
                onClick={() => {
                  setReportTarget(null);
                  setSelectedReason("");
                }}
              >
                ×
              </button>

              {reportTarget.type === "community_note" ? (
                <>
                  <h2 className="text-xl font-bold mb-2">Add Community Note</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Provide helpful context about this post.
                  </p>
                  <textarea
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full p-3 border rounded mb-4 resize-none h-28"
                    placeholder="Write your note..."
                  />
                  <button
                    disabled={!selectedReason.trim()}
                    className={`w-full py-2 rounded font-semibold ${
                      selectedReason.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={async () => {
                      const { error } = await supabase
                        .from("community_notes")
                        .insert([
                          {
                            target_id: reportTarget.id,
                            target_type: "article",
                            note: selectedReason,
                            username: user?.username,
                            userid: user?.userid,
                            created_at: new Date().toISOString(),
                          },
                        ]);
                      if (error) {
                        console.error("Error submitting note:", error);
                      } else {
                        alert("Community Note submitted.");
                        setReportTarget(null);
                        setSelectedReason("");
                      }
                    }}
                  >
                    Submit Note
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">Report</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    What's going on? We'll review against all community
                    guidelines.
                  </p>

                  {[
                    "Sexual content",
                    "Violent or repulsive content",
                    "Hateful or abusive content",
                    "Harassment or bullying",
                    "Harmful or dangerous acts",
                    "Misinformation",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center mb-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="mr-3 accent-blue-600"
                        name="report-reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                      />
                      {reason}
                    </label>
                  ))}

                  <button
                    disabled={!selectedReason}
                    className={`mt-4 w-full py-2 rounded font-semibold ${
                      selectedReason
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={async () => {
                      const { error } = await supabase.from("reports").insert([
                        {
                          target_id: reportTarget.id,
                          target_type: reportTarget.type,
                          reason: selectedReason,
                          username: user?.username,
                          userid: user?.userid,
                          created_at: new Date().toISOString(),
                        },
                      ]);
                      if (error) {
                        console.error("Error submitting report:", error);
                      } else {
                        alert("Report submitted.");
                        setReportTarget(null);
                        setSelectedReason("");
                      }
                    }}
                  >
                    Report
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
