import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Navbar from "../navBar";
import { MoreVertical } from "lucide-react"; // Import 3-dot icon

const Room = () => {
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


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (storedUser?.user?.userid) {
      setUser(storedUser.user);
    } else {
      console.warn("No user found in localStorage.");
    }
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

    //Toggle Article Menu
  const toggleArticleMenu = (postid) => {
    setArticleMenu(articleMenu === postid ? null : postid);
  };

    //Toggle Comment Menu
  const toggleCommentMenu = (commentid) => {
    setCommentMenu(commentMenu === commentid ? null : commentid);
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
        .select("postid, title, content, created_at, userid, users:userid(username), room_comments(*)")
        .eq("roomid", roomid)
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }
    
      const articlesWithComments = data.map((article) => {
        const filteredComments = article.room_comments.filter(comment => comment.postid === article.postid);
    
        // Organizing comments into parent-child hierarchy
        const allComments = [];
        const commentMap = {}; // Store comments by ID for quick lookup
    
        filteredComments.forEach((comment) => {
          comment.replies = [];
          commentMap[comment.commentid] = comment;
    
          if (!comment.parent_commentid) {
            // This is a top-level comment
            allComments.push(comment);
          } else {
            // Ensure replies to non-parent comments are correctly linked
            const parentComment = commentMap[comment.parent_commentid];
            if (parentComment) {
              parentComment.replies.push(comment);
            } else {
              // If the parent is missing, keep it as a top-level comment
              allComments.push(comment);
            }
          }
        });
    
        return {
          ...article,
          room_comments: allComments, // Assign only relevant comments
        };
      });
    
      setArticles(articlesWithComments);
    };    

    fetchRoomDetails();
    checkMembership();
    fetchArticles();
  }, [roomid, user]);

  const handleReplyClick = (commentid) => {
    setReplyingTo(commentid); // Store the comment ID that the user is replying to
    setReplyText(`@${username} `); // Prefix reply with @username
  };
  
  const handlePostReply = async (postid, parentCommentId, parentUsername = null) => {
    if (!replyText.trim()) return; // Prevent empty replies
    if (!user) {
      alert("You must be logged in to reply.");
      return;
    }
  
    // Only add @username when replying to a non-parent comment, and check if it's already present
    const isReplyToNonParent = parentUsername !== null;
    const trimmedReplyText = isReplyToNonParent && !replyText.startsWith(`@${parentUsername}`)
      ? `@${parentUsername} ${replyText}`
      : replyText;
  
    const { error } = await supabase.from("room_comments").insert([
      {
        postid: postid, // Correctly linked to the article
        userid: user.userid,
        username: user.username,
        content: trimmedReplyText, // Prevents duplicate @username
        created_at: new Date().toISOString(),
        parent_commentid: parentCommentId, // Correct parent ID
      },
    ]);
  
    if (error) {
      console.error("Error posting reply:", error);
      return;
    }
  
    // Reset the reply box
    setReplyingTo(null);
    setReplyText("");
  
    // Refresh the comments immediately
    fetchArticles();
  };  
  
  const handlePostArticleReply = async (postid) => {
    if (!articleReplyText.trim()) return;
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
  
    const { error } = await supabase
      .from("room_comments")
      .insert([
        { 
          postid: postid, // Assign the article ID correctly
          userid: user.userid, 
          username: user.username,
          content: articleReplyText, 
          created_at: new Date().toISOString(),
          parent_commentid: null // Ensures it is a top-level comment
        }
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

      const { error: countError } = await supabase.rpc("decrement_member_count", { room_id: roomid });

      if (countError) {
        console.error("Error updating member count:", countError);
        return;
      }

      setIsMember(false);
      localStorage.setItem("refreshRooms", "true");

    } catch (error) {
      console.error("Unexpected error while exiting room:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-4xl font-bold">Room: {room ? room.name : "Not Found"}</h1>
          <div className="flex gap-3">
            {/* Exit Button (Active Only If Member) */}
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleExitRoom}
              disabled={!isMember}
            >
              Exit
            </button>

            {/* Join Button (Disabled If Already a Member) */}
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
              }`}
              disabled={isMember} // This disables the button if the user is already a member
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
                      className="text-gray-500 hover:text-black cursor-pointer" 
                      onClick={() => toggleArticleMenu(article.postid)} 
                    />
                    {articleMenu === article.postid && (
                      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2">
                      <button className="block w-full text-left p-2 hover:bg-gray-100">Edit</button>
                      <button className="block w-full text-left p-2 hover:bg-gray-100 text-red-500">Delete</button>
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
              onClick={() => setReplyingToArticle(article.postid)}>Reply</button>

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
    {/* Top-Level Comment */}
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      {/* Comment Header - Username & 3-dot Menu Aligned */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-lg mr-3">
            {comment.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <span className="text-lg font-bold text-blue-900">@{comment.username}</span>
            <span className="text-blue-900 text-sm ml-2">
                {new Date(comment.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
        </div>

      {/* 3-dot menu */}
        <div className="relative">
          <MoreVertical 
            size={20} 
            className="text-gray-500 hover:text-black cursor-pointer" 
            onClick={() => toggleCommentMenu(comment.commentid)} 
          />
          {commentMenu === comment.commentid && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2">
              <button className="block w-full text-left p-2 hover:bg-gray-100">Edit</button>
              <button className="block w-full text-left p-2 hover:bg-gray-100 text-red-500">Delete</button>
          </div>
          )}
        </div>
      </div>

      {/* Comment Content */}
      <p className="mt-1 text-gray-700">{comment.content}</p>

      {/* Reply Button */}
      <button
        className="mt-2 text-blue-500 hover:underline"
        onClick={() => handleReplyClick(comment.commentid)}
      >
        Reply
      </button>

      {/* Show Reply Input Box (Positioned Below Comment) */}
      {replyingTo === comment.commentid && (
        <div className="ml-6 mt-3">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => handlePostReply(comment.postid, comment.commentid, null)}
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

{/* Replies (YouTube-Style: Non-parent replies stay at same level) */}
{comment.replies.length > 0 && comment.replies.map((reply) => (
  <div key={reply.commentid} className="bg-gray-200 p-3 rounded-lg mt-2 ml-10">
    {/* Reply Header - Username & 3-dot Menu */}
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-lg mr-3">
          {reply.username?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <span className="text-md font-bold text-blue-900">@{reply.username}</span>
          <span className="text-blue-900 text-sm ml-2">
            {new Date(reply.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 3-dot menu for reply */}
      <div className="relative">
        <MoreVertical 
          size={20} 
          className="text-gray-500 hover:text-black cursor-pointer" 
          onClick={() => toggleCommentMenu(reply.commentid)} 
        />
        {commentMenu === reply.commentid && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2">
            <button className="block w-full text-left p-2 hover:bg-gray-100">Edit</button>
            <button className="block w-full text-left p-2 hover:bg-gray-100 text-red-500">Delete</button>
          </div>
        )}
      </div>
    </div>

    {/* Reply Content */}
    <p className="mt-1 text-gray-700">{reply.content}</p>

    {/* Reply Button for Nested Replies */}
    <button
      className="mt-2 text-blue-500 hover:underline"
      onClick={() => {
        setReplyingTo(reply.commentid);
        setReplyText(`@${reply.username} `); // Auto-fill input with @username
      }}
    >
      Reply
    </button>

    {/* Show Reply Input Box (YouTube-Style: Keeps indentation, adds username) */}
    {replyingTo === reply.commentid && (
      <div className="ml-6 mt-3">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Write your reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handlePostReply(reply.postid, reply.commentid, reply.username)}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Room;
