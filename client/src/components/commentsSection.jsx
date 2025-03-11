import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Pencil,
  Share2,
  Headphones,
  CornerDownLeft,
  Pause,
  StepBack,
} from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const CommentsSection = ({ articleRef }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "P",
      date: "Commented on 22/01/2025",
      content: "This is a sample comment for testing purposes.",
      hasReply: true,
    },
    {
      id: 2,
      author: "P",
      date: "Replied on 22/01/2025",
      content: "This is a reply to the first comment.",
      isReply: true,
    },
    {
      id: 3,
      author: "P",
      date: "Commented on 23/01/2025",
      content: "Another comment to show more examples.",
      hasReply: false,
    },
  ]);
  //   const { title } = useParams(); // Get the article title from URL

  const [anchorEl, setAnchorEl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // Track TTS play state
  const [canRestart, setCanRestart] = useState(false); // Track restart availability
  const speechRef = useRef(null); // Reference to Speech API object

  // Open & Close Menu Functions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleShare = async () => {
    try {
      const url = window.location.href; // Get current page URL
      await navigator.clipboard.writeText(url); // Copy URL to clipboard
      alert("Article link copied to clipboard!"); // Show success message
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Failed to copy link.");
    }
  };

  // Function to read the article aloud using Web Speech API
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
    if (!articleRef.current) {
      alert("No article content found.");
      return;
    }

    // Extract text from the article content
    const articleText =
      articleRef.current.innerText || "No article content found.";

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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Comment Input Section */}
      <div className="w-full max-w-[800px] flex items-center justify-between px-4 py-4">
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-grow bg-gray-100 rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none"
        />

        {/* Action Buttons */}
        <div className="flex space-x-2 ml-3">
          <button className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center">
            <Pencil className="h-5 w-5 text-white" />
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>

          <button
            onClick={handleTTS}
            className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Headphones className="h-5 w-5 text-white" />
            )}
            {/* <Headphones className="h-5 w-5 text-white" /> */}
          </button>
          {canRestart && (
              <button
                onClick={handleRestartTTS}
                className="w-10 h-10 p-2 bg-gray-700 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <StepBack className="h-5 w-5 text-white" />
              </button>
            )}
        </div>
      </div>

      {/* Comments List */}
      <div className="w-full max-w-[800px] mt-6">
        <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`w-full bg-gray-200 p-4 rounded-lg mb-4 ${
              comment.isReply ? "ml-10 max-w-2xl" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg ${
                    comment.isReply ? "bg-purple-300" : "bg-blue-300"
                  }`}
                >
                  {comment.author}
                </div>
                <div className="flex-1">
                  <p className="text-[#00317F] text-sm font-semibold">
                    {comment.date}
                  </p>
                  <p className="text-lg text-black">{comment.content}</p>
                </div>
              </div>

              {/* Three-Dot Report Menu */}
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Report Comment</MenuItem>
              </Menu>
            </div>

            {/* Reply Button (Only for main comments) */}
            {!comment.isReply && (
              <div className="flex justify-end">
                <button
                  className="mt-2 text-black hover:text-gray-700"
                  title="Reply"
                >
                  <CornerDownLeft className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
