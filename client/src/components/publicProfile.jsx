import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import Navbar from "./navbar.jsx";
import api from "../api/axios.jsx";
import NewsCard from "./newsCard.jsx";
import ArticleList from "./articleList.jsx";

const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/auth/public-profile/${username}`);
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching user data");
      }
    };

    fetchUserData();
  }, [username]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 sm:px-8 max-w-4xl font-grotesk py-8 ">
        <div className="bg-gray-200 p-6 rounded-lg shadow mb-2 max-w-[900px]">
          <h2 className="text-2xl font-semibold">
            {profileData.user.username}
            <p className="text-sm text-gray-700 mt-1">
              Joined on:{" "}
              {new Date(profileData.user.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700">
              Articles: {profileData.totalArticles} | Total Likes:{" "}
              {profileData.totalLikes} | Total Views: {profileData.totalViews}
            </p>

            {profileData.user.expert_status === "Approved" && (
              <BadgeCheck className="inline-block ml-2 text-blue-500" />
            )}

            {profileData.user.usertype === "Premium" && (
              <span className="ml-2 px-2 py-1 text-sm bg-yellow-400 text-black rounded-full">
                Premium
              </span>
            )}
            {profileData.user.usertype === "Free" && (
              <span className="ml-2 px-2 py-1 text-sm bg-yellow-400 text-black rounded-full">
                Free
              </span>
            )}
          </h2>
        </div>

        <div className="flex flex-col flex-grow items-center w-full px-4">
          <div className="w-full max-w-5xl p-6 font-grotesk bg-gray-200">
            <h1 className="text-4xl mb-8 font-grotesk text-left">Articles:</h1>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
              <ul>
                {profileData.articles.map((article) => (
                  <li key={article.articleid} className="mb-2">
                    <Link
                      to={`/article/${encodeURIComponent(article.title)}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            <div className="w-full max-w-[900px] mx-auto">
              <div className="space-y-6">
                <ArticleList
                  title="Articles:"
                  articles={profileData.articles}
                  isDraft={false}
                  isFree={true}
                  isRoom={false}
                  isPremium={false}
                  onArticleClick={() => {}}
                  onDeleteSuccess={() => {}}
                  articleData={{
                    viewCounts: Object.fromEntries(
                      profileData.articles.map((a) => [
                        a.articleid,
                        a.view_count,
                      ])
                    ),
                    likeCounts: Object.fromEntries(
                      profileData.articles.map((a) => [
                        a.articleid,
                        a.total_votes,
                      ])
                    ),
                  }}
                />
              </div>
            </div>
          </div>
          <div className="w-full max-w-5xl p-6 font-grotesk bg-gray-200">
            <h1 className="text-4xl mb-8 font-grotesk text-left">
              Public Rooms Joined:
            </h1>{" "}
            <ul>
              {profileData.rooms.map((room) => (
                <li key={room.roomid} className="mb-1">
                  <Link
                    to={`/room/${room.roomid}`}
                    className="text-blue-600 hover:underline"
                  >
                    {room.room_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
