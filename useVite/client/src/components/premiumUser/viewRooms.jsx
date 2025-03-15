import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Search from "../search.jsx";
import Navbar from "../navBar.jsx"; // Ensure correct import path

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
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />
      

      {/* Main Content Section */}
      <div className="flex flex-col flex-grow items-center w-full px-4">
        <div className="w-full max-w-5xl p-6 font-grotesk">
          <h1 className="text-4xl mb-8 font-grotesk text-left">
            Explore “All” Rooms:
          </h1>

          {/* Ranked Rooms - Fixed Image, Divider, and Name Position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
            {rooms.slice(0, 3).map((room, index) => (
              <div
                key={room.roomid}
                onClick={() => navigate(`/room/${room.roomid}`)}
                className="w-80 h-60 mx-auto border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
              >
                {/* Room Image Placeholder (Now Stretches to Edges and Touches Divider) */}
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

                  {/* Rank Overlay (Already Correct) */}
                  <div className="absolute top-2 left-2 bg-black text-white text-sm font-bold px-3 py-1 rounded-lg border-2 border-white">
                    Rank #{index + 1}
                  </div>
                </div>

                {/* Line Divider (Now Lowered to Match Blue Line) */}
                <div className="w-full border-t border-black"></div>

                {/* Room Name (Now Below Divider) */}
                <p className="text-left text-black font-medium px-4 py-2">
                  {room.name}
                </p>
              </div>
            ))}
          </div>

          {/* Room List - No Changes */}
          <div className="w-full max-w-5xl space-y-4">
            {rooms.map((room) => (
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
                  className="px-6 py-2 text-sm font-bold rounded-full bg-[#BFD8FF] text-black hover:bg-blue-300"
                  onClick={(e) => handleJoinAndRedirect(room.roomid, e)}
                >
                  Join
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

