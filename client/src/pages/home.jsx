  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import "../index.css";
  import Navbar from "../components/navbar.jsx";
  // import Search from "../components/search.jsx";
  import Testimonial from "../components/testimonial.jsx";
  import LatestNews from "../components/latestNews.jsx";
  import downArrow from "../assets/DownArrow.svg";
  import useAuthHook from "../hooks/useAuth.jsx";
  import FetchTopics from "../components/fetchTopics.jsx";
  import VideoComponent from "../components/featureVideo.jsx";
  import ComparisonTable from "../components/comparisonTable.jsx";
  import ProgressOverlay from "../components/progressOverlay.jsx";
  import FloatingUserStats from "../components/floatingUserStats";


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


    // if (loading) {
    //   return <p>Loading...</p>; // Prevents flickering before user is set
    // }


    return (
      <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
        <div className="w-full h-[300px] bg-[#7FB0FE]">
        <div
          className="
            max-w-screen-xl
            mx-auto
            px-14
            sm:px-6
            md:px-8
            lg:px-12
            h-full
            relative
            flex
            flex-col
            justify-center
          "
        >


            <div className="grid grid-cols-1 sm:grid-cols-2 items-center h-full gap-4">
              {/* LEFT SIDE: Title + Subtitle stacked */}
              <div>
              <h1 className="text-black text-4xl font-bold font-grotesk w-[300px]">
                Navigating the Singaporean News Landscape
              </h1>
              <p className="mt-4 text-sm font-medium" style={{ color: "#00317F" }}>
                Join us in building a smarter, fact-powered news space.
                </p>
              </div>


              {/* RIGHT SIDE: Counter overlay remains aligned right */}
              <div className="sm:justify-self-end w-full sm:w-auto flex justify-center sm:justify-end">
                <ProgressOverlay />
              </div>
            </div>


            <div className="flex justify-left gap-3 mt-4 sm:mt-4 sm:ml-10">
              {/* {!user && !loading && (
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
              )} */}
            </div>
          </div>
        </div>
        <Navbar />
        <div className="flex flex-col lg:flex-row gap-4 px-4">
    {user && (
      <div className="sticky top-4 self-start w-full lg:w-[100px] left-25">
        <FloatingUserStats user={user} />
      </div>
    )}

    
        {/* <div className="flex justify-center w-full mt-12">
          {userType !== "Premium" && (
            <button
              onClick={handleGoToDiscussionRooms}
              className="w-full max-w-[900px] bg-gray-100 text-left text-black text-3xl font-grotesk font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
            >
              Go To Discussion Rooms &gt;
            </button>
          )}{" "}
        </div> */}
  <div className="flex-1">
        <VideoComponent />
        <ComparisonTable />


          {/* Testimonials header aligned */}
          <div className="w-full max-w-[1000px] mx-auto font-grotesk mt-12 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-5 text-left">Testimonials:</h1>
          </div>


          {/* Testimonials content full-width like video */}
          <div className="w-full max-w-[1100px] mx-auto px-4 mb-12">
            <Testimonial />
          </div>


          {/* Topics header aligned */}
          <div className="w-full max-w-[1000px] mx-auto font-grotesk px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-5 text-left">Topics:</h1>
          </div>


          {/* Topics pills content full-width like video */}
          <div className="w-full max-w-[1100px] mx-auto px-4">
            <FetchTopics
              selectedTopics={selectedTopics}
              handleTopicSelection={handleTopicSelection}
            />
          </div>


          {/* "Latest News:" header matches alignment with other sections */}
          <div className="w-full max-w-[1000px] mx-auto font-grotesk mt-12 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-5 text-left">Latest News:</h1>
          </div>


          {/* Cards stretch like the video width */}
          <div className="w-full max-w-[1030px] mx-auto px-4">
            <LatestNews displayLimit={3} />
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
        </div>
      </div>
    );
  }


  export default Home;

