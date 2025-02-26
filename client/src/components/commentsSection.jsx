import React, { useState } from "react";
import { Pencil, Share2, Headphones, CornerDownLeft } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const CommentsSection = () => {
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

  const [anchorEl, setAnchorEl] = useState(null);

  // Open & Close Menu Functions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Comment Input Section */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-4">
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

          <button className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </button>

          <button className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`w-full bg-gray-200 p-4 rounded-lg mb-4 ${
              comment.isReply ? "ml-10 max-w-xl" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg ${
                    comment.isReply ? "bg-purple-300" : "bg-blue-300"
                  }`}
                >
                  {comment.author}
                </div>
                <div className="flex-1">
                  <p className="text-[#00317F] text-sm font-semibold">{comment.date}</p>
                  <p className="text-lg text-black">{comment.content}</p>
                </div>
              </div>

              {/* Three-Dot Report Menu */}
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>Report Comment</MenuItem>
              </Menu>
            </div>

            {/* Reply Button (Only for main comments) */}
            {!comment.isReply && (
              <div className="flex justify-end">
                <button className="mt-2 text-black hover:text-gray-700" title="Reply">
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
