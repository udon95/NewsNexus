import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import supabase from "../../api/supabaseClient";

export const PremiumSubmitTest = () => {
  const [rating, setRating] = useState(null);
  const [share, setShare] = useState("");
  const [areas, setAreas] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitTest = async () => {
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) {
      alert("User not authenticated. Cannot upload.");
      return;
    }
  
    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
  
    if (!session) {
      alert("User not authenticated. Cannot upload.");
      return;
    }
  
    if (rating == null || share.trim() === "" || areas.trim() === "") {
      alert("Please fill in all required fields.");
      return;
    }    
    
    setIsLoading(true);
    const { error } = await supabase.from("testimonial").insert([
      {
        userid: session.userid,
        rating: rating,
        share_experience: share,
        areas_to_improve: areas,
      },
    ]);
    setIsLoading(false);
  
    if (error) {
      alert("Something went wrong. Try again.");
      return;
    }
  
    alert("Testimonial submitted successfully!");
    setShare("");
    setAreas("");
    setRating(null); 
  };  

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full max-w-4xl p-10 max-md:flex-col gap-6">       
        <div className="flex flex-col w-full">
          <label className="text-3xl font-bold mb-1">
            Share Your Experience :
          </label>
          <div className="mb-4 relative">
            <label className="text-xl font-semibold mb-1">
              Share with others 
            </label>
            <div className="h-12 p-3 border rounded-t-lg shadow-sm bg-white flex flex-col">
              <Rating
                name="half-rating"
                value={rating}
                precision={0.5}
                onChange={(event, newValue) => setRating(newValue)}
                max={4}
              />
            </div>
            <textarea
              id="Textarea1"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              className="flex w-full h-40 p-2 border rounded-b-lg shadow-sm bg-white"
            ></textarea>
          </div>          

          <div className="mb-4 relative">
            <label className="text-xl font-semibold mb-1">
              Areas of improvement
            </label>
            <textarea
              id="Textarea2"
              value={areas}
              onChange={(e) => setAreas(e.target.value)}
              className="flex w-full h-40 p-2 border rounded-lg shadow-sm bg-white"
            ></textarea>               
          </div>

          <div className="flex justify-end gap-2">
            <button 
              className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md disabled:opacity-50"
              onClick={handleSubmitTest}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumSubmitTest;