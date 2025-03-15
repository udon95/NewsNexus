// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import supabase from "../../api/supabaseClient";
// import Navbar from "../navBar"; // Ensure correct import

// const Room = () => {
//   const { id: roomid } = useParams();
//   const navigate = useNavigate();
//   const [room, setRoom] = useState(null);
//   const [isMember, setIsMember] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [articles, setArticles] = useState([]);

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("userProfile"));
//     if (storedUser && storedUser.user && storedUser.user.userid) {
//       setUser(storedUser.user);
//     } else {
//       console.warn("No user found in localStorage.");
//     }
//   }, []);

//   useEffect(() => {
//     if (!roomid) {
//       console.error("Room ID is undefined.");
//       return;
//     }

//     const fetchRoomDetails = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("rooms")
//         .select("name, description, member_count")
//         .eq("roomid", roomid)
//         .single();

//       if (error) {
//         console.error("Error fetching room details:", error);
//         setRoom(null);
//       } else {
//         setRoom(data);
//       }
//       setLoading(false);
//     };

//     const checkMembership = async () => {
//       if (!user) return;

//       const { data, error } = await supabase
//         .from("room_members")
//         .select("*")
//         .eq("userid", user.userid)
//         .eq("roomid", roomid);

//       if (error) {
//         console.error("Error checking membership:", error);
//       } else {
//         setIsMember(data.length > 0);
//       }
//     };

//     const fetchArticles = async () => {
//       const { data, error } = await supabase
//         .from("room_articles")
//         .select("postid, title, content, created_at, userid, users:userid(username), room_comments(*)")
//         .eq("roomid", roomid)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("Error fetching articles:", error);
//       } else {
//         setArticles(data);
//       }
//     };

//     fetchRoomDetails();
//     checkMembership();
//     fetchArticles();
//   }, [roomid, user]);

//   return (
//     <div className="relative min-h-screen w-screen flex flex-col bg-gray-100">
//       {/* Navbar Positioned at the Top */}
//       <Navbar />

//       <div className="w-full max-w-4xl mx-auto p-6">
//         {/* Title and Buttons */}
//         <div className="flex justify-between items-center mb-1">
//           <h1 className="text-4xl font-bold">Room: {room ? room.name : "Not Found"}</h1>
//           <div className="flex gap-3">
//             <button
//               className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
//                 isMember
//                   ? "bg-blue-300 text-black hover:bg-blue-400"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }`}
//               disabled={!isMember}
//             >
//               Exit
//             </button>

//             <button
//               className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
//                 isMember
//                   ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                   : "bg-blue-300 text-black hover:bg-blue-400"
//               }`}
//               disabled={isMember}
//             >
//               {isMember ? "Joined" : "Join"}
//             </button>
//           </div>
//         </div>

//         {/* Room Description */}
//         <p className="text-gray-600 text-lg mb-6">{room ? room.description : "No description available."}</p>

//         {/* Check if there are articles */}
//         {articles.length === 0 ? (
//           <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
//             <p className="text-gray-500 text-lg">No articles have been posted in this room yet.</p>
//           </div>
//         ) : (
//           articles.map((article) => (
//             <div key={article.postid} className="bg-white shadow-md rounded-lg p-6 mt-6">
//               {/* Author Profile Icon */}
//               <div className="relative bg-gray-300 h-85 rounded-lg flex items-center justify-center mb-4">
//                 <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg">
//                   {article.users?.username ? article.users.username.charAt(0).toUpperCase() : "?"}
//                 </div>
//               </div>

//               {/* Article Title & Content */}
//               <h2 className="text-2xl font-bold">{article.title}</h2>
//               <p className="text-sm text-gray-600">
//                 <span className="text-lg font-bold text-blue-900">@{article.users?.username || "Unknown"}</span>
//                 <span className="text-black">
//                   {" "}
//                   {new Date(article.created_at).toLocaleDateString("en-GB", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                   })}
//                 </span>
//               </p>
//               <p className="mt-2 text-gray-700">{article.content}</p>
//               <button className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg">Reply</button>

//               {/* Check if article has comments */}
//               {article.room_comments.length === 0 ? (
//                 <div className="bg-gray-100 p-4 rounded-lg mt-4 text-center">
//                   <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
//                 </div>
//               ) : (
//                 article.room_comments.map((comment) => (
//                   <div key={comment.commentid} className="bg-gray-100 p-4 rounded-lg mt-4 flex items-start">
//                     <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-lg mr-3">
//                       {comment.username?.charAt(0).toUpperCase() || "?"}
//                     </div>
//                     <div>
//                       <span className="text-lg font-bold text-blue-900">@{comment.username}</span>
//                       <span className="text-blue-900 text-sm ml-2">
//                         {new Date(comment.created_at).toLocaleDateString("en-GB", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                       </span>
//                       <p className="mt-1 text-gray-700">{comment.content}</p>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Room;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Navbar from "../navBar"; // Ensure correct import

const Room = () => {
  const { id: roomid } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (storedUser && storedUser.user && storedUser.user.userid) {
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

    const checkMembership = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("room_members")
        .select("*")
        .eq("userid", user.userid)
        .eq("roomid", roomid);

      if (error) {
        console.error("Error checking membership:", error);
      } else {
        setIsMember(data.length > 0);
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
      } else {
        setArticles(data);
      }
    };

    fetchRoomDetails();
    checkMembership();
    fetchArticles();
  }, [roomid, user]);

  // Function to Join Room
  const handleJoinRoom = async () => {
    if (!user) {
      alert("You need to be logged in to join this room.");
      return;
    }

    const { error } = await supabase.from("room_members").insert([
      { userid: user.userid, roomid, joined_at: new Date().toISOString() },
    ]);

    if (error) {
      console.error("Error joining room:", error);
      return;
    }

    // Update UI state
    setIsMember(true);
  };

  // Function to Exit Room
  const handleExitRoom = async () => {
    if (!user) {
      alert("You need to be logged in to exit the room.");
      return;
    }

    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("userid", user.userid)
      .eq("roomid", roomid);

    if (error) {
      console.error("Error exiting room:", error);
      return;
    }

    // Update UI state
    setIsMember(false);
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-gray-100">
      {/* Navbar Positioned at the Top */}
      <Navbar />

      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Title and Buttons */}
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-4xl font-bold">Room: {room ? room.name : "Not Found"}</h1>
          <div className="flex gap-3">
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleExitRoom}
              disabled={!isMember}
            >
              Exit
            </button>

            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                isMember
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              onClick={handleJoinRoom}
              disabled={isMember}
            >
              {isMember ? "Joined" : "Join"}
            </button>
          </div>
        </div>

        {/* Room Description */}
        <p className="text-gray-600 text-lg mb-6">{room ? room.description : "No description available."}</p>

        {/* Check if there are articles */}
        {articles.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
            <p className="text-gray-500 text-lg">No articles have been posted in this room yet.</p>
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.postid} className="bg-white shadow-md rounded-lg p-6 mt-6">
              {/* Author Profile Icon */}
              <div className="relative bg-gray-300 h-85 rounded-lg flex items-center justify-center mb-4">
                <div className="absolute top-3 left-3 bg-blue-500 text-white w-12 h-12 flex items-center justify-center font-bold rounded-lg">
                  {article.users?.username ? article.users.username.charAt(0).toUpperCase() : "?"}
                </div>
              </div>

              {/* Article Title & Content */}
              <h2 className="text-2xl font-bold">{article.title}</h2>
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
              <button className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg">Reply</button>

              {/* Check if article has comments */}
              {article.room_comments.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded-lg mt-4 text-center">
                  <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                article.room_comments.map((comment) => (
                  <div key={comment.commentid} className="bg-gray-100 p-4 rounded-lg mt-4 flex items-start">
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
                      <p className="mt-1 text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Room;
