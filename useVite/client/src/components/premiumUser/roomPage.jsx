import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Navbar from "../navBar";
import { MoreVertical } from "lucide-react"; // Import 3-dot icon
import useAuthHook from "../../hooks/useAuth";

const Room = () => {
  const {userType} = useAuthHook();
  
  const { id: roomid } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null); // Stores comment ID being replied to
  const [replyText, setReplyText] = useState(""); // Stores reply text
  const [replyingToArticle, setReplyingToArticle] = useState(null); // Stores article ID being replied to
  const [articleReplyText, setArticleReplyText] = useState(""); // Stores reply text for article
  const [articleMenu, setArticleMenu] = useState(null);
  const [commentMenu, setCommentMenu] = useState(null);

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

      if (error && error.code !== "PGRST116") {
        console.error("Error checking membership:", error);
      } else {
        setIsMember(data && data.exited_at === null);
      }
    };

    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("room_articles")
        .select(
          "postid, title, content, created_at, userid, users:userid(username), room_comments(*)"
        )
        .eq("roomid", roomid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      const articlesWithComments = data.map((article) => {
        const commentMap = {}; // Store comments by ID
        const topLevelComments = []; // Store parent comments

        // Step 1: Organize comments into a map
        article.room_comments.forEach((comment) => {
          comment.replies = []; // Initialize replies array
          commentMap[comment.commentid] = comment;
        });

        // Step 2: Structure comments correctly
        article.room_comments.forEach((comment) => {
          if (comment.parent_commentid) {
            const parentComment = commentMap[comment.parent_commentid];

            if (parentComment) {
              // Check if parent is a top comment
              if (!parentComment.parent_commentid) {
                parentComment.replies.push(comment); // Add directly under top comment
              } else {
                // Ensure reply-to-reply is kept under the same top comment
                let topComment = commentMap[parentComment.parent_commentid];
                while (topComment?.parent_commentid) {
                  topComment = commentMap[topComment.parent_commentid];
                }
                if (topComment) {
                  topComment.replies.push(comment);
                }
              }
            }
          } else {
            // If no parent, it's a top-level comment
            topLevelComments.push(comment);
          }
        });

        return { ...article, room_comments: topLevelComments };
      });

      setArticles(articlesWithComments);
    };

    fetchRoomDetails();
    if (user) checkMembership();
    fetchArticles();
  }, [roomid, user]);

  const handleReplyClick = (commentid) => {
    setReplyingTo(commentid); // Store the comment ID that the user is replying to
    setReplyText(`@${username} `); // Prefix reply with @username
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

    // Only add @username if replying to a non-parent reply
    if (parentUsername && !replyText.startsWith(`@${parentUsername}`)) {
      formattedReplyText = `@${parentUsername} ${replyText}`;
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
          parent_commentid: parentCommentId, // Correctly assign parent comment
        },
      ])
      .select("*");

    if (error) {
      console.error("Error posting reply:", error);
      return;
    }

    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.postid === postid) {
          // Update the correct comment thread
          const updatedComments = article.room_comments.map((comment) => {
            if (comment.commentid === parentCommentId) {
              return {
                ...comment,
                replies: [...comment.replies, data[0]], // Append reply
              };
            }
            return comment;
          });
          return { ...article, room_comments: updatedComments };
        }
        return article;
      })
    );

    setReplyingTo(null);
    setReplyText("");
  };

  const handlePostArticleReply = async (postid) => {
    if (!articleReplyText.trim()) return;
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    const { error } = await supabase.from("room_comments").insert([
      {
        postid: postid, // Assign the article ID correctly
        userid: user.userid,
        username: user.username,
        content: articleReplyText,
        created_at: new Date().toISOString(),
        parent_commentid: null, // Ensures it is a top-level comment
      },
    ]);

    if (error) {
      console.error("Error posting comment:", error);
      return;
    }

    // Reset input box
    setReplyingToArticle(null);
    setArticleReplyText("");

    // Refresh comments immediately
    fetchArticles();
  };

  // Function to Exit Room
  const handleExitRoom = async () => {
    if (!user) {
      alert("You need to be logged in to exit the room.");
      return;
    }

    try {
      const { error: exitError } = await supabase
        .from("room_members")
        .update({ exited_at: new Date().toISOString() })
        .eq("userid", user.userid)
        .eq("roomid", roomid);

      if (exitError) {
        console.error("Error exiting room:", exitError);
        return;
      }

      const { error: countError } = await supabase.rpc(
        "decrement_member_count",
        { room_id: roomid }
      );

      if (countError) {
        console.error("Error updating member count:", countError);
        return;
      }

      setTimeout(checkMembership, 500); // Ensure membership is rechecked
      localStorage.setItem("refreshRooms", "true");
    } catch (error) {
      console.error("Unexpected error while exiting room:", error);
    }
  };

  // Function to Join Room
  const handleJoinRoom = async () => {
    if (!user) {
      alert("You need to be logged in to join the room.");
      return;
    }

    try {
      // Check if user has a previous entry (exited before)
      const { data: existingEntry, error: checkError } = await supabase
        .from("room_members")
        .select("exited_at")
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking previous membership:", checkError);
        return;
      }

      if (existingEntry) {
        // User has an old entry, update `exited_at` to null (rejoin)
        const { error: updateError } = await supabase
          .from("room_members")
          .update({ exited_at: null })
          .eq("userid", user.userid)
          .eq("roomid", roomid);

        if (updateError) {
          console.error("Error rejoining room:", updateError);
          return;
        }
      } else {
        // First-time join, insert new entry
        const { error: insertError } = await supabase
          .from("room_members")
          .insert([{ userid: user.userid, roomid, exited_at: null }]);

        if (insertError) {
          console.error("Error joining room:", insertError);
          return;
        }
      }

      // Increment member count
      const { error: countError } = await supabase.rpc(
        "increment_member_count",
        { room_id: roomid }
      );

      if (countError) {
        console.error("Error updating member count:", countError);
        return;
      }

      setTimeout(checkMembership, 500); // Ensure the UI updates after joining
    } catch (error) {
      console.error("Unexpected error while joining room:", error);
    }
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
            {/* Exit Button (Active Only If Member) */}
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleExitRoom}
              disabled={!isMember}
            >
              Exit
            </button>

            {/* Join Button (Disabled If Already a Member) */}
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              onClick={handleJoinRoom}
              disabled={isMember} // This disables the button if the user is already a member
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
              {/* Author Profile Placeholder */}
              <div className="relative bg-gray-300 h-85 rounded-lg flex items-center justify-center mb-4">
                <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg">
                  {article.users?.username
                    ? article.users.username.charAt(0).toUpperCase()
                    : "?"}
                </div>
              </div>

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
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50">
                      <button
                        className="block w-full text-left p-2 hover:bg-gray-100 text-gray-700"
                        onClick={() =>
                          console.log("Edit article", article.postid)
                        }
                      >
                        Delete
                      </button>
                      <button
                        className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                        onClick={() =>
                          console.log("Delete article", article.postid)
                        }
                      >
                        Report
                      </button>
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

              <p className="mt-2 text-gray-700">{article.content}</p>

              <button
                className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg"
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

              {article.room_comments.map((comment) => (
                <React.Fragment key={comment.commentid}>
                  {/* Top-Level Comment (Parent) */}
                  <div className="bg-white shadow-md rounded-lg p-4 mt-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      {/* Left: Profile & Username */}
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 text-white flex items-center font-bold justify-center rounded-lg mr-3">
                          {comment.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="text-lg font-bold text-blue-900">
                            @{comment.username}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            {new Date(comment.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Right: 3-Dots Menu for Top Comment */}
                      <div className="relative ml-auto">
                        <MoreVertical
                          size={20}
                          className="text-gray-500 hover:text-black cursor-pointer menu-icon"
                          onClick={(event) => {
                            event.stopPropagation(); // Prevents menu from closing immediately
                            toggleCommentMenu(comment.commentid);
                          }}
                        />
                        {commentMenu === comment.commentid && (
                          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50 menu-container">
                            <button
                              className="block w-full text-left p-2 hover:bg-gray-100 text-gray-700"
                              onClick={() =>
                                console.log("Edit comment", comment.commentid)
                              }
                            >
                              Delete
                            </button>
                            <button
                              className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                              onClick={() =>
                                console.log("Delete comment", comment.commentid)
                              }
                            >
                              Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p className="mt-2 text-gray-700">{comment.content}</p>

                    {/* Reply Button */}
                    <button
                      className="mt-2 text-blue-500 hover:underline"
                      onClick={() => {
                        setReplyingTo(comment.commentid);
                        setReplyText("");
                      }}
                    >
                      Reply
                    </button>

                    {/* Show Reply Input Box for Top-Level Comments */}
                    {replyingTo === comment.commentid && (
                      <div className="mt-3">
                        <textarea
                          className="w-full p-2 border rounded"
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                          onClick={() =>
                            handlePostReply(
                              comment.postid,
                              comment.commentid,
                              null
                            )
                          }
                        >
                          Post Reply
                        </button>
                        <button
                          className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Replies - Separated but Indented */}
                  {comment.replies
                    .filter(
                      (reply) => reply.parent_commentid === comment.commentid
                    )
                    .map((reply) => (
                      <React.Fragment key={reply.commentid}>
                        <div className="bg-white shadow-md rounded-lg p-4 mt-2 ml-10 border border-gray-300">
                          <div className="flex justify-between items-center">
                            {/* Left: Profile & Username */}
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold rounded-lg mr-3">
                                {reply.username?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <span className="text-lg font-bold text-blue-900">
                                  @{reply.username}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  {new Date(
                                    reply.created_at
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Right: 3-Dots Menu for Non-Parent Reply */}
                            <div className="relative ml-auto">
                              <MoreVertical
                                size={20}
                                className="text-gray-500 hover:text-black cursor-pointer menu-icon"
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevents menu from closing immediately
                                  toggleCommentMenu(reply.commentid);
                                }}
                              />
                              {commentMenu === reply.commentid && (
                                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50 menu-container">
                                  <button
                                    className="block w-full text-left p-2 hover:bg-gray-100 text-gray-700"
                                    onClick={() =>
                                      console.log("Edit reply", reply.commentid)
                                    }
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                                    onClick={() =>
                                      console.log(
                                        "Delete reply",
                                        reply.commentid
                                      )
                                    }
                                  >
                                    Report
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reply Content */}
                          <p className="mt-2 text-gray-700">{reply.content}</p>

                          {/* Reply Button for Non-Parent Reply */}
                          <button
                            className="mt-2 text-blue-500 hover:underline"
                            onClick={() => {
                              setReplyingTo(reply.commentid);
                              setReplyText(`@${reply.username} `);
                            }}
                          >
                            Reply
                          </button>

                          {/* Show Reply Input Box for Reply-to-Reply */}
                          {replyingTo === reply.commentid && (
                            <div className="mt-3">
                              <textarea
                                className="w-full p-2 border rounded"
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <button
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() =>
                                  handlePostReply(
                                    reply.postid,
                                    reply.commentid,
                                    reply.username
                                  )
                                }
                              >
                                Post Reply
                              </button>
                              <button
                                className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded"
                                onClick={() => setReplyingTo(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Render Reply-to-Reply as separate cards but indented further */}
                        {comment.replies
                          .filter((r) => r.parent_commentid === reply.commentid)
                          .map((nestedReply) => (
                            <div
                              key={nestedReply.commentid}
                              className="bg-white shadow-md rounded-lg p-4 mt-2 ml-10 border border-gray-300"
                            >
                              <div className="flex justify-between items-center">
                                {/* Left: Profile & Username */}
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-500 text-white flex items-center font-bold justify-center rounded-lg mr-3">
                                    {nestedReply.username
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <span className="text-lg font-bold text-blue-900">
                                      @{nestedReply.username}
                                    </span>
                                    <span className="text-gray-500 text-xs ml-2">
                                      {new Date(
                                        nestedReply.created_at
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: 3-Dots Menu for Reply-to-Reply */}
                                <div className="relative ml-auto">
                                  <MoreVertical
                                    size={20}
                                    className="text-gray-500 hover:text-black cursor-pointer menu-icon"
                                    onClick={(event) => {
                                      event.stopPropagation(); // Prevents menu from closing immediately
                                      toggleCommentMenu(nestedReply.commentid);
                                    }}
                                  />
                                  {commentMenu === nestedReply.commentid && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 z-50 menu-container">
                                      <button
                                        className="block w-full text-left p-2 hover:bg-gray-100 text-gray-700"
                                        onClick={() =>
                                          console.log(
                                            "Edit reply",
                                            nestedReply.commentid
                                          )
                                        }
                                      >
                                        Delete
                                      </button>
                                      <button
                                        className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                                        onClick={() =>
                                          console.log(
                                            "Delete reply",
                                            nestedReply.commentid
                                          )
                                        }
                                      >
                                        Report
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Reply Content (Show @username only for Reply-to-Reply) */}
                              <p className="mt-1 text-gray-700">
                                <span className="text-blue-900 font-bold">
                                  @{reply.username}
                                </span>{" "}
                                {nestedReply.content.replace(/^@\S+\s/, "")}
                              </p>

                              {/* Reply Button for Reply-to-Reply */}
                              <button
                                className="mt-2 text-blue-500 hover:underline"
                                onClick={() => {
                                  setReplyingTo(nestedReply.commentid);
                                  setReplyText(`@${nestedReply.username} `);
                                }}
                              >
                                Reply
                              </button>

                              {/* Show Reply Input Box for Reply-to-Reply */}
                              {replyingTo === nestedReply.commentid && (
                                <div className="mt-3">
                                  <textarea
                                    className="w-full p-2 border rounded"
                                    placeholder="Write your reply..."
                                    value={replyText}
                                    onChange={(e) =>
                                      setReplyText(e.target.value)
                                    }
                                  />
                                  <button
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                                    onClick={() =>
                                      handlePostReply(
                                        nestedReply.postid,
                                        nestedReply.commentid,
                                        nestedReply.username
                                      )
                                    }
                                  >
                                    Post Reply
                                  </button>
                                  <button
                                    className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded"
                                    onClick={() => setReplyingTo(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Room;
