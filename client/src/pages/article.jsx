import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import Navbar from "../components/navbar.jsx";
import Rate from "../components/rateAndFlag.jsx";
import Content from "../components/articleContent.jsx";
import Comments from "../components/commentsSection.jsx";
import useAuthHook from "../hooks/useAuth.jsx";
import { BookOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Article = () => {
  const articleRef = useRef(null);
  const [selectedText, setSelectedText] = useState("");
  const [definition, setDefinition] = useState(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const { userType } = useAuthHook();

  // TEMPORARY HARDCODED articleId (you'll replace this later)
  const mockArticleId = "11111111-1111-1111-1111-111111111111";

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

      <div className="border-b w-full">
        <div className="flex flex-col items-right w-full px-4 sm:px-8 py-4 mx-auto max-w-screen-lg">
          <Rate />
        </div>
      </div>

      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-10 mx-auto max-w-screen-lg">
        <Content articleRef={articleRef} />
        <Comments articleId={mockArticleId} />

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
      </main>
    </div>
  );
};

export default Article;