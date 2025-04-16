import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const ArticlesRank = ({ searchQuery = "", topic = "", selectedTime = "week" }) => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRankedArticles = async () => {
      let query = supabase
        .from("articles")
        .select("articleid, title, imagepath, total_votes, view_count, topicid, status, text, time")
        .eq("status", "Published");

      // Topic filtering
      if (Array.isArray(topic) && topic.length > 0) {
        query = query.in("topicid", topic);
      } else if (typeof topic === "string" && topic) {
        query = query.eq("topicid", topic);
      }

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,text.ilike.%${searchQuery}%`);
      }

      // Time filter
      const now = new Date();
      let cutoff;

      if (selectedTime === "Today") {
        cutoff = new Date(now.setHours(0, 0, 0, 0));
      } else if (selectedTime === "Week") {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (selectedTime === "Month") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (selectedTime === "Year") {
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }

      if (cutoff) {
        query = query.gte("time", cutoff.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching ranked articles:", error);
        return;
      }

      const ranked = data
        .map((article) => ({
          ...article,
          ranking_score:
            article.view_count > 0 ? article.total_votes / article.view_count : 0,
        }))
        .sort((a, b) => b.ranking_score - a.ranking_score)
        .slice(0, 3);

      setArticles(ranked);
    };

    fetchRankedArticles();
  }, [searchQuery, topic, selectedTime]);

  const handleCardClick = (title) => {
    navigate(`/article/${encodeURIComponent(title)}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-[900px] w-full">
      {articles.map((article, index) => (
        <div
          key={article.articleid}
          onClick={() => handleCardClick(article.title)}
          className="w-full h-60 border border-black rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition bg-white flex flex-col"
        >
          <div className="w-full h-48 bg-gray-200 rounded-t-2xl overflow-hidden relative">
            {article.imagepath ? (
              <img
                src={article.imagepath}
                alt={article.title}
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
          <p className="text-left text-black font-medium px-4 py-2 line-clamp-2">
            {article.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ArticlesRank;
