import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import useAuthHook from "../hooks/useAuth";
import supabase from "../api/supabaseClient";

const RateAndFlag = ({ articleId }) => {
  const { user } = useAuthHook();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

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
        const upvoteCount = allVotes.filter((v) => v.vote_type === "upvote").length;
        const downvoteCount = allVotes.filter((v) => v.vote_type === "downvote").length;
        setUpvotes(upvoteCount);
        setDownvotes(downvoteCount);

        await supabase
          .from("articles")
          .update({ total_votes: upvoteCount + downvoteCount })
          .eq("articleid", articleId);
      }
    };

    fetchVotes();
  }, [articleId, user]);

  const refreshVotes = async () => {
    const { data: updatedVotes } = await supabase
      .from("ratings")
      .select("vote_type")
      .eq("articleid", articleId);

    const upvoteCount = updatedVotes.filter((v) => v.vote_type === "upvote").length;
    const downvoteCount = updatedVotes.filter((v) => v.vote_type === "downvote").length;
    setUpvotes(upvoteCount);
    setDownvotes(downvoteCount);

    await supabase
      .from("articles")
      .update({ total_votes: upvoteCount + downvoteCount })
      .eq("articleid", articleId);
  };

  const handleUpvote = async () => {
    if (!user || !articleId) return;

    await supabase
      .from("ratings")
      .delete()
      .eq("articleid", articleId)
      .eq("userid", user.userid);

    if (!upvoted) {
      await supabase.from("ratings").insert([
        {
          articleid: articleId,
          userid: user.userid,
          vote_type: "upvote",
        },
      ]);
      setUpvoted(true);
      setDownvoted(false);
    } else {
      setUpvoted(false);
    }

    await refreshVotes();
  };

  const handleDownvote = async () => {
    if (!user || !articleId) return;

    await supabase
      .from("ratings")
      .delete()
      .eq("articleid", articleId)
      .eq("userid", user.userid);

    if (!downvoted) {
      await supabase.from("ratings").insert([
        {
          articleid: articleId,
          userid: user.userid,
          vote_type: "downvote",
        },
      ]);
      setDownvoted(true);
      setUpvoted(false);
    } else {
      setDownvoted(false);
    }

    await refreshVotes();
  };

  return (
    <div className="w-full flex justify-start">
      <div className="flex items-center space-x-4 p-2 bg-gray-200 rounded-lg">
        <button
          className={`flex items-center space-x-1 ${
            upvoted ? "text-green-600" : "text-gray-500"
          } hover:text-green-600`}
          onClick={handleUpvote}
        >
          <ThumbsUp size={20} />
          <span className="text-sm font-medium">{upvotes}</span>
        </button>

        <button
          className={`flex items-center space-x-1 ${
            downvoted ? "text-red-600" : "text-gray-500"
          } hover:text-red-600`}
          onClick={handleDownvote}
        >
          <ThumbsDown size={20} />
          <span className="text-sm font-medium">{downvotes}</span>
        </button>
      </div>
    </div>
  );
};

export default RateAndFlag;
