import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Search from "../search.jsx";
import Navbar from "../navBar.jsx";
import useAuthHook from "../../hooks/useAuth.jsx";

const ViewRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [userRooms, setUserRooms] = useState(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const { userType } = useAuthHook();

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
        const activeRooms = new Set(
          data.filter((r) => r.exited_at === null).map((r) => r.roomid)
        );
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
    if (userType === "Free") {
      alert("Upgrade to Premium to join and view room details.");
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
          .insert([
            { userid: userId, roomid, joined_at: new Date().toISOString() },
          ]);

        if (insertError) {
          console.error("Error joining room:", insertError);
          return;
        }
      }

      // Use API to update `member_count`
      const { error: countError } = await supabase.rpc(
        "increment_member_count",
        { room_id: roomid }
      );

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

  const handleRoomClick = (roomid) => {
    if (userType === "Free") {
      alert("Upgrade to Premium to view room details.");
      return;
    }
    navigate(`/room/${roomid}`);
  };

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
            Explore All Rooms:
          </h1>

          {/* RANKING CARD SECTION - UNTOUCHED */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
            {filteredRooms.slice(0, 3).map((room, index) => (
              <div
                key={room.roomid}
                onClick={() => handleRoomClick(room.roomid)}
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
                onClick={() => handleRoomClick(room.roomid)}
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
