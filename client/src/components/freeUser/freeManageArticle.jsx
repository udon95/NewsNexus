import React, { useState, useEffect } from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";
import Manage from "../manageSearchBar.jsx";

export const FreeManageMyArticles = () => {
  const navigate = useNavigate();
  const [postedArticles, setPostedArticles] = useState([]);
  const [draftArticles, setDraftArticles] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showArticleTypeDropdown, setShowArticleTypeDropdown] = useState(false);
  const [topics, setTopics] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;

  useEffect(() => {
    const fetchpostedArticles = async () => {
      const storedUser = localStorage.getItem("userProfile");
      if (!storedUser) {
        alert("User not authenticated. Cannot view.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const session = parsedUser?.user; // Assuming 'user' is the session data in your stored object

      if (!session) {
        alert("User not authenticated. Cannot view.");
        return;
      }

      // console.log("User from localStorage:", session);

      const { data, error } = await supabase
        .from("articles")
        .select(
          `
          articleid,
          title,
          time,
          view_count,
          total_votes,
          imagepath
        `
        )
        .eq("userid", userId)
        .eq("status", "Published")
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      const viewCountMap = {};
      const likeCountMap = {};

      // Populate view_count for each article
      data.forEach((article) => {
        viewCountMap[article.articleid] = article.view_count;
        likeCountMap[article.articleid] = article.total_votes;
      });

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setPostedArticles(data);
      setViewCounts(viewCountMap);
      setLikeCounts(likeCountMap);
    };
    fetchpostedArticles();
  }, [userId]);

  useEffect(() => {
    const fetchdraftArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
          articleid,
          title,
          time,
          topicid,
          imagepath
        `
        )
        .eq("userid", userId)
        .eq("status", "Draft")
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setDraftArticles(data);
    };
    fetchdraftArticles();
  }, [userId]);

  // States for filtering
  const [articleType, setArticleType] = useState("all"); // "all", "posted", "draft"
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [timeFilter, setTimeFilter] = useState("All Time");

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
  };

  // Function to filter articles by topic and search query
  const filterArticles = (articles) => {
    let filtered = articles;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Time filter
    const now = new Date();
    let cutoff;

    if (timeFilter === "Today") {
      cutoff = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeFilter === "Week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "Month") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "Year") {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    if (cutoff) {
      filtered = filtered.filter((article) => {
        const time = article.time;
        return new Date(time) >= cutoff;
      });
    }

    return filtered;
  };

  // Handle article click event
  const handleArticleClick = (article) => {
    navigate(`/free/edit/${article.articleid}`);
  };

  const handleDeletePosted = (articleid) => {
    setPostedArticles((prev) => prev.filter((a) => a.articleid !== articleid));
  };

  const handleDeleteDraft = (articleid) => {
    setDraftArticles((prev) => prev.filter((a) => a.articleid !== articleid));
  };

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full text-xl flex flex-col max-md:flex-col max-w-4xl">
        <Manage
          onSearch={setSearchQuery}
          initialTimeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          articleType={articleType}
          onArticleTypeChange={setArticleType}
          isPremium={false}
        />

        {/* Filtered Article Lists */}
        {(articleType === "all" || articleType === "article") && (
          <ArticleList
            title="My Posted Articles:"
            articles={filterArticles(postedArticles)}
            isDraft={false}
            isFree={true}
            isRoom={false}
            isPremium={false}
            onArticleClick={handleArticleClick}
            onDeleteSuccess={handleDeletePosted}
            articleData={{ viewCounts, likeCounts }}
          />
        )}
        {(articleType === "all" || articleType === "draft") && (
          <ArticleList
            title="My Drafts:"
            articles={filterArticles(draftArticles)}
            isDraft={true}
            isFree={true}
            isRoom={false}
            isPremium={false}
            onArticleClick={handleArticleClick}
            onDeleteSuccess={handleDeleteDraft}
          />
        )}
      </main>
    </div>
  );
};

export default FreeManageMyArticles;
