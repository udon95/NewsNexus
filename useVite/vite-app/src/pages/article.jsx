import React, { useState, useEffect, useRef } from "react";
// import React from "react";s
import { useNavigate, useParams } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import articleImage from "../assets/Logo.svg";

import { StarIcon as StarFilled } from "@heroicons/react/24/solid"; // Filled star
import { StarIcon as StarOutline } from "@heroicons/react/24/outline"; // Outline star
import {
  FlagIcon,
  PencilIcon,
  ShareIcon,
  PauseIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid"; // Submit & Share Icons
import { SpeakerWaveIcon } from "@heroicons/react/24/outline"; // Text-to-Speech Icon

const Article = () => {
  const [rating, setRating] = useState(0); //  Track user rating
  const [hover, setHover] = useState(0); //  Handle hover effect

  const [comments, setComments] = useState([]);
  const { title } = useParams(); // Get the article title from URL
  const articleRef = useRef(null); // Reference to the article content
  const [isPlaying, setIsPlaying] = useState(false); // Track TTS play state
  const [canRestart, setCanRestart] = useState(false); // Track restart availability
  const speechRef = useRef(null); // Reference to Speech API object

  const handleShare = async () => {
    try {
      const url = window.location.href; // Get current page URL
      await navigator.clipboard.writeText(url); // Copy URL to clipboard
      alert("Article link copied to clipboard!"); // Show success message
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Failed to copy link.");
    }
  };

  // Function to read the article aloud using Web Speech API
  const handleTextToSpeech = () => {
    // If speech is already playing, toggle pause/resume
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    // If speech was paused, resume it
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel(); // Stop previous speech

    // Extract text from the article content
    const articleText =
      articleRef.current.innerText || "No article content found.";

    const speech = new SpeechSynthesisUtterance();
    speech.text = articleText;
    speech.lang = "en-US";
    speech.rate = 1; // Normal speed
    speech.pitch = 1; // Normal pitch

    // When speech starts, update play state & show restart button
    speech.onstart = () => {
      setIsPlaying(true);
      setCanRestart(true);
    };

    // When speech ends, reset state
    speech.onend = () => {
      setIsPlaying(false);
      setCanRestart(false);
    };

    speechRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  // Function to restart TTS from the beginning
  const handleRestartTTS = () => {
    if (!speechRef.current) return;
    window.speechSynthesis.cancel();
    handleTextToSpeech(); // Restart speech from beginning
  };

  useEffect(() => {
    // Simulated database fetch (Replace this with an API call in the future)
    const fakeComments = [
      {
        id: 1,
        author: "P",
        date: "Commented on 22/01/2025",
        content:
          "Aut consequatur maxime aut harum repudiandae aut pariatur autem sed labore pariatur.",
        hasReply: true,
      },
      {
        id: 2,
        author: "P",
        date: "Replied on 22/01/2025",
        content:
          "Aut consequatur maxime aut harum repudiandae aut pariatur autem sed.",
        isReply: true,
      },
    ];

    setComments(fakeComments);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => {
      window.speechSynthesis.cancel(); // Stop speech when component unmounts or page refreshes
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Rating & Actions Section */}
      <div className="w-full flex items-center justify-end px-6 sm:px-8 py-4 border-b space-x-4">
        {/*  Full-Star Rating System */}
        <div className="flex items-center space-x-1">
          {[...Array(4)].map((_, index) => {
            const ratingValue = index + 1;

            return (
              <button
                key={index}
                className="focus:outline-none"
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(ratingValue)}
              >
                {ratingValue <= (hover || rating) ? (
                  <StarFilled className="h-6 w-6 text-yellow-400" />
                ) : (
                  <StarOutline className="h-6 w-6 text-black" />
                )}
              </button>
            );
          })}
        </div>

        {/*  Community Notes (Using Flag Icon) */}
        <button
          className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center"
          title="Community Notes"
        >
          <FlagIcon className="h-6 w-6 text-black" />
        </button>

        {/*  Report Button (Same size as flag button) */}
        <button
          className="w-10 h-10 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center justify-center font-bold text-black"
          title="Report Article"
        >
          R
        </button>
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full px-4 sm:px-8 py-10 mx-auto max-w-screen-lg">
        {/* Article Title */}
        <h1 className="font-grotesk text-4xl sm:text-5xl font-bold text-black text-left">
          {decodeURIComponent(title)}
        </h1>

        {/* Article Image */}
        <img
          src={articleImage}
          alt="Article"
          className="w-full rounded-lg my-6 bg-gray-300"
        />

        {/* Article Date */}
        <span className="font-grotesk text-lg text-[#00317F] mb-4">
          Posted on 22/01/2025
        </span>

        {/* Article Content */}
        <div
          ref={articleRef}
          className="text-lg sm:text-xl font-grotesk font-medium text-black leading-relaxed space-y-6"
        >
          <p>
            Article titled "{decodeURIComponent(title)}. Lorem ipsum dolor sit
            amet. Eum error officiis est dolorem architecto quo iusto quos rem
            ipsam maxime. Est nulla dolor cum saepe esse qui quia fugiat ut
            numquam harum. Aut enim assumenda sed quidem modi eos fugiat nisi et
            maxime delectus aut minus labore.
          </p>
          <p>
            Sit voluptatem ipsam hic iste neque id sunt quia aut ipsa
            necessitatibus et magni voluptatem aut ratione earum qui suscipit
            ratione?
          </p>
          <p>
            Lorem ipsum dolor sit amet. Eum error officiis est dolorem
            architecto quo iusto quos rem ipsam maxime. Est nulla dolor cum
            saepe esse qui quia fugiat ut numquam harum. Aut enim assumenda sed
            quidem modi eos fugiat nisi et maxime delectus aut minus labore.
          </p>
          <p>
            Sit voluptatem ipsam hic iste neque id sunt quia aut ipsa
            necessitatibus et magni voluptatem aut ratione earum qui suscipit
            ratione?
          </p>
          <p>
            Lorem ipsum dolor sit amet. Eum error officiis est dolorem
            architecto quo iusto quos rem ipsam maxime. Est nulla dolor cum
            saepe esse qui quia fugiat ut numquam harum. Aut enim assumenda sed
            quidem modi eos fugiat nisi et maxime delectus aut minus labore.
          </p>
          <p>
            Sit voluptatem ipsam hic iste neque id sunt quia aut ipsa
            necessitatibus et magni voluptatem aut ratione earum qui suscipit
            ratione?
          </p>
        </div>

        {/* Comment Input Section (Below Article, Above Comments) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-4">
          {/* Comment Input Field */}
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-grow bg-gray-100 rounded-lg px-4 py-2 text-black placeholder-gray-500 focus:outline-none max-w-xs sm:max-w-none"
          />

          {/* Action Buttons (Submit, Share, Text-to-Speech) */}
          <div className="flex sm:flex-row flex-col sm:space-x-2 space-y-2 sm:space-y-0">
            {/*  Submit Button */}
            <button className="w-10 h-10 p-2 bg-gray-700 rounded-lg hover:bg-gray-800 flex items-center justify-center">
              <PencilIcon className="h-5 w-5 text-white" />
            </button>

            {/*  Share Button */}
            <button
              onClick={handleShare}
              className="w-10 h-10 p-2 bg-gray-700 rounded-lg hover:bg-gray-800 flex items-center justify-center"
            >
              <ShareIcon className="h-5 w-5 text-white" />
            </button>

            {/*  Text-to-Speech Button */}
            <button
              onClick={handleTextToSpeech}
              className="w-10 h-10 p-2 bg-gray-700 rounded-lg hover:bg-gray-800 flex items-center justify-center"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 text-white" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Restart Button (Only Visible When Playing) */}
            {canRestart && (
              <button
                onClick={handleRestartTTS}
                className="w-10 h-10 p-2 bg-gray-700 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <ArrowPathIcon className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="w-full mt-10">
          <h2 className="text-3xl font-bold text-black mb-4">Comments</h2>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`w-full max-w-3xl bg-gray-200 p-4 rounded-lg mb-4 ${
                  comment.isReply ? "ml-10 max-w-2xl" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg ${
                      comment.isReply ? "bg-purple-300" : "bg-blue-300"
                    }`}
                  >
                    {comment.author}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#00317F] text-sm font-semibold">
                      {comment.date}
                    </p>
                    <p className="text-lg text-black">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Article;
