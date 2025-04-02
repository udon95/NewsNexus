import React, { useState, useEffect } from "react";
import { Pencil, Share2, Headphones, CornerDownLeft } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useAuthHook from "../hooks/useAuth";

const CommentsSection = () => {
  const { user, userType } = useAuthHook();
  const handleDeleteComment = (commentId, isReply, parentCommentId = null) => {
    if (isReply) {
      //  Delete only the specific reply
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentCommentId
            ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== commentId
                ),
              }
            : comment
        )
      );
    } else {
      //  Delete the entire comment + its replies
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    }

    handleMenuClose(commentId); //  Close menu after deleting
  };

  const initialComments = [
    {
      id: 1,
      author: "P",
      date: "Commented on 22/01/2025",
      content: "This is a sample comment for testing purposes.",
      hasReply: true,
      replies: [
        {
          id: 2,
          author: "P",
          date: "Replied on 22/01/2025",
          content: "This is a reply to the first comment.",
          isReply: true,
        },
      ],
    },
    {
      id: 3,
      author: "P",
      date: "Commented on 23/01/2025",
      content: "Another comment to show more examples.",
      hasReply: false,
      replies: [],
    },
  ];

  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem("comments");
    return savedComments ? JSON.parse(savedComments) : initialComments;
  });

  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const handlePostComment = () => {
    if (newComment.trim() !== "") {
      const newCommentObj = {
        id: Date.now(),
        author: "You",
        date: new Date().toLocaleDateString(),
        content: newComment,
        hasReply: false,
        replies: [],
      };
      setComments((prevComments) => [newCommentObj, ...prevComments]);
      setNewComment("");
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  const handlePostReply = (commentId) => {
    if (replyInputs[commentId]?.trim() !== "") {
      const newReply = {
        id: Date.now(),
        author: "You",
        date: new Date().toLocaleDateString(),
        content: replyInputs[commentId],
        isReply: true,
      };

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      );

      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
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
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-4">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className={`flex-grow rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none ${
    !user ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100"}`}
        />

        <div className="flex space-x-2 ml-3">
          <button
            className="w-10 h-10 p-2 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
            onClick={handlePostComment}
            disabled={!user}
          >
            <Pencil className={`h-5 w-5 text-white ${!user ? " cursor-not-allowed" : "cursor-allowed"}`} />
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

      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.id} className="mb-6">
            <div className="w-full bg-gray-200 p-4 rounded-lg mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg bg-blue-300">
                    {comment.author}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#00317F] text-sm font-semibold">
                      {comment.date}
                    </p>
                    <p className="text-lg text-black">{comment.content}</p>
                  </div>
                </div>

                <IconButton onClick={(e) => handleMenuOpen(e, comment.id)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor[comment.id]}
                  open={Boolean(menuAnchor[comment.id])}
                  onClose={() => handleMenuClose(comment.id)}
                >
                  <MenuItem onClick={() => handleMenuClose(comment.id)}>
                    Report Comment
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleDeleteComment(comment.id, false)}
                  >
                    Delete Comment
                  </MenuItem>
                </Menu>
              </div>

              {/* <div className="flex justify-end">
                <button
                  className="mt-2 text-black hover:text-gray-700"
                  title="Reply"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  <CornerDownLeft className="h-5 w-5" />
                </button>
              </div> */}

              {/* {replyingTo === comment.id && (
                <div className="mt-3 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyInputs[comment.id] || ""}
                    onChange={(e) =>
                      handleReplyChange(comment.id, e.target.value)
                    }
                    className="flex-grow bg-gray-100 rounded-lg px-3 py-2 text-black placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    className="w-8 h-8 p-1 bg-black rounded-lg hover:bg-gray-900 flex items-center justify-center"
                    onClick={() => handlePostReply(comment.id)}
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </button>
                </div>
              )} */}
            </div>

            {/* Replies (Now With Profile & Three Dots) */}
            {/* {comment.replies.map((reply) => (
              <div
                key={reply.id}
                className="ml-10 bg-gray-200 p-4 rounded-lg mt-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg bg-blue-300">
                      {reply.author}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#00317F]">
                        {reply.date}
                      </p>
                      <p className="text-black">{reply.content}</p>
                    </div>
                  </div>

                  <IconButton onClick={(e) => handleMenuOpen(e, reply.id)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor[reply.id]}
                    open={Boolean(menuAnchor[reply.id])}
                    onClose={() => handleMenuClose(reply.id)}
                  >
                    <MenuItem onClick={() => handleMenuClose(reply.id)}>
                      Report Comment
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        handleDeleteComment(reply.id, true, comment.id)
                      }
                    >
                      Delete Comment
                    </MenuItem>
                  </Menu>
                </div>
              </div> */}
            {/* ))} */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
