import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Navbar from "../components/navbar.jsx";
// import Search from "../components/search.jsx";
import Testimonial from "../components/tesimonial.jsx";
import TopicsList from "../components/topicList.jsx";
import LatestNews from "../components/latestNews.jsx";
import downArrow from "../assets/DownArrow.svg";
import useAuthHook from "../hooks/useAuth.jsx";
import FetchTopics from "../components/fetchTopics.jsx";
import VideoComponent from "../components/featureVideo.jsx";

// const topics = [
//   "Finance",
//   "Politics",
//   "Entertainment",
//   "Sports",
//   "Weather",
//   "Lifestyle",
//   "Beauty",
//   "Hollywood",
//   "China",
//   "Horticulture",
//   "Culinary",
//   "LGBTQ++",
//   "Singapore",
//   "Environment",
//   "Investment",
//   "USA",
//   "Luxury",
//   "Korea",
//   "Others",
// ];

function Home() {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const { user, userType, loading } = useAuthHook();

  const handleTopicSelection = (topic) => {
    navigate(`/explore?topic=${topic}`);
  };

  const handleGoToDiscussionRooms = () => {
    if (!user) {
      alert("Please sign in and be a premium user to access Discussion Rooms.");
      // navigate("/login");
      return;
    }

    navigate("/rooms");
  };

  if (loading) {
    return <p>Loading...</p>; // Prevents flickering before user is set
  }

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <div className="      w-full h-[300px] bg-[#7FB0FE]">
        <div
          className="
          max-w-screen-xl
          mx-auto
          px-14
          sm:px-6
          md:px-8
          lg:px-12
          h-full
          flex
          flex-col
          items-start
          justify-center
          "
        >
          <h1 className="sm:ml-10 text-black text-4xl w-[300px] font-bold font-grotesk">
            Navigating the Singaporean News Landscape
          </h1>
          <div className="flex justify-left gap-3 mt-4 sm:mt-4 sm:ml-10">
            {!user && !loading && (
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
      </div>
      <Navbar />
      {/* <Search onSearch={handleSearchFromHome} /> */}
      <div className="flex justify-center w-full mt-12">
        <button
          onClick={handleGoToDiscussionRooms}
          className="w-full max-w-[900px] bg-gray-100 text-left text-black text-3xl font-grotesk font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          Go To Discussion Rooms &gt;
        </button>
      </div>
      <VideoComponent />

      <div className="w-full font-grotesk mt-12">
        <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
          Testimonials:
        </h1>
        <div className="flex justify-center w-full ">
          <Testimonial />
        </div>
      </div>
      <div className="w-full font-grotesk mt-12">
        <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
          Topics:
        </h1>
        <div className="flex justify-center w-full ">
          <FetchTopics
            selectedTopics={selectedTopics}
            handleTopicSelection={handleTopicSelection}
          />
        </div>
      </div>

      <div className="w-full font-grotesk mt-12">
        <h1 className="text-2xl sm:text-3xl mb-5 text-left max-w-[900px] mx-auto">
          Latest News:
        </h1>
        <div className="flex justify-center w-full ">
          <LatestNews displayLimit={3} />
        </div>
      </div>

      <div className="flex justify-center mt-12 mb-5">
        <button
          onClick={() => navigate("/explore")}
          className="transition hover:opacity-80"
        >
          <img
            src={downArrow}
            alt="Down Arrow"
            value="View More"
            className="w-6 h-6"
          />
        </button>
      </div>
    </div>
  );
}

export default Home;
