import React, { useState, useEffect } from "react";
import { Pencil, Share2, Headphones } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useAuthHook from "../hooks/useAuth";
import supabase from "../api/supabaseClient";

const CommentsSection = ({ articleId }) => {
  const { user, userType } = useAuthHook();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [menuAnchor, setMenuAnchor] = useState({});

  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("article_comments")
      .select("*")
      .eq("articleid", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;

    // 🧪 Debug: Check user structure
    console.log("🧑‍💻 user.userid:", user?.userid);

    const { error } = await supabase.from("article_comments").insert([
      {
        articleid: articleId,
        userid: user?.userid, // ✅ important!
        username: user?.username,
        content: newComment,
      },
    ]);

    if (error) {
      console.error("Error posting comment:", error);
    } else {
      setNewComment("");
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    if (user.userid !== commentUserId) {
      alert("You can only delete your own comment.");
      return;
    }

    const { error } = await supabase
      .from("article_comments")
      .delete()
      .eq("commentid", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
    } else {
      setComments((prev) => prev.filter((c) => c.commentid !== commentId));
    }
  };

  const handleMenuOpen = (event, commentId) => {
    setMenuAnchor((prev) => ({ ...prev, [commentId]: event.currentTarget }));
  };

  const handleMenuClose = (commentId) => {
    setMenuAnchor((prev) => ({ ...prev, [commentId]: null }));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Comment Input */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-4">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className={`flex-grow rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none ${
            !user ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100"
          }`}
        />

        <div className="flex space-x-2 ml-3">
          <button
            className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
            onClick={handlePostComment}
            disabled={!user}
          >
            <Pencil className="h-5 w-5 text-white" />
          </button>

          <button className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </button>

          {userType === "Premium" && (
            <button className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.commentid} className="mb-6">
            <div className="w-full bg-gray-200 p-4 rounded-lg mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg bg-blue-300">
                    {comment.username?.[0]?.toUpperCase() || "U"}
                  </div>

                  {/* Username + Time + Comment */}
                  <div className="flex-1">
                    <p className="text-[#00317F] text-sm font-semibold">
                      <span className="font-bold text-black">{comment.username}</span>{" "}
                      • {new Date(comment.created_at).toLocaleString()}
                    </p>
                    <p className="text-lg text-black">{comment.content}</p>
                  </div>
                </div>

                {/* 3-dot Menu */}
                {user && (
                  <>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, comment.commentid)}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Menu
                      anchorEl={menuAnchor[comment.commentid]}
                      open={Boolean(menuAnchor[comment.commentid])}
                      onClose={() => handleMenuClose(comment.commentid)}
                    >
                      {/* Always show Report */}
                      <MenuItem
                        onClick={() => {
                          handleMenuClose(comment.commentid);
                          alert("Reported (fake for now)");
                        }}
                      >
                        Report Comment
                      </MenuItem>

                      {/* Only show Delete for your own comment */}
                      {user?.userid === comment.userid && (
                        <MenuItem
                          onClick={() => {
                            handleMenuClose(comment.commentid);
                            handleDeleteComment(comment.commentid, comment.userid);
                          }}
                        >
                          Delete Comment
                        </MenuItem>
                      )}
                    </Menu>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
