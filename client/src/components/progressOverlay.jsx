import { useEffect, useState } from "react";
import { User, MessageSquare, FileText } from "lucide-react";
import supabase from "../api/supabaseClient";

const ProgressOverlay = () => {
  const [userCount, setUserCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);

useEffect(() => {
    const fetchUserCount = async () => {
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true });
      setUserCount(count || 0);
    };
  
    const fetchRoomCount = async () => {
      const { count } = await supabase.from("rooms").select("*", { count: "exact", head: true });
      setRoomCount(count || 0);
    };
  
    const fetchArticleCount = async () => {
      const { count } = await supabase.from("articles").select("*", { count: "exact", head: true });
      setArticleCount(count || 0);
    };
  
    // Initial fetch
    fetchUserCount();
    fetchRoomCount();
    fetchArticleCount();
  
    // Realtime subscriptions
    const userSub = supabase
      .channel("users-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchUserCount()
      )
      .subscribe();
  
    const roomSub = supabase
      .channel("rooms-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => fetchRoomCount()
      )
      .subscribe();
  
    const articleSub = supabase
      .channel("articles-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => fetchArticleCount()
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(userSub);
      supabase.removeChannel(roomSub);
      supabase.removeChannel(articleSub);
    };
  }, []);
  
  const statStyle = "flex flex-col items-center text-white gap-1 scale-105";
  const iconStyle = "text-white opacity-90 mb-1";

  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-12 sm:gap-24 justify-center items-center">
      <div className={statStyle}>
        <User size={36} className={iconStyle} />
        <span className="text-4xl font-bold">{userCount}</span>
        <span className="text-base tracking-wide text-center whitespace-nowrap">
            Registered Users
        </span>
      </div>
      <div className={statStyle}>
        <MessageSquare size={36} className={iconStyle} />
        <span className="text-4xl font-bold">{roomCount}</span>
        <span className="text-base tracking-wide text-center whitespace-nowrap">
            Room Communities
        </span>      
      </div>
      <div className={statStyle}>
        <FileText size={36} className={iconStyle} />
        <span className="text-4xl font-bold">{articleCount}</span>
        <span className="text-base tracking-wide text-center whitespace-nowrap">
            Articles Published
        </span>      
      </div>
    </div>
  );
};

export default ProgressOverlay;
