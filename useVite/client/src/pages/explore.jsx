import React, { useEffect } from "react";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import Search from "../components/search.jsx";
import Rank from "../components/articlesRank.jsx";
import Expert from "../components/expertNewsCard.jsx";
import LatestNews from "../components/latestNews.jsx";

const Explore = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when page loads
  }, []);

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <Search />
      <div className="flex justify-center w-full mt-12">
        <Rank />
      </div>
      <div className="flex justify-center w-full mt-12">
        <Expert />
      </div>
      <div className="flex justify-center w-full mt-12">
        <LatestNews />
      </div>

    
    </div>
  );
};

export default Explore;
