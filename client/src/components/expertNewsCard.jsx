import React, { useEffect, useState } from "react";
import NewsCard from "./newsCard";
import supabase from "../api/supabaseClient";

const ExpertNewsCard = ({ searchQuery = "", topic = "", disableNavigation }) => {
  const [expertArticles, setExpertArticles] = useState([]);

  useEffect(() => {
    const fetchExpertArticles = async () => {
      let articleQuery = supabase
        .from("articles")
        .select("articleid, title, imagepath, topicid, userid, time, status")
        .eq("status", "Published")
        .order("time", { ascending: false });

      // Search filter
      if (searchQuery.trim()) {
        articleQuery = articleQuery.or(`title.ilike.%${searchQuery}%,text.ilike.%${searchQuery}%`);
      }

      // Topic filter
      if (Array.isArray(topic) && topic.length > 0) {
        articleQuery = articleQuery.in("topicid", topic);
      } else if (typeof topic === "string" && topic) {
        articleQuery = articleQuery.eq("topicid", topic);
      }

      const { data: articles, error: articleError } = await articleQuery;

      if (articleError) {
        console.error("Error fetching articles:", articleError);
        return;
      }

      // Fetch expert applications
      const { data: expertApps, error: expertError } = await supabase
        .from("expert_application")
        .select("userid, topicid")
        .eq("status", "Approved");

      if (expertError) {
        console.error("Error fetching expert applications:", expertError);
        return;
      }

      // Filter to only expert-written articles
      const expertWrittenArticles = articles.filter((article) =>
        expertApps.some(
          (ea) => ea.userid === article.userid && ea.topicid === article.topicid
        )
      );

      setExpertArticles(expertWrittenArticles);
    };

    fetchExpertArticles();
  }, [searchQuery, topic]);

  return (
    <div className="w-full max-w-[900px] mx-auto space-y-6 font-grotesk">
      {expertArticles.map((article) => (
        <div key={article.articleid} className="relative">
          <div
            className="relative cursor-pointer"
            onClickCapture={(e) => {
              if (disableNavigation) {
                e.preventDefault();
                e.stopPropagation();
                alert("You need to subscribe as Premium to access Expert articles!");
              }
            }}
          >
            <NewsCard
              title={article.title}
              imageUrl={article.imagepath}
              articleid={article.articleid}
            />
            <span className="absolute top-3 right-12 bg-[#BFD8FF] text-blue-900 text-xs font-bold px-3 py-1 rounded-md shadow-md">
              Expert
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpertNewsCard;
