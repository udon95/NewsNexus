import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import Navbar from "./navbar.jsx";
import api from "../api/axios.jsx";
import NewsCard from "./newsCard.jsx";
import useAuthHook from "../hooks/useAuth.jsx";

const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  // const { role: currentUserRole } = useAuthHook();
  // const isPrivate = room.is_private === true;
  // const isFreeUser = user.usertype === "Free";

  const { role: currentUserRole } = useAuthHook();
  const viewer = JSON.parse(localStorage.getItem("userProfile"));
  const userType = currentUserRole || viewer?.role || "Free";

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
  if (!profileData) return <div className="text-center py-10">Loading...</div>;

  const { user, articles, rooms, expertTopics } = profileData;

  // return (
  //   <div className="min-h-screen bg-white text-gray-900">
  //     <Navbar />
  //     <main className="max-w-5xl mx-auto px-6 py-10">
  //       {/* PROFILE HEADER */}
  //       <section className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 mb-10">
  //         <div>
  //           <h1 className="text-2xl font-bold">{user.username}</h1>
  //           <div className="flex items-center gap-2 mt-2">
  //             {user.expert_status === "Approved" && (
  //               <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
  //                 <BadgeCheck className="w-4 h-4" />
  //                 Verified Expert
  //               </span>
  //             )}
  //             {user.usertype === "Premium" && (
  //               <span className="bg-yellow-400 text-black text-sm font-medium px-3 py-1 rounded-full">
  //                 Premium
  //               </span>
  //             )}
  //             {user.usertype === "Free" && (
  //               <span className="bg-gray-300 text-black text-sm font-medium px-3 py-1 rounded-full">
  //                 Free
  //               </span>
  //             )}
  //           </div>
  //           <p className="text-sm text-gray-500 mt-2">
  //             Joined on: {new Date(user.created_at).toLocaleDateString()}
  //           </p>
  //           <p className="text-sm text-gray-500">
  //             Articles: {profileData.totalArticles} | Likes: {profileData.totalLikes} | Views: {profileData.totalViews}
  //           </p>
  //           {expertTopics?.length > 0 && (
  //             <p className="text-sm text-gray-500 mt-1">
  //               Expertise in: {expertTopics.map((t) => t.name).join(", ")}
  //             </p>
  //           )}
  //         </div>
  //         {/* Future: Add avatar */}
  //       </section>

  //       {/* ARTICLES */}
  //       <section className="mb-10">
  //         <h2 className="text-xl font-semibold mb-4">Articles by {user.username}</h2>
  //         {articles.length === 0 ? (
  //           <div className="text-gray-400 italic">No articles published yet.</div>
  //         ) : (
  //           <div className="space-y-6">
  //             {articles.map((article) => (
  //               <NewsCard
  //                 key={article.articleid}
  //                 articleid={article.articleid}
  //                 title={article.title}
  //                 imageUrl={article.imagepath}
  //               />
  //             ))}
  //           </div>
  //         )}
  //       </section>

  //       {/* JOINED ROOMS */}
  //       <section className="mb-10">
  //         <h2 className="text-xl font-semibold mb-4">Joined Rooms</h2>
  //         {rooms.length === 0 ? (
  //           <div className="text-gray-400 italic">Not a member of any rooms.</div>
  //         ) : (
  //           <ul className="list-disc list-inside space-y-1 text-blue-600">
  //             {rooms.map((room) => (
  //               <li key={room.roomid}>
  //                 <Link to={`/room/${room.roomid}`} className="hover:underline">
  //                   {room.room_name}
  //                 </Link>
  //               </li>
  //             ))}
  //           </ul>
  //         )}
  //       </section>
  //     </main>
  //   </div>
  // );

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
    <Navbar />
    <main className="max-w-5xl mx-auto px-6 py-10 font-grotesk space-y-6">
  

  <section className="w-full bg-white rounded-2xl border shadow p-6 flex flex-col sm:flex-row gap-6">
    {/* Avatar */}
    <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        {user.profile_image ? (
          <img
            src={user.profile_image}
            alt="Profile"
            className="w-full h-full object-cover rounded-full border border-gray-300"
          />
        ) : (
          <div className="w-full h-full bg-black text-white flex items-center justify-center rounded-full text-3xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

    </div>

    {/* Info Area */}
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
        {user.expert_status === "Approved" && (
          <span className="flex items-center gap-1 text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded-full">
            <BadgeCheck className="w-4 h-4" />
              Verified Expert
          </span>
        )}
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${
            user.usertype === "Premium"
              ? "bg-blue-200 text-black"
              : "bg-gray-300 text-black"
          }`}
        >
          {user.usertype}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Joined: {new Date(user.created_at).toLocaleDateString()}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col items-center">
          <div className="font-bold text-xl">{profileData.totalArticles}</div>
          <div className="text-sm text-gray-600">Articles</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col items-center">
        <div className="font-bold text-xl">{profileData.totalViews}</div>
        <div className="text-sm text-gray-600">Views</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col items-center">
        <div className="font-bold text-xl">{profileData.upvotes}</div>
        <div className="text-sm text-gray-600">Upvotes</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col items-center">
        <div className="font-bold text-xl">{profileData.downvotes}</div>
        <div className="text-sm text-gray-600">Downvotes</div>
      </div>
    </div>

    {expertTopics?.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2 items-center text-sm text-gray-700">
        <span className="font-semibold">Expertise:</span>
        {expertTopics.map((t) => (
          <span
            key={t.name}
            className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium"
          >
            {t.name}
          </span>
        ))}
      </div>
    )}

    </div>
    </section>

            {/* Room Membership Section */}
            <section className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Room Memberships :</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500 italic">Not a member of any rooms.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {rooms.map((room) => {
                const isPrivate = room.is_private === true;
                const isMember = room.joined === true;

              const commonClasses = "px-4 py-2 rounded-full font-medium transition";

              // FREE USERS — All pills are black, not clickable
              if (userType === "Free") {
                return (
                  <div key={room.roomid} className="relative group">
                    <span
                      className={`${commonClasses} bg-black text-white cursor-not-allowed`}
                    >
                      {room.room_name}
                    </span>
                    <div className="absolute z-10 left-0 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-2 rounded-md shadow-lg max-w-xs text-center whitespace-nowrap">
                      Room is a Premium feature. Upgrade to access.
                    </div>
                  </div>
                );
              }
              

              // PREMIUM USERS — PRIVATE ROOM they are NOT a member of → black, not clickable
              if (userType === "Premium" && isPrivate && !isMember) {
                return (
                  <span
                    key={room.roomid}
                    title="This is a private room. Join to access."
                    className={`${commonClasses} bg-black text-white cursor-not-allowed`}
                  >
                    {room.room_name}
                  </span>
                );
              }

              // PREMIUM USERS — PRIVATE ROOM they ARE a member of → black, clickable
              if (userType === "Premium" && isPrivate && isMember) {
                return (
                  <Link
                    key={room.roomid}
                    to={`/room/${room.roomid}`}
                    className={`${commonClasses} bg-black text-white hover:bg-gray-800`}
                  >
                    {room.room_name}
                  </Link>
                );
              }

              // PREMIUM USERS — PUBLIC ROOM → blue, clickable
              return (
                <Link
                  key={room.roomid}
                  to={`/room/${room.roomid}`}
                  className={`${commonClasses} bg-blue-100 text-blue-700 hover:bg-blue-200`}
                >
                  {room.room_name}
                </Link>
              );
            })}

            </div>
          )}
        </section>
  
        {/* Articles Section */}
        <section className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Articles :</h2>
          {articles.length === 0 ? (
            <p className="text-gray-500 italic">No articles published yet.</p>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <NewsCard
                  key={article.articleid}
                  articleid={article.articleid}
                  title={article.title}
                  imageUrl={article.imagepath}
                />
              ))}
            </div>
          )}
        </section>
  
      </main>
    </div>
  );
  

};

export default PublicProfile;
