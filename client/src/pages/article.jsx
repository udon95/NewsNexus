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
import { Share2, Headphones, Flag, StickyNote, Languages } from "lucide-react";
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
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default to English

  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  // const handleTTS = () => {
  //   if (!articleRef.current) return;
  //   if (isSpeaking) {
  //     window.speechSynthesis.cancel();
  //     setIsSpeaking(false);
  //     return;
  //   }
  //   const text = articleRef.current.innerText;
  //   const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = "en-US";
  //   utterance.rate = 1;
  //   utterance.pitch = 1;
  //   utterance.onend = () => setIsSpeaking(false);
  //   utterance.onstart = () => setIsSpeaking(true);
  //   speechRef.current = utterance;
  //   window.speechSynthesis.speak(utterance);
  // };

  const handleTTS = async () => {
    // If we’re already playing audio, stop or pause it here
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
      // 1. Get text from the article
      const text = articleRef.current.innerText;

      // 2. Make a POST request to your TTS endpoint
      //    Adjust the URL if your server is at a different path or port
      const response = await fetch(
        "http://localhost:5000/translate/text-to-speech",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            targetLang: selectedLanguage, // or any other supported language
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed: " + response.status);
      }

      // 3. Get the binary audio stream
      const arrayBuffer = await response.arrayBuffer();

      // 4. Convert it into a Blob, then a URL we can play in the browser
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);

      // 5. Create an Audio object and play it
      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      speechRef.current = audio;

      // Update your isSpeaking state
      setIsSpeaking(true);

      // When audio ends, reset isSpeaking
      audio.onended = () => {
        setIsSpeaking(false);
      };

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
    // Extract the text you want to translate (here, using the article content)
    const textToTranslate = originalText;
    // console.log(articleData.text);
    console.log(articleRef.current.innerText);
    try {
      // Call the translation endpoint you set up on the server.
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTranslate, targetLang }),
      });
      if (!response.ok) {
        throw new Error("Translation failed.");
      }
      const data = await response.json();

      // For example, you might simply show the translated text in an alert...
      // alert(`Translated Text:\n\n${data.translatedText}`);

      // Alternatively, if you want to update the UI, store it in state:
      setTranslatedText(data.translatedText);
      // console.log(data.translatedText);
    } catch (error) {
      console.error("Error translating article:", error);
      alert("Error translating article: " + error.message);
    }
  };

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
          `articleid, title, text, imagepath, time, view_count, rating, status, userid, users (userid, username)`
        )
        .eq("title", articleName)
        .single();

      if (!error) {
        setArticleData(data);
        setOriginalText(data.text);

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

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-6 mx-auto max-w-[750px]">
        {articleData && !showPaywall ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 text-left w-full">
              {articleData.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 mb-3 w-full">
              <span className="font-semibold text-black">
                {articleData.users?.username || "Unknown Author"}
              </span>
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
            <Comments
              articleRef={articleRef}
              articleId={articleData.articleid}
            />
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
      </main>
    </div>
  );
};

export default Article;
