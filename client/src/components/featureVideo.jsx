import React, { useEffect, useState } from "react";
import supabase from "../api/supabaseClient"; // Assuming your Supabase client is set up

const VideoComponent = () => {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [textColor, setTextColor] = useState("black");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Fetch the video where `displayed` is true
        const { data, error } = await supabase
          .from("feature_videos") // Assuming the table is called "videos"
          .select("link, displayed, name")
          .eq("displayed", true); // Only fetch videos where `displayed` is true

        if (error) throw error;
        setVideoData(data[0]); // Assuming only one video is displayed
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching video:", error.message);
        setLoading(false);
      }
    };

    fetchVideo(); // Call the fetch function when the component mounts
  }, []);

  if (loading) {
    return <div>Loading video...</div>; // Loading state
  }

  // If no video is found or displayed, don't render the video element
  if (!videoData) {
    return <div>No video available to display.</div>;
  }

  const getLuminance = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Convert RGB to relative luminance using the formula
    const a = [r, g, b].map((x) =>
      x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    );
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getTextColor = (color) => {
    const luminance = getLuminance(color);
    return luminance > 0.5 ? "black" : "white"; // Dark background -> Light text, and vice versa
  };

  return (
    <div className="flex justify-center w-full mt-10 font-grotesk">
      <div className="relative w-full max-w-[900px] bg-gray-300 rounded-lg shadow-md">
        {/* Text Overlay */}
        <p
          className="absolute top-3 left-4 text-black font-bold text-3xl z-10 bg-white"
          style={{ color: textColor }}
        >
          Features :
        </p>

        {/* Video Element */}
        <video
          autoPlay
          loop
          muted
          className="w-full max-h-[400px] object-cover"
          controls
        >
          <source src={videoData.link} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoComponent;
