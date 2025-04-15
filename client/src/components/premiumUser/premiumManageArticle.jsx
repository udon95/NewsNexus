import React, { useState, useEffect } from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";
import SearchBar from "../search.jsx"; // Import Search.jsx
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import supabase from "../../api/supabaseClient.js";

export const PremManageArticle = () => {
  const navigate = useNavigate();
  const [postedArticles, setPostedArticles] = useState([]);
  const [roompostedArticles, setroomPostedArticles] = useState([]);
  const [draftArticles, setDraftArticles] = useState([]);
  const [roomdraftArticles, setroomDraftArticles] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showArticleTypeDropdown, setShowArticleTypeDropdown] = useState(false);
  const [topics, setTopics] = useState([]); 
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;

  // Fetch Topics from `topic_categories`
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");

      if (!error && data) {
        setTopics(data);
      }
    };
    fetchTopics();
  }, []);

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

      console.log("User from localStorage:", session);

      const { data, error } = await supabase
        .from("articles")
        .select(`
          articleid,
          title,
          time,
          topicid,
          view_count,
          total_votes,
          imagepath
        `)
        .eq("userid", userId)
        .eq('status', 'Published')
        .order("time", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      const viewCountMap = {};
      const likeCountMap = {};

      // Populate view_count and total_votes for each article
      data.forEach(article => {
        viewCountMap[article.articleid] = article.view_count;
        likeCountMap[article.articleid] = article.total_votes;
      });

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setPostedArticles(data);
      setViewCounts(viewCountMap);
      setLikeCounts(likeCountMap);
    }
    fetchpostedArticles();
  }, [userId]);

  useEffect(() => {
    const fetchroompostedArticles = async () => {
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

      console.log("User from localStorage:", session);

      const { data, error } = await supabase
        .from("room_articles")
        .select(`
          postid,
          title,
          created_at,
          room_article_images(image_url)
        `)
        .eq("userid", userId)
        .eq('status', 'Published')
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setroomPostedArticles(data);

    }
    fetchroompostedArticles();
  }, [userId]);

  useEffect(() => {
    const fetchdraftArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          articleid,
          title,
          time,
          topicid,
          imagepath
        `)
        .eq("userid", userId)
        .eq('status', 'Draft')
        .order("time", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setDraftArticles(data);
    }
    fetchdraftArticles();
  }, [userId]);

  useEffect(() => {
    const fetchroomDraftArticles = async () => {
      const { data, error } = await supabase
        .from("room_articles")
        .select(`
          postid,
          title,
          created_at,
          room_article_images(image_url)
        `)
        .eq("userid", userId)
        .eq('status', 'Draft')
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error("Error fetching articles:", error);
        return;
      }

      console.log("Fetched articles data:", JSON.stringify(data, null, 2)); // Debugging log
      setroomDraftArticles(data);
    }
    fetchroomDraftArticles();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".topic-dropdown")) {
        setShowDropdown(false);
      }
      if (!event.target.closest(".article-type-dropdown")) {
        setShowArticleTypeDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);  

  // States for filtering
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [articleType, setArticleType] = useState("all"); // "all", "posted", "draft"
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Function to filter articles by topic and search query
  const filterArticles = (articles) => {
    let filtered = articles;
  
    if (selectedTopicId !== "all") {
      filtered = filtered.filter((article) => article.topicid === selectedTopicId);
    }
  
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    return filtered;
  };  
  
  // Handle article click event
  const handleArticleClick = (article) => {
    navigate(`/article/${encodeURIComponent(article.title)}`);
  };

  const handleDeleteArticle = (articleid) => {
    setPostedArticles((prev) => prev.filter((a) => a.articleid !== articleid));
  };

  const handleDeleteRoomArticle = (postid) => {
    setroomPostedArticles((prev) => prev.filter((a) => a.postid !== postid));
  };

  const handleDeleteDraft = (articleid) => {
    setDraftArticles((prev) => prev.filter((a) => a.articleid !== articleid));
  };  

  const handleDeleteRoomDraft = (postid) => {
    setroomDraftArticles((prev) => prev.filter((a) => a.postid !== postid));
  };

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
    <main className="w-full text-xl flex flex-col max-md:flex-col max-w-4xl">                          
      <div className="flex items-center gap-6 mb-6">
        <div className="w-full max-w-[400px]"> 
          <SearchBar onSearch={setSearchQuery} />
        </div>
        {/* Topic Filter */}
        <div className="flex items-center mt-10 topic-dropdown">
          <div className="relative">
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-[#191A23] text-white border rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span>
              {selectedTopicId === "all"
                ? "Topics"
                : topics.find((t) => t.topicid === selectedTopicId)?.name || "Select Topic"}
            </span>
            <FilterAltIcon />
          </button>

            {showDropdown && (
              <ul className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <li
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                    selectedTopicId === "all" ? "bg-blue-200 font-semibold" : ""
                  }`}
                  onClick={() => {
                    setSelectedTopicId("all");
                    setShowDropdown(false);
                  }}
                >
                  Topics
                </li>
                {topics.map((topic) => (
                  <li
                    key={topic.topicid}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                      selectedTopicId === topic.topicid ? "bg-blue-200 font-semibold" : ""
                    }`}
                    onClick={() => {
                      setSelectedTopicId(topic.topicid);
                      setShowDropdown(false);
                    }}
                  >
                    {topic.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Article Type Filter */}
        <div className="flex items-center mt-10 article-type-dropdown">
          <div className="relative">
            <button
              onClick={() => setShowArticleTypeDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 bg-[#191A23] text-white border rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>
                {articleType === "all"
                  ? "All"
                  : articleType === "posted"
                  ? "Posted"
                  : "Draft"}
              </span>
              <FilterAltIcon />  {/* Add the icon here */}
            </button>

            {showArticleTypeDropdown && (
              <ul className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {["all", "posted", "draft"].map((type) => (
                  <li
                    key={type}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                      articleType === type ? "bg-blue-200 font-semibold" : ""
                    }`}
                    onClick={() => {
                      setArticleType(type);
                      setShowArticleTypeDropdown(false);
                    }}
                  >
                    {type === "all" ? "All" : type === "posted" ? "Posted" : "Draft"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filtered Article Lists */}
      {(articleType === "all" || articleType === "posted") && (
        <ArticleList
          title="My Posted Articles:"
          articles={filterArticles(postedArticles)}
          isDraft={false}
          isPremium={true}
          isRoom={false}
          onArticleClick={handleArticleClick}
          onDeleteSuccess={handleDeleteArticle}
          articleData={{ viewCounts, likeCounts }}
        />
      )}
      {(articleType === "all" || articleType === "posted") && (
        <ArticleList
          title="My Posted Room Articles:"
          articles={filterArticles(roompostedArticles)}
          isDraft={false}
          isPremium={true}
          isRoom={true}
          onDeleteSuccess={handleDeleteRoomArticle}
        />
      )}
      {(articleType === "all" || articleType === "draft") && (
        <ArticleList
          title="My Drafts:"
          articles={filterArticles(draftArticles)}
          isDraft={true}
          isPremium={true}
          isRoom={false}
          onDeleteSuccess={handleDeleteDraft}
        />
      )}
      {(articleType === "all" || articleType === "draft") && (
        <ArticleList
          title="My Room Drafts:"
          articles={filterArticles(roomdraftArticles)}
          isDraft={true}
          isPremium={true}
          isRoom={true}
          onDeleteSuccess={handleDeleteRoomDraft}
        />
      )}                    
    </main>
  </div>
);
};

export default PremManageArticle;
