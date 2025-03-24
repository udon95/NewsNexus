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



  console.log("Current replyingTo:", replyingTo);

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

      // if (error && error.code !== "PGRST116") {
      //   console.error("Error checking membership:", error);
      // } else {
      //   setIsMember(data && data.exited_at === null);
      // }
    
      // If no row or exited_at != null, user is not a member

      if (error || !data || data.exited_at !== null) {
        setIsMember(false);
      } else {
        setIsMember(true);
      }
    };

    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("room_articles")
        .select("postid, title, content, created_at, userid, users:userid(username), room_comments(*)")
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
          return { ...comment, replies: [...comment.replies, newReply] };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: insertReplyInNestedStructure(comment.replies),
          };
        } else {
          return comment;
        }
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
  
  // Function to Exit Room
  const handleExitRoom = async () => {
    if (isUpdating) return;
    if (!user) {
      alert("You need to be logged in to exit.");
      return;
    } 
    if (!isMember) return;
  
    setIsUpdating(true);
  
    try {
      // 1. Set exited_at = now
      const { error: updateError } = await supabase
        .from("room_members")
        .update({ exited_at: new Date().toISOString() })
        .eq("userid", user.userid)
        .eq("roomid", roomid);
  
      if (updateError) {
        console.error("Failed to set exited_at:", updateError);
        return;
      }
  
      // 2. Increment exit_count separately
      const { error: incrementError } = await supabase
        .from("room_members")
        .update({})
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .increment("exit_count", 1);
  
      if (incrementError) {
        console.error("Failed to increment exit_count:", incrementError);
        return;
      }
  
      // 3. Decrement member count
      const { error: countError } = await supabase.rpc("decrement_member_count", {
        room_id: roomid,
      });
  
      if (countError) {
        console.error("Error decrementing:", countError);
        return;
      }
  
      // 4. Update UI
      setIsMember(false);
      fetchRoomDetails();
      localStorage.setItem("refreshRooms", "true");
    } catch (err) {
      console.error("Unexpected error in exit:", err);
    } finally {
      setIsUpdating(false);
    }
  };
  

// Function to Join Room
// const handleJoinRoom = async () => {
//   if (!user) {
//     alert("You need to be logged in to join the room.");
//     return;
//   }

//   try {
//     // Check if user has a previous entry (exited before)
//     const { data: existingEntry, error: checkError } = await supabase
//       .from("room_members")
//       .select("exited_at")
//       .eq("userid", user.userid)
//       .eq("roomid", roomid)
//       .single();

//     if (checkError && checkError.code !== "PGRST116") {
//       console.error("Error checking previous membership:", checkError);
//       return;
//     }

//     if (existingEntry) {
//       // User has an old entry, update `exited_at` to null (rejoin)
//       const { error: updateError } = await supabase
//         .from("room_members")
//         .update({ exited_at: null })
//         .eq("userid", user.userid)
//         .eq("roomid", roomid);

//       if (updateError) {
//         console.error("Error rejoining room:", updateError);
//         return;
//       }
//     } else {
//       // First-time join, insert new entry
//       const { error: insertError } = await supabase
//         .from("room_members")
//         .insert([{ userid: user.userid, roomid, exited_at: null }]);

//       if (insertError) {
//         console.error("Error joining room:", insertError);
//         return;
//       }
//     }

//     // Increment member count
//     const { error: countError } = await supabase.rpc("increment_member_count", { room_id: roomid });

//     if (countError) {
//       console.error("Error updating member count:", countError);
//       return;
//     }

//     setTimeout(checkMembership, 500); // Ensure the UI updates after joining

//   } catch (error) {
//     console.error("Unexpected error while joining room:", error);
//   }
// };

const handleJoinRoom = async () => {
  if (isUpdating) return;        // Prevent spamming
  if (!user) {
    alert("You need to be logged in to join.");
    return;
  }
  if (isMember) {
    // Already a member – do nothing
    return;
  }

  setIsUpdating(true);

  try {
    // 1) Check if a membership row already exists
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
      // 2) Rejoin: update row by setting exited_at = null and increment join_count
      const { error: updateError } = await supabase
        .from("room_members")
        .update({ exited_at: null })
        .eq("userid", user.userid)
        .eq("roomid", roomid)
        .increment("join_count", 1); // Increment join_count
        
      if (updateError) {
        console.error("Error rejoining:", updateError);
        return;
      }
    } else {
      // 3) First-time join: insert a new membership row with join_count = 1
      const { error: insertError } = await supabase
        .from("room_members")
        .insert([{ userid: user.userid, roomid, exited_at: null, join_count: 1, exit_count: 0 }]);
      if (insertError) {
        console.error("Error joining:", insertError);
        return;
      }
    }

    // 4) Increment member_count
    const { error: countError } = await supabase.rpc("increment_member_count", { room_id: roomid });
    if (countError) {
      console.error("Error incrementing:", countError);
      return;
    }

    // 5) Optimistically set isMember = true
    setIsMember(true);

    // 6) Re-fetch the room details so we get the updated member_count
    fetchRoomDetails();
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
<div className="flex justify-between items-center">
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
          onClick={() => console.log("Delete comment", comment.commentid)}
        >
          Delete
        </button>
      </>
    ) : (
      <button
        className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
        // onClick={() => console.log("Report comment", comment.commentid)}
        onClick={() => setReportTarget({ type: "comment", id: comment.commentid })}
      >
        Report
      </button>
    )}
  </div>
)}

</div>
</div>

      {/* Content */}
      <p className="mt-2 text-gray-700">{comment.content}</p>

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
            {/* Exit Button (Active Only If Member) */}
            {/* <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleExitRoom}
              disabled={!isMember}
            >
              Exit
            </button> */}
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


            {/* Join Button (Disabled If Already a Member) */}
            {/* <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
              }`}
              onClick={handleJoinRoom}
              disabled={isMember} // This disables the button if the user is already a member
            >
              {isMember ? "Joined" : "Join"}
            </button> */}

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
              {/* Author Profile Placeholder */}
              <div className="relative bg-gray-300 h-85 rounded-lg flex items-center justify-center mb-4">
                <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg">
                  {article.users?.username ? article.users.username.charAt(0).toUpperCase() : "?"}
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
                          onClick={() => console.log("Delete article", article.postid)}
                        >
                        Delete
                          </button>
                        </>
                     ) : (
                       <>
                       {/* Owner sees Edit and Delete */}
                       <button 
                         className="block w-full text-left p-2 hover:bg-gray-100 text-black"
                         onClick={() => console.log("Edit article", article.postid)}
                        >
                          + Comunity Note
                      </button>
                      <button 
                        className="block w-full text-left p-2 hover:bg-gray-100 text-red-500"
                        // onClick={() => console.log("Report article", article.postid)}
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

    {comment.replies?.map((reply) => (
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

        {/* Handle reply-to-reply */}
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
      </div>
    </div>
  );
};

export default Room;
