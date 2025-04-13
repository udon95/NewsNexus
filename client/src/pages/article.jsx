import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import "../pages/article.css";
import Logo from "../assets/Logo.svg";
import Navbar from "../components/navbar.jsx";
import Rate from "../components/rateAndFlag.jsx";
import ArticleContent from "../components/articleContent.jsx";
import Comments from "../components/commentsSection.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";
import { Share2, Headphones, Flag, StickyNote } from "lucide-react";

const Article = () => {
  const articleRef = useRef(null);
  const { userType, user } = useAuthHook();
  const { articleName } = useParams();
  const navigate = useNavigate();

  const [articleData, setArticleData] = useState(null);
  const [readArticlesCount, setReadArticlesCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  // 🧠 Community Notes
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // 🚩 Report
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  const handleTTS = () => {
    if (!articleRef.current) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = articleRef.current.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleShareClick = () => {
    const shareLink = window.location.href;
    if (navigator.share) {
      navigator.share({ title: document.title, url: shareLink }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareLink).then(() => alert("Link copied to clipboard!"));
    }
  };

  const handleSubmitNote = async () => {
    if (!noteText.trim()) return;
    const { error } = await supabase.from("community_notes").insert([
      {
        target_id: articleData.articleid,
        target_type: "article",
        note: noteText,
        userid: user?.userid,
        username: user?.username,
        created_at: new Date().toISOString(),
        Status: "pending",
      },
    ]);
    if (!error) {
      setShowNote(false);
      setNoteText("");
      alert("Community Note submitted.");
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReason || !reportTarget) return;
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
    if (!error) {
      setReportTarget(null);
      setSelectedReason("");
      alert("Report submitted.");
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`articleid, title, text, imagepath, time, view_count, rating, status, userid, users (userid, username)`)
        .eq("title", articleName)
        .single();

      if (!error) {
        setArticleData(data);

        if (data?.articleid) {
          const { data: currentView } = await supabase
            .from("articles")
            .select("view_count")
            .eq("articleid", data.articleid)
            .single();

          const updatedCount = (currentView?.view_count || 0) + 1;
          await supabase.from("articles").update({ view_count: updatedCount }).eq("articleid", data.articleid);

          if (user) {
            await supabase.from("reading_history").insert([
              { articleid: data.articleid, userid: user.userid, read_date: new Date().toISOString() },
            ]);
          }
        }
      }
    };
    fetchArticle();
  }, [articleName, user]);

  useEffect(() => {
    const fetchReadingHistory = async () => {
      if (user) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from("reading_history")
          .select("*")
          .eq("userid", user.userid)
          .gte("read_date", today.toISOString());
        setReadArticlesCount(data?.length || 0);
      } else {
        const today = new Date().toISOString().split("T")[0];
        const guestData = JSON.parse(localStorage.getItem("guestViewLog") || "{}");
        if (guestData.date !== today) {
          guestData.date = today;
          guestData.count = 0;
        }
        guestData.count = (guestData.count || 0) + 1;
        localStorage.setItem("guestViewLog", JSON.stringify(guestData));
        setReadArticlesCount(guestData.count);
      }
    };
    fetchReadingHistory();
  }, [user]);

  useEffect(() => {
    if (!articleData) return;
    if (user?.userType === "Free" && readArticlesCount > 10) setShowPaywall(true);
    if (!user && readArticlesCount > 3) setShowPaywall(true);
  }, [user, userType, articleData, readArticlesCount]);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-6 mx-auto max-w-[750px]">
        {articleData ? (
          <>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 text-left w-full">
              {articleData.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center text-sm text-gray-600 mb-3 w-full">
              <span className="font-semibold text-black">
                {articleData.users?.username || "Unknown Author"}
              </span>
              <span className="mx-2">•</span>
              <span>Published on {new Date(articleData.time).toLocaleDateString()}</span>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center w-full mb-4">
              <Rate articleId={articleData.articleid} />
              <div className="flex items-center gap-3">
                {/* Community Note */}
                {userType === "Premium" && (
                  <button
                    onClick={() => setShowNote(true)}
                    title="Add Community Note"
                    className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                  >
                    <StickyNote className="h-5 w-5 text-black" />
                  </button>
                )}

                {/* Report */}
                <button
                  onClick={() => setReportTarget({ id: articleData.articleid, type: "article" })}
                  title="Report Article"
                  className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <Flag className="h-5 w-5 text-red-600" />
                </button>

                {/* TTS */}
                {userType === "Premium" && (
                  <button
                    onClick={handleTTS}
                    title="Text-to-Speech"
                    className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                  >
                    <Headphones className="h-5 w-5 text-black" />
                  </button>
                )}

                {/* Share */}
                <button
                  onClick={handleShareClick}
                  title="Share"
                  className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>

            {/* Image */}
            {articleData.imagepath && (
              <img
                src={articleData.imagepath}
                alt="Article"
                className="w-full rounded-xl mb-6 max-h-[450px] object-cover"
              />
            )}

            <ArticleContent
              articleRef={articleRef}
              title={articleData.title}
              text={articleData.text}
              imagepath={articleData.imagepath}
              postDate={new Date(articleData.time).toLocaleDateString()}
              author={{
                userid: articleData.users?.userid,
                username: articleData.users?.username || "Unknown Author",
              }}
            />
            <Comments articleRef={articleRef} articleId={articleData.articleid} />
          </>
        ) : (
          <p>Loading article...</p>
        )}

        {/* Community Note Modal */}
        {showNote && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
              <button
                onClick={() => setShowNote(false)}
                className="absolute top-3 right-4 text-xl text-gray-600 hover:text-black"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">Add Community Note</h2>
              <textarea
                className="w-full p-3 rounded-md border border-gray-300 mb-4"
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button
                onClick={handleSubmitNote}
                disabled={!noteText.trim()}
                className={`w-full py-2 rounded font-semibold ${
                  noteText.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Note
              </button>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportTarget && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
              <button
                onClick={() => {
                  setReportTarget(null);
                  setSelectedReason("");
                }}
                className="absolute top-3 right-4 text-xl text-gray-600 hover:text-black"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">Report Article</h2>
              <p className="text-sm text-gray-600 mb-4">Choose a reason:</p>
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
                    name="report-reason"
                    className="mr-3 accent-blue-600"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  {reason}
                </label>
              ))}
              <button
                onClick={handleSubmitReport}
                disabled={!selectedReason}
                className={`mt-4 w-full py-2 rounded font-semibold ${
                  selectedReason
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Report
              </button>
            </div>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div className="paywall-modal">
            <div className="modal-content">
              <img src={Logo} alt="NewsNexus Logo" className="mx-auto mb-4" />
              <h2>Want to Keep Reading?</h2>
              <p>
                {!user
                  ? "You’ve reached your daily limit of 3 free articles. Sign up or subscribe to continue reading!"
                  : "You’ve reached your daily limit of 10 articles. Subscribe for unlimited access!"}
              </p>
              <button className="subscribe-button" onClick={() => navigate("/subscription")}>
                Subscribe
              </button>
              <p>
                Already a Subscriber?{" "}
                <a href="/login" className="sign-in-link">Sign In</a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Article;
