import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Navbar from "../navBar";
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
  // const [editingCommentId, setEditingCommentId] = useState(null);
  // const [editedCommentText, setEditedCommentText] = useState("");



  const toggleReplies = (commentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };  

  const toggleContent = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };  

  const handleDeleteArticle = async (postid) => {
    const confirmed = window.confirm("Are you sure you want to delete this article?");
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

    const handleDeleteComment = async (commentid, postid) => {
      const confirmed = window.confirm("Delete this comment?");
      if (!confirmed) return;
    
      const { error } = await supabase
        .from("room_comments")
        .delete()
        .eq("commentid", commentid);
    
      if (error) {
        console.error("Error deleting comment:", error);
        return;
      }
    
      const removeNested = (comments) =>
        comments
          .filter((c) => c.commentid !== commentid)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeNested(c.replies) : [],
          }));
    
      setArticles((prev) =>
        prev.map((article) =>
          article.postid === postid
            ? { ...article, room_comments: removeNested(article.room_comments) }
            : article
        )
      );
    
      setCommentMenu(null);
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
      const { data, error } = await supabase
        .from("room_articles")
        .select("postid, title, content, media_url, created_at, userid, users:userid(username), room_comments(*)")
        .eq("roomid", roomid)
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setArticles(data);
          
      const articlesWithComments = data.map((article) => {
        // Step 1: Map all comments by ID
        const commentMap = new Map();
        article.room_comments.forEach((comment) => {
          comment.replies = []; // initialize replies array
          commentMap.set(comment.commentid, comment);
        });
      
        // Step 2: Flatten comments – attach all replies to their topmost parent
        const topLevelComments = [];
      
        article.room_comments.forEach((comment) => {
          if (!comment.parent_commentid) {
            topLevelComments.push(comment);
          } else {
            let parent = commentMap.get(comment.parent_commentid);
      
            // Traverse up until top-level parent found
            while (parent?.parent_commentid && commentMap.has(parent.parent_commentid)) {
              parent = commentMap.get(parent.parent_commentid);
            }
      
            if (parent) {
              parent.replies.push(comment); // flatten under top-level parent
            } else {
              topLevelComments.push(comment); // fallback: treat as top-level if orphaned
            }
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

  const handleReplyClick = (commentid, username) => {
    console.log("Reply button clicked for comment ID:", commentid);
    if (replyingTo === commentid) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(commentid);
      const parentIsTopLevel = articles.some(article =>
        article.room_comments.some(comment => comment.commentid === commentid && comment.parent_commentid === null)
      );
      
      setReplyText(parentIsTopLevel ? "" : `@${username} `);
          }
  };
  
  
  const handlePostReply = async (postid, parentCommentId = null, parentUsername = null) => {
    if (!replyText.trim()) return;
    if (!user) {
        alert("You must be logged in to reply.");
        return;
    }

    let formattedReplyText = replyText;

    if (parentCommentId && parentUsername) {
      // Fetch the parent comment from current articles to check its parent_commentid
      const parentIsTopLevel = articles
        .flatMap(article => article.room_comments)
        .some(comment =>
          comment.commentid === parentCommentId && comment.parent_commentid === null
        );
    
      // Only prefix @username if the parent is NOT top-level
      if (!parentIsTopLevel && !replyText.startsWith(`@${parentUsername}`)) {
        formattedReplyText = `@${parentUsername} ${replyText}`;
      }
    }
    

    const { data, error } = await supabase.from("room_comments").insert([
        {
            postid,
            userid: user.userid,
            username: user.username,
            content: formattedReplyText,
            created_at: new Date().toISOString(),
            parent_commentid: parentCommentId, // Ensure correct parent
        },
    ]).select("*");

    if (error) {
        console.error("Error posting reply:", error);
        return;
    }

    const newReply = data[0];

    // **Recursive function to correctly append a reply at any depth**
    const insertReplyInNestedStructure = (comments) => {
      return comments.map((comment) => {
        if (comment.commentid === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
    
        const updatedReplies = comment.replies?.length
          ? insertReplyInNestedStructure(comment.replies)
          : [];
    
        return { ...comment, replies: updatedReplies };
      });
    };
    
    
    setArticles(prevArticles =>
        prevArticles.map(article => {
            if (article.postid === postid) {
                return {
                    ...article,
                    room_comments: insertReplyInNestedStructure(article.room_comments)
                };
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
      if ('exit_count' in existingEntry) {
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
  
      const { error: countError } = await supabase.rpc("decrement_member_count", {
        room_id: roomid,
      });
  
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
      if ('join_count' in existingEntry) {
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
        const checkResult = (await supabase.from("room_members").select("join_count").limit(1)).data?.[0] || {};
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

    const { error: countError } = await supabase.rpc("increment_member_count", { room_id: roomid });

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
  isReply = false // <- NEW PROP with default

}) => {
  const isReplying = replyingTo === comment.commentid;
  const replyBoxRef = React.useRef(null);

  useEffect(() => {
    if (isReplying && replyBoxRef.current) {
      replyBoxRef.current.focus();
      // Optional: move cursor to end
      const len = replyBoxRef.current.value.length;
      replyBoxRef.current.setSelectionRange(len, len);
    }
  }, [isReplying]);  


  return (
  <div className={`bg-white shadow-md rounded-lg p-4 mt-4 border border-gray-200 ${isReply ? "ml-6" : ""}`}>
  {/* Header: Avatar + Username */}
  <div className="flex justify-between items-center mb-[6px]">
    <div className="flex items-center">
      <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold rounded-lg mr-3">
       {comment.username?.charAt(0).toUpperCase()}
     </div>
      <div>
        <span className="text-lg font-bold text-blue-900">@{comment.username}</span>
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
            onClick={() => console.log("Edit comment", comment.commentid)}
         >
           Edit
         </button>
         <button
            className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
            onClick={() => handleDeleteComment(comment.commentid, comment.postid)}
            >
           Delete
        </button>
      </>
    ) : (
        <button
         className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
          onClick={() => setReportTarget({ type: "comment", id: comment.commentid })}
        >
          Report
        </button>
      )}
    </div>
  )}
  </div>
  </div>

  {/* Content of Comment Card */}
  <div className="max-w-[calc(100%-3rem)]">
  <p
    className={`text-gray-700 whitespace-pre-wrap break-words transition-all duration-300 ease-in-out overflow-hidden ${
      expandedComments[comment.commentid] ? "max-h-full" : "max-h-[3.3em]"
    }`}
    style={{
      display: '-webkit-box',
      WebkitLineClamp: expandedComments[comment.commentid] ? 'unset' : 2,
      WebkitBoxOrient: 'vertical',
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

  {comment.content.length > 100 && (
    <span
      onClick={() => toggleContent(comment.commentid)}
      className="text-blue-500 cursor-pointer mt-1 inline-block"
    >
      {expandedComments[comment.commentid] ? "Show less" : "Show more"}
    </span>
  )}
  </div>


  {/* Reply button */}
  <div className="flex flex-col items-end mt-2">
    {!isReplying && (
      <button
        className="text-blue-500 hover:text-blue-700"
        onClick={() => onReplyClick(comment.commentid, comment.username)}
        aria-label="Reply"
      >
        <CornerDownLeft size={18} />
        </button>
    )}

   {/* Reply box (conditionally rendered) */}
   {isReplying && (
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
            onPostReply(comment.postid, comment.commentid, comment.username)
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
    </div>   
  );
};

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-4xl font-bold">Room: {room ? room.name : "Not Found"}</h1>
          <div className="flex gap-3">
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                (!isMember || isUpdating) 
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
                (isMember || isUpdating) 
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

        <p className="text-gray-600 text-lg mb-6">{room ? room.description : "No description available."}</p>

        {/* Check if there are articles */}
        {articles.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
            <p className="text-gray-500 text-lg">No articles have been posted in this room yet.</p>
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.postid} className="bg-white shadow-md rounded-lg p-6 mt-6">
            {/* Article Image or Placeholder */}
            {article.media_url ? (
              <div className="relative mb-4">
                <img
                  src={article.media_url}
                  alt="Article"
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg">
                  {article.users?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[300px] mb-4 rounded-lg overflow-hidden bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium z-10">No Image</span>
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
                           onClick={() => console.log("Edit article", article.postid)}
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
                         onClick={() => setReportTarget({ type: "community_note", id: article.postid })}
                         >
                          + Comunity Note
                      </button>
                      <button 
                        className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                        onClick={() => setReportTarget({ type: "article", id: article.postid })}
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
                <span className="text-lg font-bold text-blue-900">@{article.users?.username || "Unknown"}</span>
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
  
              <button className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg"
              onClick={() => setReplyingToArticle(article.postid)}>
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
 {/* Toggle Button BELOW Top Comment Card */}
 {comment.replies?.length > 0 && (
      <div className="flex justify-end pr-3 mt-4 mb-1">
        <button
          className="text-sm text-blue-500 font-semibold hover:underline"
          onClick={() => toggleReplies(comment.commentid)}
        >
          {visibleReplies[comment.commentid] ? "Hide replies" : `View ${comment.replies.length} Repl${comment.replies.length > 1 ? "ies" : "y"}`}
        </button>
      </div>
    )}

    {/* If visible, render replies */}
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

          {/* Sub-replies (if any) */}
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
            </div>
          ))
        )}
        {reportTarget && (
  // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              const { error } = await supabase.from("community_notes").insert([
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
            What's going on? We'll review against all community guidelines.
          </p>

          {[
            "Sexual content",
            "Violent or repulsive content",
            "Hateful or abusive content",
            "Harassment or bullying",
            "Harmful or dangerous acts",
            "Misinformation",
          ].map((reason) => (
            <label key={reason} className="flex items-center mb-2 cursor-pointer">
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
