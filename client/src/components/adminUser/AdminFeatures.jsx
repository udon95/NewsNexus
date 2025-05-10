import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";
import { Pause } from "lucide-react";

const AdminFeatures = () => {
  const [featureVideos, setFeatureVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const videoRef = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Fetch the video where `displayed` is true
        const { data, error } = await supabase
          .from("feature_videos") // Assuming the table is called "videos"
          .select("*")
          .order("displayed", { ascending: false });
        if (error) throw error;
        setFeatureVideos(data); // Assuming only one video is displayed
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching video:", error.message);
        alert("Error fetching video:", error.message);
        setLoading(false);
      }
    };
    fetchVideo(); // Call the fetch function when the component mounts
  }, []);

  if (loading) {
    return <div>Loading video...</div>; // Loading state
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

  const changeVideoData = (video) => {
    setVideoData(null);

    setVideoData(video);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("feature-video")
        .upload(`${selectedFile.name}`, selectedFile, {
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error("Error uploading video:", uploadError);
        alert("Error uploading video:", uploadError);
      } else {
        // Retrieve public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from("feature-video")
          .getPublicUrl(`${selectedFile.name}`);

        const publicUrl = publicUrlData.publicUrl;

        // Insert video metadata into 'feature_videos' table
        const { data: insertData, error: insertError } = await supabase
          .from("feature_videos")
          .insert([{ name: selectedFile.name, link: publicUrl }])
          .select();
        if (insertError) {
          console.error("Error inserting video metadata:", insertError);
          alert("Error inserting video metadata:", insertError);
        } else {
          alert("Upload successful!");
          setFeatureVideos((prev) => [...prev, ...insertData]);
        }
      }
    }
  };

  const handleSetDisplayed = async (selectedVideo) => {
    // Step 1: Set all videos to displayed: false
    const { error: resetError } = await supabase
      .from("feature_videos")
      .update({ displayed: false })
      .eq("displayed", true);
    if (resetError) {
      console.error("Error resetting displayed videos:", resetError);
      return;
    }

    const { error: setError } = await supabase
      .from("feature_videos")
      .update({ displayed: true })
      .eq("id", selectedVideo.id);
    if (setError) {
      console.error("Error setting selected video as displayed:", setError);
      return;
    }

    setFeatureVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === selectedVideo.id
          ? { ...video, displayed: true }
          : { ...video, displayed: false }
      )
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Upload Video:
          </div>
          <input
            type="file"
            className="ml-10 mt-5 min-w-[700px] min-h-[200px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            onChange={(e) => handleFileChange(e)}
          />
          <button
            type="button"
            className="flex px-6 py-3 ml-10 mt-7 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
            onClick={handleUpload}
          >
            Upload
          </button>

          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Feature Videos:
          </div>

          {videoData ? (
            <div className="flex w-full mt-10 ml-10 font-grotesk">
              <div className="relative w-full max-w-[900px] bg-gray-300 rounded-lg shadow-md">
                <video
                  key={videoData?.link}
                  autoPlay
                  className="w-full max-h-[400px] object-cover"
                  controls
                >
                  <source src={videoData?.link} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : (
            <div></div>
          )}

          {/* {featureVideos.map((video) => ( */}

              <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
              <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Video </th>
                  <th className="p-3">Displayed </th>
                  <th className="p-3"></th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {featureVideos.map((video, index) => (
                  <tr
                    key={video.id}
                    className="cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{video.name}</td>
                    <td className="p-3">{video.displayed}</td>
                    <td className="p-3">{              
                      <button
                        type="button"
                        className="px-6 py-3 ml-5 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                        onClick={() => changeVideoData(video)}
                      >
                        View
                      </button>}</td>
                    <td className="p-3">{                
                      <button
                        type="button"
                        className={`px-6 py-3 ml-5 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer ${
                          video.displayed ? 'bg-red-600' : 'bg-[#3F414C]'}`}
                        onClick={() => handleSetDisplayed(video)}
                      >
                        {video.displayed ? "Remove" : "Display"}
                      </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              </div>


            {/* <div key={video.id} className="flex items-center ml-10 mt-8">
              <div className="min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg  ">
                {video.name}
              </div>
              <button
                type="button"
                className="px-6 py-3 ml-5 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                onClick={() => changeVideoData(video)}
              >
                View
              </button>
              <button
                type="button"
                className="px-6 py-3 ml-5 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                onClick={() => handleSetDisplayed(video)}
              >
                {video.displayed ? "Displayed" : "Set as Displayed"}
              </button>
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminFeatures;
