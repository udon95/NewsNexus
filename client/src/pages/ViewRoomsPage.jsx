// import { useState } from "react";
// import { useNavigate } from "react-router-dom"; // Import navigation

// const rooms = [
//   { id: 1, rank: "Rank #01", name: "Room #01" },
//   { id: 2, rank: "Rank #02", name: "Room #02" },
//   { id: 3, rank: "Rank #03", name: "Room #03" },
//   { id: 4, name: "Room #04" },
//   { id: 5, name: "Room #05" },
//   { id: 6, name: "Room #06" },
//   { id: 7, name: "Room #07" },
//   { id: 8, name: "Room #08" },
// ];

// const ViewRoomsPage = () => {
//   const [joinedRooms, setJoinedRooms] = useState([]);
//   const navigate = useNavigate(); // Initialize navigation

//   const handleJoin = (id, e) => {
//     e.stopPropagation(); // Prevent navigation when clicking "Join"
//     if (!joinedRooms.includes(id)) {
//       setJoinedRooms([...joinedRooms, id]);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto bg-white min-h-screen">
//       <h2 className="text-2xl font-bold mb-6">Explore “All” Rooms:</h2>

//       {/* Ranked Rooms - Clickable */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {rooms.slice(0, 3).map((room) => (
//           <div
//             key={room.id}
//             onClick={() => navigate(`/room/${room.id}`)} // Navigate to room page
//             className="w-full h-56 border border-black rounded-2xl shadow-md bg-white flex flex-col justify-between cursor-pointer hover:shadow-lg transition"
//           >
//             <h3 className="text-lg font-bold p-4">{room.rank}</h3>
//             <div className="flex-grow"></div>
//             <div className="w-full border-t border-black"></div>
//             <p className="text-left text-black font-medium p-3">{room.name}</p>
//           </div>
//         ))}
//       </div>

//       {/* Room List - Clickable Cards */}
//       <div className="space-y-4">
//         {rooms.map((room) => (
//           <div
//             key={room.id}
//             onClick={() => navigate(`/room/${room.id}`)} // Make entire card clickable
//             className="flex items-center justify-between p-4 border border-black rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer"
//           >
//             <span className="text-lg font-bold">{room.name}</span>
//             <button
//               className={`px-6 py-2 text-sm font-bold rounded-full transition ${
//                 joinedRooms.includes(room.id)
//                   ? "bg-gray-400 text-black cursor-not-allowed"
//                   : "bg-[#BFD8FF] text-black hover:bg-blue-300"
//               }`}
//               onClick={(e) => handleJoin(room.id, e)} // Prevent navigation when clicking "Join"
//               disabled={joinedRooms.includes(room.id)}
//             >
//               {joinedRooms.includes(room.id) ? "Joined" : "Join"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ViewRoomsPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase";

const ViewRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data?.user);
      }
    };

    fetchUser();

    // Fetch rooms sorted by most members
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("member_count", { ascending: false }); //Sorting by most members

      if (error) {
        console.error("Error fetching rooms:", error);
      } else {
        setRooms(data);
      }
    };
    fetchRooms();
  }, []);

  const handleJoinAndRedirect = async (roomid, e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to join a room.");
      return;
    }

    const { data: existingMembership } = await supabase
      .from("room_members")
      .select("*")
      .eq("userid", user.id)
      .eq("roomid", roomid);

    if (existingMembership.length === 0) {
      const { error } = await supabase.from("room_members").insert([
        { userid: user.id, roomid, joined_at: new Date().toISOString() },
      ]);

      if (error) {
        console.error("Error joining room:", error);
        return;
      }
    }

    navigate(`/room/${roomid}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Explore “All” Rooms:</h2>

      {/* Ranked Rooms - Top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...rooms.slice(0, 3), ...Array(3 - rooms.length).fill(null)].map((room, index) => (
          <div
            key={room ? room.roomid : `placeholder-${index}`}
            onClick={() => room && navigate(`/room/${room.roomid}`)}
            className={`w-full h-56 border border-black rounded-2xl shadow-md flex flex-col justify-between cursor-pointer hover:shadow-lg transition p-4 ${
              !room ? "opacity-50 cursor-default" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-bold">Rank #{index + 1}</h3>
            <div className="flex-grow"></div>
            <div className="w-full border-t border-black"></div>
            <p className="text-left text-black font-medium">{room ? room.name : "Coming Soon..."}</p>
          </div>
        ))}
      </div>

      {/* Room List - All Rooms */}
      <div className="space-y-4">
        {rooms.map((room, index) => (
          <div
            key={room.roomid}
            onClick={() => navigate(`/room/${room.roomid}`)}
            className="flex items-center justify-between p-4 border border-black rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer"
          >
            <div>
              <span className="text-lg font-bold">{room.name}</span>
              <p className="text-sm text-gray-600">{room.description}</p>
            </div>
            <button
              className="px-6 py-2 text-sm font-bold rounded-full bg-[#BFD8FF] text-black hover:bg-blue-300"
              onClick={(e) => handleJoinAndRedirect(room.roomid, e)}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRoomsPage;
