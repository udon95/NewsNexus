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
import { BookOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Article = () => {
  const articleRef = useRef(null);
  const { userType, user } = useAuthHook();
  const { articleName } = useParams();
  const navigate = useNavigate();

  const [articleData, setArticleData] = useState(null);
  const [readArticlesCount, setReadArticlesCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  //  Dictionary states
  const [selectedText, setSelectedText] = useState("");
  const [definition, setDefinition] = useState(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          articleid,
          title,
          text,
          imagepath,
          time,
          view_count,
          userid,
          users (userid, username)
        `)
        .eq("title", articleName)
        .single();

      if (error) {
        console.error("Error fetching article:", error.message);
        return;
      }

      setArticleData(data);

      if (data?.articleid) {
        const { data: currentView, error: viewErr } = await supabase
          .from("articles")
          .select("view_count")
          .eq("articleid", data.articleid)
          .single();

        if (!viewErr && currentView) {
          const updatedCount = (currentView.view_count || 0) + 1;
          await supabase
            .from("articles")
            .update({ view_count: updatedCount })
            .eq("articleid", data.articleid);
        }
      }

      if (user && data?.articleid) {
        await supabase.from("reading_history").insert([
          {
            articleid: data.articleid,
            userid: user.userid,
            read_date: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchArticle();
  }, [articleName, user]);

  useEffect(() => {
    const fetchReadingHistory = async () => {
      if (user) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from("reading_history")
          .select("*")
          .eq("userid", user.userid)
          .gte("read_date", startOfToday.toISOString());

        if (error) {
          console.error("Error fetching reading history:", error);
        } else {
          setReadArticlesCount(data.length);
        }
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

    if (user && userType !== null) {
      if (userType === "Free" && readArticlesCount > 10) {
        setShowPaywall(true);
      } else {
        setShowPaywall(false);
      }
    }

    if (!user && userType === null && readArticlesCount > 3) {
      setShowPaywall(true);
    }
  }, [user, userType, articleData, readArticlesCount]);

  // 📘 Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text) {
      setSelectedText(text);
      const range = selection.getRangeAt(0).getBoundingClientRect();
      setButtonPosition({
        x: range.left + window.scrollX,
        y: range.top + window.scrollY - 40,
      });
    } else {
      setSelectedText("");
    }
  };

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

  return (
    <div
      className="min-h-screen w-screen flex flex-col bg-white"
      onMouseUp={handleTextSelection}
    >
      <Navbar />
      <div className="flex flex-col items-right w-full px-4 sm:px-8 py-4 mx-auto max-w-screen-lg">
        <Rate articleId={articleData?.articleid} />
      </div>

      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-10 mx-auto max-w-screen-lg">
        {articleData ? (
          <>
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

        {/* 📘 Dictionary floating button (Premium only) */}
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
            <span>Define "{selectedText}"</span>
          </button>
        )}

        {/* 📘 Dictionary modal */}
        {showDictionary && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-md text-center">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-700">Dictionary</h2>
                <button onClick={() => setShowDictionary(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-black" />
                </button>
              </div>
              <p className="text-lg mt-2">
                <strong>{selectedText}:</strong>{" "}
                {loading ? "Loading..." : definition}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Paywall */}
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
              <p>
                <button
                  className="subscribe-button"
                  onClick={() => navigate("/subscription")}
                >
                  Subscribe
                </button>
              </p>
              <p>
                Already a Subscriber?{" "}
                <a href="/login" className="sign-in-link">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Article;