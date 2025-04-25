import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import "../pages/article.css";
import Logo from "../assets/Logo.svg";
import Navbar from "../components/navbar.jsx";
import Rate from "../components/rateAndFlag.jsx";
import ArticleContent from "../components/articleContent.jsx";
import Comments from "../components/commentsSection.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import { Link, useParams, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";
import {
  Share2,
  Headphones,
  Flag,
  StickyNote,
  BookOpenIcon,
  X
} from "lucide-react";
import TranslateButton from "../components/translate.jsx";

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
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedText, setSelectedText] = useState("");
  const [definition, setDefinition] = useState(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState([]);

  const [isExpertArticle, setIsExpertArticle] = useState(false);


  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text) {
      setSelectedText("");
      return;
    }
    setSelectedText(text);

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setButtonPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 40,
    });
  };

  // Function to fetch word definition
  const fetchDefinition = async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setDefinition(data[0].meanings[0].definitions[0].definition);
      } else {
        setDefinition("No definition found.");
      }

      setShowDictionary(true);
    } catch (error) {
      setDefinition("Error fetching definition.");
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async () => {
    if (isSpeaking && speechRef.current) {
      speechRef.current.pause();
      setIsSpeaking(false);
      return;
    }

    if (!articleRef.current) {
      alert("No article content found.");
      return;
    }

    try {
      const text = articleRef.current.innerText;

      const response = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/translate/text-to-speech",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            targetLang: selectedLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed: " + response.status);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      speechRef.current = audio;

      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      alert("TTS not supported for selected language: " + selectedLanguage);
    }
  };

  const handleTranslate = async (targetLang) => {
    if (!articleRef.current) {
      alert("Article content not available.");
      return;
    }

    setSelectedLanguage(targetLang);
    const textToTranslate = originalText;

    try {
      const response = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToTranslate, targetLang }),
        }
      );
      if (!response.ok) {
        throw new Error("Translation failed.");
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error("Error translating article:", error);
      alert("Error translating article: " + error.message);
    }
  };

  useEffect(() => {
    if (translatedText && isSpeaking) {
      speechRef.current.pause();
      setIsSpeaking(false);
      handleTTS();
    }
  }, [translatedText]);

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechRef.current.pause();
      }
    };
  }, []);

  const handleShareClick = () => {
    const shareLink = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: document.title, url: shareLink })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => alert("Link copied to clipboard!"));
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
        Status: "Pending",
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
        target_type: "article",
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
        .select(
          `articleid, title, text, imagepath, time, view_count, 
          rating, status, userid, topicid, users (userid, username)`
        )
        .eq("title", articleName)
        .single();

      if (!error) {
        setArticleData(data);
        setOriginalText(data.text);
        
        if (data?.userid && data?.topicid) {
          const { data: match } = await supabase
            .from("expert_application")
            .select("username")
            .eq("userid", data.userid)
            .eq("topicid", data.topicid)
            .eq("status", "Approved")
            .single();
          setIsExpertArticle(!!match);
        }
        


        const { data: noteData } = await supabase
          .from("community_notes")
          .select("*")
          .eq("target_id", data.articleid)
          .eq("Status", "Approved");

        setNotes(noteData || []);

        if (data?.articleid) {
          const { data: currentView } = await supabase
            .from("articles")
            .select("view_count")
            .eq("articleid", data.articleid)
            .single();

          const updatedCount = (currentView?.view_count || 0) + 1;
          await supabase
            .from("articles")
            .update({ view_count: updatedCount })
            .eq("articleid", data.articleid);

          if (user) {
            await supabase.from("reading_history").insert([
              {
                articleid: data.articleid,
                userid: user.userid,
                read_date: new Date().toISOString(),
              },
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from("reading_history")
          .select("*")
          .eq("userid", user.userid)
          .gte("read_date", today.toISOString());
        setReadArticlesCount(data?.length || 0);
      } else {
        const today = new Date().toISOString().split("T")[0];
        const guestData = JSON.parse(
          localStorage.getItem("guestViewLog") || "{}"
        );
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

    const isGuest = !user;
    const isFreeUser = user && userType === "Free";

    if (
      (isFreeUser && readArticlesCount > 10) ||
      (isGuest && readArticlesCount > 3)
    ) {
      setShowPaywall(true);
    }
  }, [user, userType, articleData, readArticlesCount]);

  const authorName = articleData?.users?.username ?? "Unknown Author";

  return (
    <div
      className="min-h-screen w-screen flex flex-col bg-white"
      onMouseUp={handleTextSelection}
    >
      <Navbar />
      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-6 mx-auto max-w-[750px]">
        {articleData && !showPaywall ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 text-left w-full">
              {articleData.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 mb-3 w-full gap-2">
              <Link
                to={`/public-profile/${encodeURIComponent(authorName)}`}
                className="underline hover:text-blue-600"
              >
                {authorName}
              </Link>
              {isExpertArticle && (
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-xl">
                  Expert
                </span>
              )}
              <span className="mx-2">•</span>
              <span>
                Published on {new Date(articleData.time).toLocaleDateString()}
              </span>
            </div>


            <div className="flex justify-between items-center w-full mb-4">
              <Rate articleId={articleData.articleid} />
              <div className="flex items-center gap-3">
                {userType === "Premium" && (
                  <button
                    onClick={() => setShowNote(true)}
                    title="Add Community Note"
                    className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                  >
                    <StickyNote className="h-5 w-5 text-black" />
                  </button>
                )}
                <button
                  onClick={() =>
                    setReportTarget({
                      id: articleData.articleid,
                      type: "article",
                    })
                  }
                  title="Report Article"
                  className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <Flag className="h-5 w-5 text-red-600" />
                </button>
                {userType === "Premium" && (
                  <button
                    onClick={handleTTS}
                    title="Text-to-Speech"
                    className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                  >
                    <Headphones className="h-5 w-5 text-black" />
                  </button>
                )}
                {userType === "Premium" && (
                  <TranslateButton
                    onLanguageSelect={handleTranslate}
                    className="h-5 w-5 text-black"
                  />
                )}
                <button
                  onClick={handleShareClick}
                  title="Share"
                  className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>

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
              text={translatedText || originalText}
              imagepath={articleData.imagepath}
              postDate={new Date(articleData.time).toLocaleDateString()}
              author={{
                userid: articleData.users?.userid,
                username: articleData.users?.username || "Unknown Author",
              }}
            />
            {notes.length > 0 && (
              <div className="border border-yellow-400 bg-yellow-50 rounded-lg p-4 mt-4 w-full">
                <h3 className="text-sm font-semibold text-yellow-700 mb-1">
                  ⚠️ Community Notes:
                </h3>
                <ul className="list-disc list-inside text-sm text-yellow-800">
                  {notes.map((n, i) => (
                    <li key={i}>{n.note}</li>
                  ))}
                </ul>
              </div>
            )}
            <Comments
              articleRef={articleRef}
              articleId={articleData.articleid}
            />
            {selectedText && userType === "Premium" && (
              <button
                ref={buttonRef}
                onClick={fetchDefinition}
                className="absolute bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center space-x-2 shadow-md"
                style={{
                  left: `${buttonPosition.x}px`,
                  top: `${buttonPosition.y}px`,
                  position: "absolute",
                  zIndex: 50,
                }}
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>{loading ? "Loading…" : `Define "{selectedText}"`}</span>
              </button>
            )}

            {/* Dictionary Popup Modal */}
            {showDictionary && (
              <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-md text-center">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-blue-700">
                      Dictionary
                    </h2>
                    <button onClick={() => setShowDictionary(false)}>
                      <X className="h-6 w-6 text-gray-600 hover:text-black" />
                    </button>
                  </div>
                  <p className="text-lg mt-2">
                    <strong>{selectedText}:</strong>{" "}
                    {loading ? "Loading..." : definition}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : showPaywall ? (
          <div className="paywall-modal">
            <div className="modal-content">
              <img src={Logo} alt="NewsNexus Logo" className="mx-auto mb-4" />
              <h2>Want to Keep Reading?</h2>
              <p>
                {!user
                  ? "You’ve reached your daily limit of 3 free articles. Sign up or subscribe to continue reading!"
                  : "You’ve reached your daily limit of 10 articles. Subscribe for unlimited access!"}
              </p>
              <button
                className="subscribe-button"
                onClick={() => navigate("/subscription")}
              >
                Subscribe
              </button>
              <p>
                Already a Subscriber?{" "}
                <a href="/login" className="sign-in-link">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        ) : (
          <p>Loading article...</p>
        )}

        {/* Report Modal */}
        {reportTarget && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4">Report Article</h2>
              <div className="space-y-2">
                {[
                  "Misinformation",
                  "Hate Speech",
                  "Spam or Promotional",
                  "Plagiarism",
                  "Other",
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    {reason}
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setReportTarget(null)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Community Note Modal */}
        {showNote && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Submit a Community Note
              </h2>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                rows={4}
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowNote(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNote}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Submit Note
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Article;
