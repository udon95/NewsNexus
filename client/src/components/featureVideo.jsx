import React, { useEffect, useState } from "react";
import supabase from "../api/supabaseClient"; // Assuming your Supabase client is set up

const VideoComponent = () => {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Fetch the video where `displayed` is true
        const { data, error } = await supabase
          .from("feature_videos")  // Assuming the table is called "videos"
          .select("link, displayed, name")
          .eq("displayed", true)  // Only fetch videos where `displayed` is true

        if (error) throw error;
        setVideoData(data[0]);  // Assuming only one video is displayed
        setLoading(false);  // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching video:", error.message);
        setLoading(false);
      }
    };

    fetchVideo();  // Call the fetch function when the component mounts
  }, []);

  if (loading) {
    return <div>Loading video...</div>;  // Loading state
  }

  // If no video is found or displayed, don't render the video element
  if (!videoData) {
    return <div>No video available to display.</div>;
  }

  return (
    <div className="flex justify-center w-full mt-10 font-grotesk">
      <div className="relative w-full max-w-[900px] bg-gray-300 rounded-lg shadow-md">
        {/* Text Overlay */}
        <p className="absolute top-3 left-4 text-black font-bold text-3xl z-10">
          Features :
        </p>

        {/* Video Element */}
        <video autoPlay loop muted className="w-full max-h-[400px]" controls>
          <source src={videoData.link} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoComponent;
