import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";

// const FloatingUserStats = ({ user }) => {
const FloatingUserStats = ({ user, customClassName }) => {
  const [stats, setStats] = useState({
    articles: 0,
    drafts: 0,
    comments: 0,
    reads: 0,
  });
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      const userId = storedUser?.user?.userid;
      const userTypeFromStorage = storedUser?.role || "Guest";
      setUserType(userTypeFromStorage);
      if (!userId) return;

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const iso = firstDayOfMonth.toISOString();

      try {
        const [articlesRes, draftsRes, commentsRes, readsRes] =
          await Promise.all([
            supabase
              .from("articles")
              .select("*", { count: "exact", head: true })
              .eq("userid", userId)
              .eq("status", "Published")
              .gte("time", iso),

            supabase
              .from("articles")
              .select("*", { count: "exact", head: true })
              .eq("userid", userId)
              .eq("status", "Draft")
              .gte("time", iso),

            supabase
              .from("article_comments")
              .select("*", { count: "exact", head: true })
              .eq("userid", userId)
              .gte("created_at", iso),

            userTypeFromStorage === "Free"
              ? supabase
                  .from("reading_history")
                  .select("*", { count: "exact", head: true })
                  .eq("userid", userId)
                  .gte(
                    "read_date",
                    `${new Date().toISOString().split("T")[0]}T00:00:00Z`
                  )
                  .lte(
                    "read_date",
                    `${new Date().toISOString().split("T")[0]}T23:59:59Z`
                  )
              : supabase
                  .from("reading_history")
                  .select("*", { count: "exact", head: true })
                  .eq("userid", userId)
                  .gte("read_date", iso),
          ]);

        setStats({
          articles: articlesRes?.count || 0,
          drafts: draftsRes?.count || 0,
          comments: commentsRes?.count || 0,
          reads: readsRes?.count || 0,
        });
      } catch (err) {
        console.error("Supabase fetch error:", err.message);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    // <div className="absolute top-[498px] left-20 z-40 flex flex-col items-start gap-3">
    <div
      className={`z-100 mt-[35px] flex flex-col items-start gap-3 ${
        customClassName || "top-[498px] left-20"
      }`}
    >
      <div className="text-sm font-bold text-[#00317F] mb-2 -ml-1">
        {new Date().toLocaleString("default", { month: "long" })}'s Streak
      </div>

      <div className="flex flex-col gap-3 text-center text-xs text-[#00317F] font-medium">
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.articles.toString().padStart(2, "0")}
          </div>
          <div>Published</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.drafts.toString().padStart(2, "0")}
          </div>
          <div>Drafts</div>
        </div>
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.comments.toString().padStart(2, "0")}
          </div>
          <div>Comments</div>
        </div>
        {/* <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-3xl font-bold mb-1">
            {stats.reads.toString().padStart(2, '0')}
          </div>
          <div>Reads</div>
        </div> */}
        <div>
          <div className="bg-[#CDE0FF] w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-xl font-bold mb-1">
            {/* {userType === "Free" ? (
      <>
        <div className="text-center leading-tight">
          <div className="text-3xl">{stats.reads} / 10</div>
          <div className="text-[10px] font-medium">Today's Reads</div>
        </div>
      </>
    ) : (
      <div className="text-3xl">{stats.reads.toString().padStart(2, '0')}</div>
    )} */}
            {userType === "Free" ? (
              <div className="text-3xl sm:text-2xl font-extrabold text-[#00317F] text-center">
                {stats.reads} / 10
              </div>
            ) : (
              <div className="text-3xl font-bold text-[#00317F]">
                {stats.reads.toString().padStart(2, "0")}
              </div>
            )}
          </div>
          <div>{userType === "Free" ? "Reads Today" : "Reads"}</div>
        </div>
      </div>
    </div>
  );
};

export default FloatingUserStats;
