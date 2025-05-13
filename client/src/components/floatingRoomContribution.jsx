import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";


const FloatingRoomContribution = ({ roomid }) => {
  const [stats, setStats] = useState({ articles: 0, comments: 0, days: 0 });


  // useEffect(() => {
  //   const fetchStats = async () => {
  //     const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  //     const userId = storedUser?.user?.userid;
  //     if (!userId || !roomid) return;


  //     try {
  //       const firstDayOfMonth = new Date();
  //       firstDayOfMonth.setDate(1);
  //       firstDayOfMonth.setHours(0, 0, 0, 0);
  //       const iso = firstDayOfMonth.toISOString();


  //       const [articlesRes, commentsRes, memberRes] = await Promise.all([
  //         supabase
  //           .from("room_articles")
  //           .select("*", { count: "exact", head: true })
  //           .eq("userid", userId)
  //           .eq("roomid", roomid)
  //           .eq("status", "Published")
  //           .gte("created_at", iso),


  //         supabase
  //           .from("room_comments")
  //           .select("*", { count: "exact", head: true })
  //           .eq("userid", userId)
  //           .in(
  //             "postid",
  //             (
  //               await supabase
  //                 .from("room_articles")
  //                 .select("postid")
  //                 .eq("roomid", roomid)
  //             )?.data?.map((a) => a.postid) || []
  //           )
  //           .gte("created_at", iso),


  //         supabase
  //           .from("room_members")
  //           .select("joined_at")
  //           .eq("userid", userId)
  //           .eq("roomid", roomid)
  //           .single(),
  //       ]);


  //       let days = 0;
  //       if (memberRes?.data?.joined_at) {
  //         const joinDate = new Date(memberRes.data.joined_at);
  //         const now = new Date();
  //         days = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
  //       }


  //       setStats({
  //         articles: articlesRes?.count || 0,
  //         comments: commentsRes?.count || 0,
  //         days,
  //       });
  //     } catch (error) {
  //       console.error("Error fetching room contribution stats:", error);
  //     }
  //   };


  //   fetchStats();
  // }, [roomid]);

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      const userId = storedUser?.user?.userid;
      if (!userId || !roomid) return;
  
      try {
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const iso = firstDayOfMonth.toISOString();
  
        const [articlesRes, commentsRes, memberRes] = await Promise.all([
          supabase
            .from("room_articles")
            .select("*", { count: "exact", head: true })
            .eq("userid", userId)
            .eq("roomid", roomid)
            .eq("status", "Published")
            .gte("created_at", iso),
  
          supabase
            .from("room_comments")
            .select("*", { count: "exact", head: true })
            .eq("userid", userId)
            .in(
              "postid",
              (
                await supabase
                  .from("room_articles")
                  .select("postid")
                  .eq("roomid", roomid)
              )?.data?.map((a) => a.postid) || []
            )
            .gte("created_at", iso),
  
          supabase
            .from("room_members")
            .select("joined_at")
            .eq("userid", userId)
            .eq("roomid", roomid)
            .single(),
        ]);
  
        let days = 0;
        if (memberRes?.data?.joined_at) {
          const joinDate = new Date(memberRes.data.joined_at);
          const now = new Date();
          days = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        }
  
        setStats({
          articles: articlesRes?.count || 0,
          comments: commentsRes?.count || 0,
          days,
        });
      } catch (error) {
        console.error("Error fetching room contribution stats:", error);
      }
    };
  
    fetchStats(); // Initial fetch
  
    const interval = setInterval(fetchStats, 15000); // Re-fetch every 15 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [roomid]);
  
  return (
    <div className={`mt-[30px] z-40 flex flex-col items-start gap-3`}>
      <div className="text-sm font-bold text-[#00317F] mb-2 -ml-1">
        Activity Streak
      </div>
      <div className="flex flex-col gap-3 text-center text-xs text-[#00317F] font-medium">
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.articles.toString().padStart(2, "0")}
          </div>
          <div>Articles</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.comments.toString().padStart(2, "0")}
          </div>
          <div>Comments</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.days.toString().padStart(2, "0")}
          </div>
          <div>Days Joined</div>
        </div>
      </div>
    </div>
  );
};


export default FloatingRoomContribution;
