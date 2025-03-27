import React, { useState } from "react";
import Rating from "@mui/material/Rating";

export const FreeSubmitTest = ({ rating, setRating }) => {
  const [share, setShare] = useState("");
  const [areas, setAreas] = useState("");

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              <label className="text-2xl font-bold font-grotesk mb-1">
                Share Your Experience :
              </label>

              {/* ⭐ Half-Star Rating Inside a Box */}
              <div className="mb-4 w-3/3 md:w-2/3 h-18 p-3 border rounded-lg shadow-sm bg-white flex flex-col">
                <label className="text-sm">
                  Overall Experience 
                </label>
                
                <Rating
                  name="half-rating"
                  value={rating}
                  precision={0.5}
                  onChange={(event, newValue) => setRating(newValue)}
                  max={4}
                />
              </div>

              <div className="mb-4 relative w-3/3 md:w-2/3">
                <label>
                  Share with others 
                </label>
                <textarea
                  id="floatingTextarea1"
                  value={share}
                  onChange={(e) => setShare(e.target.value)}
                  className="flex w-full h-40 p-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>          

              <div className="mb-4 relative w-3/3 md:w-2/3">
                <label>
                  Areas of improvement
                </label>
                <textarea
                  id="floatingTextarea2"
                  value={areas}
                  onChange={(e) => setAreas(e.target.value)}
                  className="flex w-full h-40 p-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>               
              </div>

              <div className="flex justify-end gap-2 w-3/3 md:w-2/3">
                <button className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md">
                  Submit
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeSubmitTest;