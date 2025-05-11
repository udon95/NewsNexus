import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";


const FloatingRoomStats = ({ user }) => {
  const [stats, setStats] = useState({
    publicRooms: 0,
    privateRooms: 0,
    roomArticles: 0,
    roomDrafts: 0,
  });


  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      const userId = storedUser?.user?.userid;
      if (!userId) return;


      try {
        const [pubRooms, privRooms, posted, drafts] = await Promise.all([
          supabase
            .from("room_members")
            .select("roomid", { count: "exact", head: true })
            .eq("userid", userId)
            .in("roomid",
              (await supabase.from("rooms").select("roomid").eq("room_type", "Public")).data.map(r => r.roomid)
            ),


          supabase
            .from("room_members")
            .select("roomid", { count: "exact", head: true })
            .eq("userid", userId)
            .in("roomid",
              (await supabase.from("rooms").select("roomid").eq("room_type", "Private")).data.map(r => r.roomid)
            ),


          supabase
            .from("room_articles")
            .select("*", { count: "exact", head: true })
            .eq("userid", userId)
            .eq("status", "Published"),


          supabase
            .from("room_articles")
            .select("*", { count: "exact", head: true })
            .eq("userid", userId)
            .eq("status", "Draft"),
        ]);


        setStats({
          publicRooms: pubRooms?.count || 0,
          privateRooms: privRooms?.count || 0,
          roomArticles: posted?.count || 0,
          roomDrafts: drafts?.count || 0,
        });
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };


    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className={`mt-[65px] z-40 flex flex-col items-start gap-3`}>
      <div className="text-sm font-bold text-[#00317F] mb-2 -ml-1">
        Room Activity
      </div>
      <div className="flex flex-col gap-3 text-center text-xs text-[#00317F] font-medium">
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.publicRooms.toString().padStart(2, "0")}
          </div>
          <div>Public Rooms</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.privateRooms.toString().padStart(2, "0")}
          </div>
          <div>Private Rooms</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.roomArticles.toString().padStart(2, "0")}
          </div>
          <div>Room Posts</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.roomDrafts.toString().padStart(2, "0")}
          </div>
          <div>Room Drafts</div>
        </div>
      </div>
    </div>
  );
};


export default FloatingRoomStats;
