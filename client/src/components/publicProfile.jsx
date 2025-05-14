import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import Navbar from "./navbar.jsx";
import api from "../api/axios.jsx";
import NewsCard from "./newsCard.jsx";

const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ upvote: 0, downvote: 0 });

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

  useEffect(() => {
    async function fetchVotes() {
      let { data, error } = await supabase
        .from("ratings")
        .select("vote_type")
        .eq("userid", user.userId);

      if (error) {
        console.error(error);
        return;
      }

      // Count upvotes and downvotes
      const voteCounts = data.reduce(
        (acc, row) => {
          if (row.vote_type === "upvote") acc.upvote += 1;
          if (row.vote_type === "downvote") acc.downvote += 1;
          return acc;
        },
        { upvote: 0, downvote: 0 }
      );

      setCounts(voteCounts);
    }

    fetchVotes();
  }, [userId]);

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
      <main className="max-w-5xl mx-auto px-6 py-10 font-grotesk space-y-10">
        {/* Profile Summary */}
        <section className="w-full bg-white rounded-2xl border shadow p-6 flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar Box (rounded-square like navbar) */}
          <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-lg text-xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              {user.expert_status === "Approved" && (
                <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  Verified Expert
                </span>
              )}
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  user.usertype === "Premium"
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-300 text-black"
                }`}
              >
                {user.usertype}
              </span>
            </div>

            {/* Stats Row */}
            <div className="mt-2 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Joined:</span>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Articles:</span>{" "}
                {profileData.totalArticles} |
                <span className="font-medium ml-2">Upvotes:</span>{" "}
                {counts.upvote} |
                <span className="font-medium ml-2">Downvotes:</span>{" "}
                {counts.downvote}
              </p>
              <p>
                <span className="font-medium">Views:</span>{" "}
                {profileData.totalViews}
              </p>
              {expertTopics?.length > 0 && (
                <p>
                  <span className="font-medium">Expertise in:</span>{" "}
                  {expertTopics.map((t) => t.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Articles</h2>
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

        {/* Room Membership Section */}
        <section className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Room Memberships</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500 italic">Not a member of any rooms.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {rooms.map((room) => (
                <Link
                  key={room.roomid}
                  to={`/room/${room.roomid}`}
                  className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                >
                  {room.room_name}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicProfile;
