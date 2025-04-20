import React, { useEffect, useState } from "react";
import NewsCard from "./newsCard";
import supabase from "../api/supabaseClient";

const LatestNews = ({ searchQuery = "", topic = "", displayLimit, timeFilter = "Latest" }) => {
  const [latestArticles, setLatestArticles] = useState([]);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      let query = supabase
        .from("articles")
        .select("articleid, title, imagepath, topicid, time")
        .eq("status", "Published")
        .order("time", { ascending: false })
        .limit(20);

      // 🔧 handle array or string topic
      if (Array.isArray(topic) && topic.length > 0) {
        query = query.in("topicid", topic);
      } else if (typeof topic === "string" && topic) {
        query = query.eq("topicid", topic);
      }

      // 🔍 Search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,text.ilike.%${searchQuery}%`);
      }

      // ⏱️ Time filter
      const now = new Date();
      let cutoff;

      if (timeFilter === "Today") {
        cutoff = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeFilter === "Latest") {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === "Month") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === "Year") {
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }

      if (cutoff) {
        query = query.gte("time", cutoff.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching latest articles:", error);
        return;
      }

      setLatestArticles(data);
    };

    fetchLatestArticles();
  }, [searchQuery, topic, timeFilter]);

  const articlesToDisplay = displayLimit
    ? latestArticles.slice(0, displayLimit)
    : latestArticles;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="space-y-6">
        {articlesToDisplay.map((article) => (
          <NewsCard
            key={article.articleid}
            articleid={article.articleid}
            title={article.title}
            imageUrl={article.imagepath}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
