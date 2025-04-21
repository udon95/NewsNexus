import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import Navbar from "./navbar.jsx";
import api from "../api/axios.jsx";

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
        <div className="bg-gray-200 p-6 rounded-lg shadow mb-2">
          <h2 className="text-2xl font-semibold">
            {profileData.user.username}

            {profileData.user.usertype === "Expert" && (
              <BadgeCheck className="inline-block ml-2 text-blue-500" />
            )}
            {profileData.userusertype === "Premium" && (
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

        <div className="bg-gray-200 p-6 rounded-lg shadow">
          <section className="mb-6 ">
            <h2 className="text-2xl font-semibold">Articles</h2>
            <ul>
              {profileData.articles.map((article) => (
                <li key={article.articleid} className="mb-2">
                  <Link
                    to={`/article/${encodeURIComponent(article.title)}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {article.title}
                  </Link>
                  {/* <p>{article.summary}</p> */}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6 ">
            <h2 className="text-2xl font-semibold">Public Rooms Joined</h2>
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
