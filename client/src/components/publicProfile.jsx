// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// function PublicProfile() {
//   const { userid } = useParams();
//   const [profileData, setProfileData] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await axios.get(`/public-profile/${userId}`);
//         setProfileData(response.data);
//       } catch (err) {
//         setError(err.response?.data?.error || "Error fetching profile.");
//       }
//     };
//     fetchProfile();
//   }, [userId]);

//   if (error) return <div>{error}</div>;
//   if (!profileData) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{profileData.user.username}</h2>
//       {profileData.biography && (
//         <div>
//           <h3>Biography:</h3>
//           <p>{profileData.biography}</p>
//         </div>
//       )}
//       <div>
//         <h3>Articles:</h3>
//         <ul>
//           {profileData.articles.map((article) => (
//             <li key={article.articleid}>
//               <h4>{article.title}</h4>
//               <p>{article.summary}</p>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div>
//         <h3>Public Rooms Joined:</h3>
//         <ul>
//           {profileData.publicRooms.map((room) => (
//             <li key={room.roomid}>{room.room_name}</li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default PublicProfile;

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BadgeCheck, ArrowLeft } from "lucide-react";
import Navbar from "./navbar.jsx";

const PublicProfile = () => {
  const { userid, username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dummy data to use for a fake user
  const dummyData = {
    userid: "fake123",
    username: "John",
    usertype: "Expert",
    articles: [
      {
        articleid: 1,
        title: "Dummy Article One",
        summary: "Summary for article one.",
      },
      {
        articleid: 2,
        title: "Dummy Article Two",
        summary: "Summary for article two.",
      },
    ],
    publicRooms: [
      { roomid: 1, room_name: "Public Room A" },
      { roomid: 2, room_name: "Public Room B" },
    ],
    biography:
      "I have a PHD in Computer Science, and have been working in the industry for 20 years.",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // If using a fake ID, directly set dummy data
      if (userid === "fake123") {
        setProfileData(dummyData);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${username}`
        );
        // Here, you might combine the user data with dummy articles/rooms if needed
        setProfileData({
          ...response.data,
          articles: dummyData.articles,
          publicRooms: dummyData.publicRooms,
          biography:
            response.data.usertype === "Expert" ? dummyData.biography : "",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching user data");
      }
    };

    fetchUserData();
  }, [userid]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 sm:px-8 max-w-4xl font-grotesk py-8 ">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 underline flex items-center"
        >
          <ArrowLeft className="mr-1" /> Back
        </button>
        <div className="bg-gray-200 p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-4">
            {" "}
            {profileData.username}{" "}
            {profileData.usertype === "Expert" && (
              <BadgeCheck className="inline-block ml-2 text-blue-500" />
            )}
          </h1>

          {profileData.usertype === "Expert" && (
            <section className="mb-6 ">
              <h2 className="text-2xl font-semibold">Biography</h2>
              <p>{profileData.biography}</p>
            </section>
          )}

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
                  <p>{article.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6 ">
            <h2 className="text-2xl font-semibold">Public Rooms Joined</h2>
            <ul>
              {profileData.publicRooms.map((room) => (
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
