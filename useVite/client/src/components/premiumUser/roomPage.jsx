import React, { useState } from "react";
import useAuthHook from "../../hooks/useAuth";

const Room = () => {
  const { user, userType } = useAuthHook(); // Get user and userType
  const [isMember, setIsMember] = useState(true);
  const [posts] = useState([
    {
      id: 1,
      user: "P",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      media: "",
      comments: [
        {
          id: 101,
          user: "P",
          content: "Aut consequuntur maxime aut harum repudiandae aut pariatur autem sed labore pariatur.",
          replies: [
            {
              id: 201,
              user: "P",
              content: "Aut consequuntur maxime aut harum repudiandae aut pariatur autem sed.",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      user: "P",
      content:
        "Another short article example with an image above and comments below. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      media: "",
      comments: [],
    },
  ]);

  return (
    <div style={{ width: "55%", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Room : Lee Hsien Loong</h2>
        <div style={buttonContainer}>
          <button style={exitButtonStyle} onClick={() => setIsMember(false)}><b>Exit</b></button>
          <button 
            style={isMember ? joinButtonDisabledStyle : joinButtonStyle}
            disabled={isMember}>
            <b>Join</b>
          </button>
        </div>
      </div>

      {posts.map((post) => (
        <div key={post.id} style={postStyle}>
          <div style={{ position: "relative", backgroundColor: "#e0e0e0", height: "350px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={profileRounded}>{post.user}</div>
          </div>
          <span style={timestampStyle}>Posted on <a href="#">22/01/2025</a></span>
          <p style={{ marginBottom: "10px", lineHeight: "1.6", fontSize: "17px" }}>{post.content}</p>
          <button style={replyButtonStyle}>Reply</button>
          <div>
            {post.comments.map((comment) => (
              <div key={comment.id} style={commentContainerStyle}>
                <div style={avatarStyle}>{comment.user}</div>
                <div style={commentTextContainer}>
                  <span style={timestampStyle}>Commented on <a href="#">22/01/2025</a></span>
                  <p style={commentText}>{comment.content}</p>
                  {comment.replies && comment.replies.map((reply) => (
                    <div key={reply.id} style={replyContainerStyle}>
                      <div style={replyAvatarStyle}>{reply.user}</div>
                      <div>
                        <span style={timestampStyle}>Replied on <a href="#">22/01/2025</a></span>
                        <p style={commentText}>{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
  marginTop: "15px",
};

const titleStyle = {
  fontSize: "32px",
  fontWeight: "bold",
};

const buttonContainer = {
  display: "flex",
  gap: "10px",
};

const exitButtonStyle = {
  padding: "5px 15px",
  backgroundColor: "#BFD8FF",
  color: "black",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
};

const joinButtonStyle = {
  padding: "5px 15px",
  backgroundColor: "#BFD8FF",
  color: "black",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
};

const joinButtonDisabledStyle = {
  padding: "5px 15px",
  backgroundColor: "#D3D3D3",
  color: "#888",
  border: "none",
  borderRadius: "8px",
  cursor: "not-allowed",
  fontSize: "14px",
};

const postStyle = {
  backgroundColor: "#ffffff",
  padding: "22px",
  borderRadius: "8px",
  marginTop: "25px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
};

const profileRounded = {
  position: "absolute",
  top: "12px",
  left: "12px",
  width: "55px",
  height: "55px",
  backgroundColor: "#A890E2",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  borderRadius: "12px",
};

const commentContainerStyle = {
  backgroundColor: "#F8F9FA",
  padding: "12px",
  borderRadius: "8px",
  marginTop: "10px",
  display: "flex",
  alignItems: "flex-start",
};

const commentTextContainer = {
  flex: 1,
};

const replyStyle = {
  backgroundColor: "#e9e9e9",
  padding: "12px",
  borderRadius: "8px",
  marginLeft: "30px",
  marginTop: "5px",
  display: "flex",
  alignItems: "center",
};

const avatarStyle = {
  width: "50px",
  height: "50px",
  backgroundColor: "#4A90E2",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  borderRadius: "12px",
  marginRight: "12px",
};

const replyContainerStyle = {
  backgroundColor: "#ECECEC",
  padding: "12px",
  borderRadius: "8px",
  marginLeft: "30px",
  marginTop: "5px",
  display: "flex",
  alignItems: "center",
};

const replyAvatarStyle = {
  width: "45px",
  height: "45px",
  backgroundColor: "#A890E2",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  borderRadius: "12px",
  marginRight: "10px",
};

const commentText = {
  fontSize: "16px",
  marginTop: "4px",
};

const timestampStyle = {
  fontSize: "14px",
  color: "#0044cc",
};

const replyButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#3F414C",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  marginTop: "12px",
};

export default Room;