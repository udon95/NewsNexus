import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import supabase from "../api/supabaseClient";

const NewsCard = ({ articleid, title, imageUrl }) => {
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!articleid) return;

      const { data, error } = await supabase
        .from("ratings")
        .select("vote_type")
        .eq("articleid", articleid);

      if (error) {
        console.error("Error fetching votes:", error);
        return;
      }

      const ups = data.filter((v) => v.vote_type === "upvote").length;
      const downs = data.filter((v) => v.vote_type === "downvote").length;
      setUpvotes(ups);
      setDownvotes(downs);
    };

    fetchVotes();
  }, [articleid]);

  const formatCount = (count) => {
    if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
    return count.toString();
  };

  const handleCardClick = () => {
    navigate(`/article/${encodeURIComponent(title)}`);
  };

  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden w-full max-w-[900px] mx-auto cursor-pointer hover:shadow-xl transition"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative w-full h-[200px]">
        <img
          src={imageUrl || "test.png"}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Votes Box */}
        <div className="absolute top-2 left-2 bg-gray-200 p-2 rounded-lg flex flex-col items-center shadow-md">
          <ThumbsUp size={20} className="text-green-500" />
          <span className="text-xs font-semibold text-black">
            {formatCount(upvotes)}
          </span>

          <div className="mt-3.5"></div>

          <ThumbsDown size={20} className="text-red-500 mt-1" />
          <span className="text-xs font-semibold text-black">
            {formatCount(downvotes)}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 py-3 border-t bg-gray-100">
        <p className="font-semibold text-black line-clamp-2">{title}</p>
      </div>
    </div>
  );
};

export default NewsCard;
