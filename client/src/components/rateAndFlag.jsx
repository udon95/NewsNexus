import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import useAuthHook from "../hooks/useAuth";
import supabase from "../api/supabaseClient";

const RateAndFlag = ({ articleId }) => {
  const { user } = useAuthHook();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [votesCount, setVotesCount] = useState(0);

  useEffect(() => {
    if (!user || !articleId) return;

    const fetchVotes = async () => {
      const { data: userVote, error: userVoteError } = await supabase
        .from("ratings")
        .select("vote_type")
        .eq("articleid", articleId)
        .eq("userid", user.userid);

      if (userVoteError) console.error("Error fetching user vote:", userVoteError);
      else {
        setUpvoted(userVote.some((v) => v.vote_type === "upvote"));
        setDownvoted(userVote.some((v) => v.vote_type === "downvote"));
      }

      const { data: allVotes, error: allVotesError } = await supabase
        .from("ratings")
        .select("vote_type")
        .eq("articleid", articleId);

      if (allVotesError) console.error("Error fetching vote count:", allVotesError);
      else {
        const upvotes = allVotes.filter((v) => v.vote_type === "upvote").length;
        setVotesCount(upvotes);

        await supabase
          .from("articles")
          .update({ total_votes: upvotes })
          .eq("articleid", articleId);
      }
    };

    fetchVotes();
  }, [articleId, user]);

  const handleUpvote = async () => {
    if (!user || !articleId) return;

    if (upvoted) {
      await supabase
        .from("ratings")
        .delete()
        .eq("articleid", articleId)
        .eq("userid", user.userid);
      setUpvoted(false);
    } else {
      await supabase.from("ratings").upsert([
        {
          articleid: articleId,
          userid: user.userid,
          vote_type: "upvote",
        },
      ]);
      setUpvoted(true);
      setDownvoted(false);
    }

    const { data: updatedVotes } = await supabase
      .from("ratings")
      .select("vote_type")
      .eq("articleid", articleId);

    const upvotes = updatedVotes.filter((v) => v.vote_type === "upvote").length;
    setVotesCount(upvotes);

    await supabase
      .from("articles")
      .update({ total_votes: upvotes })
      .eq("articleid", articleId);
  };

  const handleDownvote = async () => {
    if (!user || !articleId) return;

    if (downvoted) {
      await supabase
        .from("ratings")
        .delete()
        .eq("articleid", articleId)
        .eq("userid", user.userid);
      setDownvoted(false);
    } else {
      await supabase.from("ratings").upsert([
        {
          articleid: articleId,
          userid: user.userid,
          vote_type: "downvote",
        },
      ]);
      setDownvoted(true);
      setUpvoted(false);
    }

    const { data: updatedVotes } = await supabase
      .from("ratings")
      .select("vote_type")
      .eq("articleid", articleId);

    const upvotes = updatedVotes.filter((v) => v.vote_type === "upvote").length;
    setVotesCount(upvotes);

    await supabase
      .from("articles")
      .update({ total_votes: upvotes })
      .eq("articleid", articleId);
  };

  return (
    <div className="w-full flex justify-start">
      <div className="flex items-center space-x-4 p-2 bg-gray-200 rounded-lg">
        <span className="text-black text-sm font-semibold">{votesCount} liked this</span>
        <button
          className={`transition-colors flex items-center space-x-2 ${
            upvoted ? "text-green-500" : "text-gray-500"
          } hover:text-green-500`}
          onClick={handleUpvote}
        >
          <ThumbsUp size={24} />
        </button>
        <button
          className={`transition-colors ${
            downvoted ? "text-red-500" : "text-gray-500"
          } hover:text-red-500`}
          onClick={handleDownvote}
        >
          <ThumbsDown size={24} />
        </button>
      </div>
    </div>
  );
};

export default RateAndFlag;
