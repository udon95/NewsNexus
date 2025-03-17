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

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Search from "../search.jsx";
import Navbar from "../navBar.jsx"; 

const ViewRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [userRooms, setUserRooms] = useState(new Set()); 
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (storedUser?.user?.userid) {
      setUser(storedUser.user);
    } else {
      console.warn("No user found in localStorage.");
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("member_count", { ascending: false });

      if (error) {
        console.error("Error fetching rooms:", error);
      } else {
        setRooms(data);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUserRooms = async () => {
      const { data, error } = await supabase
        .from("room_members")
        .select("roomid, exited_at")
        .eq("userid", user.userid);

      if (error) {
        console.error("Error fetching user rooms:", error);
      } else {
        const activeRooms = new Set(data.filter(r => r.exited_at === null).map(r => r.roomid));
        setUserRooms(activeRooms);
      }
    };

    fetchUserRooms();
  }, [user, rooms]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchParams({ query });
  };

  const handleJoinAndRedirect = async (roomid, e) => {
    e.stopPropagation();
    if (!user) {
        alert("Please log in to join a room.");
        return;
    }

    const userId = user.userid;

    try {
        setUserRooms((prevRooms) => new Set([...prevRooms, roomid]));

        const { data: existingMembership, error: checkError } = await supabase
            .from("room_members")
            .select("exited_at")
            .eq("userid", userId)
            .eq("roomid", roomid)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Error checking previous membership:", checkError);
            return;
        }

        if (existingMembership) {
            const { error: updateError } = await supabase
                .from("room_members")
                .update({ exited_at: null, joined_at: new Date().toISOString() })
                .eq("userid", userId)
                .eq("roomid", roomid);

            if (updateError) {
                console.error("Error rejoining room:", updateError);
                return;
            }
        } else {
            const { error: insertError } = await supabase
                .from("room_members")
                .insert([{ userid: userId, roomid, joined_at: new Date().toISOString() }]);

            if (insertError) {
                console.error("Error joining room:", insertError);
                return;
            }
        }

        // Use API to update `member_count`
        const { error: countError } = await supabase.rpc("increment_member_count", { room_id: roomid });

        if (countError) {
            console.error("Error updating member count:", countError);
            return;
        }

        navigate(`/room/${roomid}`);

    } catch (error) {
        console.error("Unexpected error while joining room:", error);

        setUserRooms((prevRooms) => {
            const newRooms = new Set(prevRooms);
            newRooms.delete(roomid);
            return newRooms;
        });
    }
 };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-full max-w-3xl px-4">
          <Search onSearch={handleSearch} />
        </div>
      </div>

      <div className="flex flex-col flex-grow items-center w-full px-4">
        <div className="w-full max-w-5xl p-6 font-grotesk">
          <h1 className="text-4xl mb-8 font-grotesk text-left">
            Explore “All” Rooms:
          </h1>

          {/* RANKING CARD SECTION - UNTOUCHED */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
            {filteredRooms.slice(0, 3).map((room, index) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/room/${room.roomid}`)}
                className="w-80 h-60 mx-auto border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
              >
                <div className="w-full h-48 bg-gray-200 rounded-t-2xl overflow-hidden relative">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-gray-500">
                      No Image Available
                    </div>
                  )}

                  <div className="absolute top-2 left-2 bg-black text-white text-sm font-bold px-3 py-1 rounded-lg border-2 border-white">
                    Rank #{index + 1}
                  </div>
                </div>

                <div className="w-full border-t border-black"></div>

                <p className="text-left text-black font-medium px-4 py-2">
                  {room.name}
                </p>
              </div>
            ))}
          </div>

          {/* ROOM LIST SECTION - UNTOUCHED */}
          <div className="w-full max-w-5xl space-y-4">
            {filteredRooms.map((room) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/room/${room.roomid}`)}
                className="flex items-center justify-between p-4 border border-black rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer w-full"
              >
                <div>
                  <span className="text-lg font-bold">{room.name}</span>
                  <p className="text-sm text-gray-600">{room.description}</p>
                </div>
                <button
                  className={`px-6 py-2 text-sm font-bold rounded-full ${
                    userRooms.has(room.roomid)
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#BFD8FF] text-black hover:bg-blue-300"
                  }`}
                  onClick={(e) => handleJoinAndRedirect(room.roomid, e)}
                  disabled={userRooms.has(room.roomid)}
                >
                  {userRooms.has(room.roomid) ? "Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoomsPage;
