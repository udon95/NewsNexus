// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import supabase from "../../api/supabaseClient";
// import Search from "../search.jsx";
// import Navbar from "../navBar.jsx"; // Ensure correct import path

// const ViewRoomsPage = () => {
//   const [rooms, setRooms] = useState([]);
//   const [user, setUser] = useState(null);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const initialQuery = searchParams.get("query") || "";
//   const [searchQuery, setSearchQuery] = useState(initialQuery);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch user from localStorage
//     const storedUser = JSON.parse(localStorage.getItem("userProfile"));
//     if (storedUser && storedUser.user && storedUser.user.userid) {
//       setUser(storedUser.user);
//     } else {
//       console.warn("No user found in localStorage.");
//     }

//     // Fetch Rooms from Supabase
//     const fetchRooms = async () => {
//       const { data, error } = await supabase
//         .from("rooms")
//         .select("*") // Ensure image_url is included
//         .order("member_count", { ascending: false });

//       if (error) {
//         console.error("Error fetching rooms:", error);
//       } else {
//         setRooms(data);
//       }
//     };
//     fetchRooms();
//   }, []);

//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     setSearchParams({ query });
//   };

//   const handleJoinAndRedirect = async (roomid, e) => {
//     e.stopPropagation();
//     if (!user) {
//       alert("Please log in to join a room.");
//       return;
//     }

//     const userId = user.userid; // Get user ID from localStorage

//     const { data: existingMembership } = await supabase
//       .from("room_members")
//       .select("*")
//       .eq("userid", userId)
//       .eq("roomid", roomid);

//     if (existingMembership.length === 0) {
//       const { error } = await supabase.from("room_members").insert([
//         { userid: userId, roomid, joined_at: new Date().toISOString() },
//       ]);

//       if (error) {
//         console.error("Error joining room:", error);
//         return;
//       }
//     }

//     navigate(`/room/${roomid}`);
//   };

//   // Filter rooms based on search query
//   const filteredRooms = rooms.filter((room) =>
//     room.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="relative min-h-screen w-screen flex flex-col bg-white">
//       {/* Navbar */}
//       <Navbar />

//       {/* Search Bar (Styled to Match Explore Page) */}
//       <div className="w-full flex justify-center mt-6 mb-6"> {/* Adjusted spacing here */}
//         <div className="w-full max-w-3xl px-4">
//           <Search onSearch={handleSearch} />
//         </div>
//       </div>

//       {/* Main Content Section */}
//       <div className="flex flex-col flex-grow items-center w-full px-4">
//         <div className="w-full max-w-5xl p-6 font-grotesk">
//           <h1 className="text-4xl mb-8 font-grotesk text-left">
//             Explore “All” Rooms:
//           </h1>

//           {/* Ranked Rooms - Fixed Image, Divider, and Name Position */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
//             {filteredRooms.slice(0, 3).map((room, index) => (
//               <div
//                 key={room.roomid}
//                 onClick={() => navigate(`/room/${room.roomid}`)}
//                 className="w-80 h-60 mx-auto border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
//               >
//                 {/* Room Image Placeholder */}
//                 <div className="w-full h-48 bg-gray-200 rounded-t-2xl overflow-hidden relative">
//                   {room.image_url ? (
//                     <img
//                       src={room.image_url}
//                       alt={room.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex justify-center items-center text-gray-500">
//                       No Image Available
//                     </div>
//                   )}

//                   {/* Rank Overlay */}
//                   <div className="absolute top-2 left-2 bg-black text-white text-sm font-bold px-3 py-1 rounded-lg border-2 border-white">
//                     Rank #{index + 1}
//                   </div>
//                 </div>

//                 {/* Line Divider */}
//                 <div className="w-full border-t border-black"></div>

//                 {/* Room Name */}
//                 <p className="text-left text-black font-medium px-4 py-2">
//                   {room.name}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Room List */}
//           <div className="w-full max-w-5xl space-y-4">
//             {filteredRooms.map((room, index) => (
//               <div
//                 key={room.roomid}
//                 onClick={() => navigate(`/room/${room.roomid}`)}
//                 className={`flex items-center justify-between p-4 border border-black rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer w-full ${
//                   index === filteredRooms.length - 1 ? "mb-12" : "" // Extra spacing only for the last card
//                 }`}
//               >
//                 <div>
//                   <span className="text-lg font-bold">{room.name}</span>
//                   <p className="text-sm text-gray-600">{room.description}</p>
//                 </div>
//                 <button
//                   className="px-6 py-2 text-sm font-bold rounded-full bg-[#BFD8FF] text-black hover:bg-blue-300"
//                   onClick={(e) => handleJoinAndRedirect(room.roomid, e)}
//                 >
//                   Join
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewRoomsPage;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Search from "../search.jsx";
import Navbar from "../navBar.jsx"; // Ensure correct import path

const ViewRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [userRooms, setUserRooms] = useState(new Set()); // Stores room IDs where the user is a member
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (storedUser && storedUser.user && storedUser.user.userid) {
      setUser(storedUser.user);
    } else {
      console.warn("No user found in localStorage.");
    }

    // Fetch Rooms from Supabase
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*") // Ensure image_url is included
        .order("member_count", { ascending: false });

      if (error) {
        console.error("Error fetching rooms:", error);
      } else {
        setRooms(data);
      }
    };
    fetchRooms();
  }, []);

  // Fetch user’s joined rooms
  useEffect(() => {
    if (!user) return;

    const fetchUserRooms = async () => {
      const { data, error } = await supabase
        .from("room_members")
        .select("roomid")
        .eq("userid", user.userid);

      if (error) {
        console.error("Error fetching user rooms:", error);
      } else {
        setUserRooms(new Set(data.map((room) => room.roomid))); // Store room IDs in a Set
      }
    };

    fetchUserRooms();
  }, [user]);

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

    const userId = user.userid; // Get user ID from localStorage

    if (userRooms.has(roomid)) {
      return; // Prevents joining again
    }

    const { error } = await supabase.from("room_members").insert([
      { userid: userId, roomid, joined_at: new Date().toISOString() },
    ]);

    if (error) {
      console.error("Error joining room:", error);
      return;
    }

    // Update state to reflect membership
    setUserRooms((prevRooms) => new Set([...prevRooms, roomid]));

    navigate(`/room/${roomid}`);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Search Bar (Styled to Match Explore Page) */}
      <div className="w-full flex justify-center mt-6 mb-6"> {/* Adjusted spacing here */}
        <div className="w-full max-w-3xl px-4">
          <Search onSearch={handleSearch} />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col flex-grow items-center w-full px-4">
        <div className="w-full max-w-5xl p-6 font-grotesk">
          <h1 className="text-4xl mb-8 font-grotesk text-left">
            Explore “All” Rooms:
          </h1>

          {/* Ranked Rooms - Fixed Image, Divider, and Name Position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
            {filteredRooms.slice(0, 3).map((room, index) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/room/${room.roomid}`)}
                className="w-80 h-60 mx-auto border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
              >
                {/* Room Image Placeholder */}
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

                  {/* Rank Overlay */}
                  <div className="absolute top-2 left-2 bg-black text-white text-sm font-bold px-3 py-1 rounded-lg border-2 border-white">
                    Rank #{index + 1}
                  </div>
                </div>

                {/* Line Divider */}
                <div className="w-full border-t border-black"></div>

                {/* Room Name */}
                <p className="text-left text-black font-medium px-4 py-2">
                  {room.name}
                </p>
              </div>
            ))}
          </div>

          {/* Room List */}
          <div className="w-full max-w-5xl space-y-4">
            {filteredRooms.map((room, index) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/room/${room.roomid}`)}
                className={`flex items-center justify-between p-4 border border-black rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer w-full ${
                  index === filteredRooms.length - 1 ? "mb-12" : "" // Extra spacing only for the last card
                }`}
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
                  disabled={userRooms.has(room.roomid)} // Disable button if user is already a member
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
