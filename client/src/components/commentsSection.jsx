import React, { useState, useEffect, useRef } from "react";
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
  const [expandedComments, setExpandedComments] = useState({});
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  // TTS
  const [isPlaying, setIsPlaying] = useState(false); // Track TTS play state
  const [canRestart, setCanRestart] = useState(false); // Track restart availability
  const speechRef = useRef(null); // Reference to Speech API object

  const handleTTS = () => {
    // If speech is already playing, toggle pause/resume
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    // If speech was paused, resume it
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel(); // Stop previous speech

    // Extract text from the article content
    if (!articleId.current) {
      alert("No article content found.");
      return;
    }

    const articleText =
      articleId.current.innerText || "No article content found.";

    const speech = new SpeechSynthesisUtterance();
    speech.text = articleText;
    speech.lang = "en-US";
    speech.rate = 1; // Normal speed
    speech.pitch = 1; // Normal pitch

    // When speech starts, update play state & show restart button
    speech.onstart = () => {
      setIsPlaying(true);
      setCanRestart(true);
    };

    // When speech ends, reset state
    speech.onend = () => {
      setIsPlaying(false);
      setCanRestart(false);
    };

    speechRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  // Function to restart TTS from the beginning
  const handleRestartTTS = () => {
    if (!speechRef.current) return;
    window.speechSynthesis.cancel();
    handleTTS(); // Restart speech from beginning
  };
  
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => {
      window.speechSynthesis.cancel(); // Stop speech when component unmounts or page refreshes
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
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

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
    }
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

      if (error) {
        console.error("Error submitting report:", error);
      } else {
        alert("Report submitted.");
        setReportTarget(null);
        setSelectedReason("");
      }
    }
  };

  const handleShareClick = () => {
    const shareLink = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url: shareLink,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => alert("Link copied to clipboard!"))
        .catch((error) => console.log("Error copying to clipboard:", error));
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

          <button
            className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
            onClick={handleShareClick}
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>

          {userType === "Premium" && (
            <button
              className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
              onClick={handleTTS}
            >
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
            <div className="w-full bg-white p-4 rounded-lg mb-2 shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full bg-blue-500 text-white">
                  {comment.username?.[0]?.toUpperCase() || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[#00317F] text-sm font-semibold">
                    <span className="font-bold text-black">
                      {comment.username}
                    </span>{" "}
                    • {new Date(comment.created_at).toLocaleString()}
                  </p>
                  <p
                    className={`text-lg text-black break-words whitespace-pre-wrap overflow-hidden ${
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
                    {comment.content}
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

      {/* ✅ Report Modal for Comments */}
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
