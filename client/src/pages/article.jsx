import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import "../pages/article.css";
import Logo from "../assets/Logo.svg";
import Navbar from "../components/navBar.jsx";
import Rate from "../components/rateAndFlag.jsx";
import ArticleContent from "../components/articleContent.jsx";
import Comments from "../components/commentsSection.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import { BookOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const Article = () => {
  const articleRef = useRef(null);
  const [selectedText, setSelectedText] = useState("");
  const [definition, setDefinition] = useState(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const { userType, user } = useAuthHook();
  const { articleName } = useParams();  // Get article name from URL params
  const navigate = useNavigate();

  const [articleData, setArticleData] = useState(null);
  const [readArticlesCount, setReadArticlesCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [communityNote, setCommunityNote] = useState("");
  const [showCommunityNote, setShowCommunityNote] = useState(false);

  // Fetch article data from Supabase based on article name (title)
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
          userid,
          users (userid, username)
        `)
        .eq("title", articleName)  // Match article by title (articleName from URL)
        .single();

      if (error) {
        console.error("Error fetching article:", error.message);
      } else {
        setArticleData(data);

        // Insert record in reading_history table for tracking articles read
        if (user) {
          const { error: historyError } = await supabase.from("reading_history").upsert([ 
            {
              articleid: data.articleid,
              userid: user.userid,  // This assumes `user` has a `userid` property
              read_date: new Date().toISOString(),
            },
          ]);
          if (historyError) {
            console.error("Error saving reading history:", historyError.message);
          }
        }
      }
    };

    fetchArticle();
  }, [articleName, user]);

  // Fetch the count of how many articles the user has read
  useEffect(() => {
    const fetchReadingHistory = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("reading_history")
          .select("*")
          .eq("userid", user.userid);

        if (error) {
          console.error("Error fetching reading history:", error);
        } else {
          setReadArticlesCount(data.length);
        }
      }
    };

    fetchReadingHistory();
  }, [user]);

  // Handle article reading limits for guests and free users
  useEffect(() => {
    if (user) {
      if (userType === "Free" && readArticlesCount >= 10) {
        setShowPaywall(true);  // Free users see the paywall after 10 articles
      } else if (userType === "Guest" && readArticlesCount >= 3) {
        setShowPaywall(true);  // Guests see the paywall after 3 articles
      } else {
        setShowPaywall(false);
      }
    }
  }, [readArticlesCount, user, userType]);

  // Handle text selection in the article
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

  // Fetch dictionary definition for the selected text
  const fetchDefinition = async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`
      );
      const data = await response.json();
      setDefinition(
        Array.isArray(data) && data.length > 0
          ? data[0].meanings[0].definitions[0].definition
          : "No definition found."
      );
      setShowDictionary(true);
    } catch (error) {
      setDefinition("Error fetching definition.");
    } finally {
      setLoading(false);
    }
  };

  // Handle community note submission
  const handleCommunityNoteSubmit = async () => {
    if (communityNote.trim() !== "") {
      const { error } = await supabase.from("community_notes").insert([{
        target_id: articleData.articleid,
        target_type: "article",
        note: communityNote,
        userid: user?.userid,
        username: user?.username,
        created_at: new Date().toISOString(),
        Status: "pending",
      }]);

      if (error) {
        console.error("Error submitting community note:", error);
      } else {
        setCommunityNote("");
        setShowCommunityNote(false);
        alert("Community Note added.");
      }
    }
  };

  // Handle the report submission for an article
  const handleReportSubmit = async () => {
    if (selectedReason && reportTarget) {
      const { error } = await supabase.from("reports").insert([{
        target_id: reportTarget.id,
        target_type: reportTarget.type,
        reason: selectedReason,
        userid: user?.userid,
        username: user?.username,
        created_at: new Date().toISOString(),
        resolved: false,
        resolution: null,
      }]);

      if (error) {
        console.error("Error submitting report:", error);
      } else {
        alert("Report submitted.");
        setReportTarget(null);
        setSelectedReason("");
      }
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
              text={articleData.text} // Use the original text with no modification
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

       {/* Paywall Modal */}
{showPaywall && (
  <div className="paywall-modal">
    <div className="modal-content">
      <img 
        src={Logo} 
        alt="NewsNexus Logo" 
        className="mx-auto mb-4" // Optional class for centering and spacing
      />
      <h2>Want to Keep Reading?</h2>

      {/* Conditional text for guest vs free users */}
      {userType === "Guest" ? (
        <p>Subscribe today to unlock unlimited access to all articles!</p>
      ) : (
        <p>Subscribe today to unlock unlimited access to all articles and many more!</p>
      )}

      {/* Subscribe Button */}
      <p><button className="subscribe-button" onClick={() => navigate("/subscription")}>
        Subscribe
      </button></p>

      {/* Sign In Button for already a subscriber */}
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
