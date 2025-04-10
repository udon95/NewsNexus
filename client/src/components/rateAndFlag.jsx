import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, FlagIcon, StickyNote } from "lucide-react";
import useAuthHook from "../hooks/useAuth";
import supabase from "../api/supabaseClient";

const RateAndFlag = ({ articleId }) => {
  const { userType, user } = useAuthHook();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [communityNote, setCommunityNote] = useState("");
  const [showCommunityNote, setShowCommunityNote] = useState(false);

  // ✅ Fetch current vote status and total votes
  useEffect(() => {
    if (!user || !articleId) return;

    const fetchVotes = async () => {
      // Fetch user-specific vote
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

      // Fetch all upvotes to display total
      const { data: allVotes, error: allVotesError } = await supabase
        .from("ratings")
        .select("vote_type")
        .eq("articleid", articleId);

      if (allVotesError) console.error("Error fetching vote count:", allVotesError);
      else {
        const upvotes = allVotes.filter((v) => v.vote_type === "upvote").length;
        setVotesCount(upvotes);

        // ✅ Update total_votes in articles table
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
      // Remove vote
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

    // Refresh vote count and update article
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

  const handleReportSubmit = async () => {
    if (selectedReason && reportTarget) {
      const { error } = await supabase.from("reports").insert([
        {
          target_id: reportTarget.id,
          target_type: reportTarget.type,
          reason: selectedReason,
          userid: user?.userid,
          username: user?.username,
          created_at: new Date().toISOString(),
          resolved: false,
          resolution: null,
        },
      ]);

      if (error) {
        console.error("Error submitting report:", error);
      } else {
        alert("Report submitted.");
        setReportTarget(null);
        setSelectedReason("");
      }
    }
  };

  const handleCommunityNoteSubmit = async () => {
    if (communityNote.trim() !== "") {
      const { error } = await supabase.from("community_notes").insert([
        {
          target_id: articleId,
          target_type: "article",
          note: communityNote,
          userid: user?.userid,
          username: user?.username,
          created_at: new Date().toISOString(),
          Status: "pending",
        },
      ]);

      if (error) {
        console.error("Error submitting community note:", error);
      } else {
        setCommunityNote("");
        setShowCommunityNote(false);
        alert("Community Note added.");
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 mx-auto max-w-4xl font-grotesk">
      <div className="flex items-center justify-end border-none mb-0 mt-0 space-x-4">
        {/* 👍 Upvote */}
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
          {/* 👎 Downvote */}
          <button
            className={`transition-colors ${
              downvoted ? "text-red-500" : "text-gray-500"
            } hover:text-red-500`}
            onClick={handleDownvote}
          >
            <ThumbsDown size={24} />
          </button>
        </div>

        {/* 📝 Community Notes */}
        {userType === "Premium" && (
          <button
            className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
            title="Add Community Notes"
            onClick={() => setShowCommunityNote(true)}
          >
            <StickyNote className="h-6 w-6 text-black" />
          </button>
        )}

        {/* 🚩 Report */}
        <button
          className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center -ml-2"
          title="Report Article"
          onClick={() => setReportTarget({ id: articleId, type: "article" })}
        >
          <FlagIcon className="h-6 w-6 text-red-600" />
        </button>
      </div>

      {/* 🚩 Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
              onClick={() => {
                setReportTarget(null);
                setSelectedReason("");
              }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">Report</h2>
            <p className="text-gray-600 text-sm mb-4">
              What's going on? We'll review against all community guidelines.
            </p>

            {[
              "Sexual content",
              "Violent or repulsive content",
              "Hateful or abusive content",
              "Harassment or bullying",
              "Harmful or dangerous acts",
              "Misinformation",
            ].map((reason) => (
              <label key={reason} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="radio"
                  className="mr-3 accent-blue-600"
                  name="report-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                />
                {reason}
              </label>
            ))}

            <button
              disabled={!selectedReason}
              className={`mt-4 w-full py-2 rounded font-semibold ${
                selectedReason
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleReportSubmit}
            >
              Report
            </button>
          </div>
        </div>
      )}

      {/* 📌 Community Note Modal */}
      {showCommunityNote && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowCommunityNote(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">Add Community Note</h2>
            <textarea
              className="w-full p-3 rounded-md border border-gray-300 mb-4"
              placeholder="Enter your community note..."
              value={communityNote}
              onChange={(e) => setCommunityNote(e.target.value)}
            />
            <button
              disabled={!communityNote.trim()}
              className={`w-full py-2 rounded font-semibold ${
                communityNote.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleCommunityNoteSubmit}
            >
              Submit Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateAndFlag;