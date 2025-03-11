import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import Search from "../components/search.jsx";
import Testimonial from "../components/tesimonial.jsx";
import TopicsList from "../components/topicList.jsx";
import LatestNews from "../components/latestNews.jsx";
import downArrow from "../assets/DownArrow.svg";
import supabase from "../api/supabaseClient.js";

// const newsData = [
//   {
//     title: "Latest Malaysian Forest Fire",
//     imageUrl: "test.png", // Replace with actual image URL
//     rating: 4,
//   },
//   {
//     title: "US Currency Strengthens Again",
//     imageUrl: "",
//     rating: 3,
//   },
//   {
//     title: "Personal Top 5 Singaporean Xiao Mei Mei",
//     imageUrl: "",
//     rating: 2,
//   },
// ];

const topics = [
  "Finance",
  "Politics",
  "Entertainment",
  "Sports",
  "Weather",
  "Lifestyle",
  "Beauty",
  "Hollywood",
  "China",
  "Horticulture",
  "Culinary",
  "LGBTQ++",
  "Singapore",
  "Environment",
  "Investment",
  "USA",
  "Luxury",
  "Korea",
];

function Home() {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [user, setUser] = useState(null);
  

  // Fetch the logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const toggleSelection = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else if (selectedTopics.length < 6) {
      setSelectedTopics([...selectedTopics, topic]);
    }
     
  };
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <div className="w-full min-w-screen  mx-auto px-6 sm:px-12 md:px-24 lg:px-36 xl:px-48 flex flex-col items-start justify-center h-[300px] bg-[#7FB0FE]">
        <h1 className="text-black text-4xl w-[300px] font-bold font-grotesk">
          Navigating the Singaporean News Landscape
        </h1>
        <div className="flex justify-left gap-3 mt-4 sm:mt-4">
          {!user && (
            <>
            <button
            className="px-2 py-1 bg-[#191A23] font-grotesk text-white rounded-lg hover:bg-opacity-90 w-[80px]"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
          <button
            className="px-2 py-1 bg-[#191A23] font-grotesk text-white rounded-lg hover:bg-opacity-90 w-[80px]"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          </>
          )}
        </div>
      </div>
      <Navbar />
      <Search />

      <div className="flex justify-center w-full mt-10 font-grotesk">
        <div className="relative w-full max-w-[900px] bg-gray-300 rounded-lg shadow-lg overflow-hidden ">
          {/* Text Overlay */}
          <p className="absolute top-3 left-4 text-black font-bold text-3xl z-10">
            Features :
          </p>

          {/* Video Element */}
          <video autoPlay loop muted className="w-full max-h-[400px]" controls>
            <source src="video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="flex justify-center w-full mt-12">
        <button
          onClick={() => navigate("/rooms")}
          className="w-full max-w-[900px] bg-gray-100 text-left text-black text-3xl font-grotesk font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          Go To Discussion Rooms &gt;
        </button>
      </div>
      <div className="flex justify-center w-full mt-12">
        <Testimonial />
      </div>

      <div className="flex justify-center w-full mt-12">
        <TopicsList
          topics={topics}
          selectedTopics={selectedTopics}
          toggleSelection={toggleSelection}
        />
      </div>

      <div className="flex justify-center w-full mt-12">
        <LatestNews />
      </div>

      <div className="flex justify-center mt-12 mb-5">
        <button
          onClick={() => navigate("/explore")}
          className="transition hover:opacity-80"
        >
          <img src={downArrow} alt="Down Arrow" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default Home;
