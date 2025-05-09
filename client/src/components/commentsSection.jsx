import React, { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
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
  const [expandedComments, setExpandedComments] = useState({});
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 100);
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("article_comments")
      .select("*")
      .eq("articleid", articleId)
      .order("created_at", { ascending: false });

    if (!error) setComments(data);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from("article_comments").insert([
      {
        articleid: articleId,
        userid: user?.userid,
        username: user?.username,
        content: newComment,
      },
    ]);

    if (!error) {
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

    if (!error) {
      setComments((prev) => prev.filter((c) => c.commentid !== commentId));
    }
  };

  const handleMenuOpen = (event, commentId) => {
    setMenuAnchor((prev) => ({ ...prev, [commentId]: event.currentTarget }));
  };

  const handleMenuClose = (commentId) => {
    setMenuAnchor((prev) => ({ ...prev, [commentId]: null }));
  };

  const toggleContent = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReportSubmit = async () => {
    if (selectedReason && reportTarget) {
      const { error } = await supabase.from("reports").insert([
        {
          target_id: reportTarget.id,
          target_type: reportTarget.type,
          reason: selectedReason,
          userid: user?.userid,
          username: user?.username,
          created_at: new Date().toISOString(),
          resolved: false,
          resolution: null,
        },
      ]);

      if (!error) {
        alert("Report submitted.");
        setReportTarget(null);
        setSelectedReason("");
      }
    }
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
        </div>
      </div>

      {/* Comments List */}
      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.commentid} className="mb-6">
            <div className="w-full bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500 text-white flex-shrink-0 flex items-center justify-center font-bold rounded-lg mr-3">
                      {comment.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-blue-900">
                      @{comment.username}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(comment.created_at).toLocaleDateString("en-GB")}
                    </p>
                   <p
                    className={`text-gray-700 whitespace-pre-wrap break-words transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedComments[comment.commentid]
                        ? "max-h-full"
                        : "max-h-[3.3em]"
                    }`}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: expandedComments[comment.commentid] ? "unset" : 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
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
                        {expandedComments[comment.commentid]
                          ? "Show less"
                          : "Show more"}
                      </span>
                    )}
                  </div>
                </div>

                {user && (
                  <>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, comment.commentid)}
                      className="menu-icon"
                    >
                      <MoreVertIcon className="text-gray-500 hover:text-black" />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor[comment.commentid]}
                      open={Boolean(menuAnchor[comment.commentid])}
                      onClose={() => handleMenuClose(comment.commentid)}
                    >
                      <MenuItem
                        onClick={() => {
                          setReportTarget({
                            type: "comment",
                            id: comment.commentid,
                          });
                          handleMenuClose(comment.commentid);
                        }}
                        style={{ color: "red" }}
                      >
                        Report Comment
                      </MenuItem>

                      {user?.userid === comment.userid && (
                        <MenuItem
                          onClick={() => {
                            handleMenuClose(comment.commentid);
                            handleDeleteComment(
                              comment.commentid,
                              comment.userid
                            );
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

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
              onClick={() => {
                setReportTarget(null);
                setSelectedReason("");
              }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">Report Comment</h2>
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
              onClick={handleReportSubmit}
            >
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
