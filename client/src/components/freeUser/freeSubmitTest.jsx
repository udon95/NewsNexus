import React, { useState } from "react";
import Rating from "@mui/material/Rating";

export const FreeSubmitTest = ({ rating, setRating }) => {
  const [test, setTest] = useState("");

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full max-w-[800px] text-2xl font-bold text-black max-md:px-4 max-md:pb-24">              
                <label>Rate :</label>
                {/* ⭐ Half-Star Rating with MUI */}
                <Rating
                  name="half-rating"
                  value={rating}
                  precision={0.5}
                  onChange={(event, newValue) => setRating(newValue)}
                  max={4}
                />                
                
              <div className="mb-4">
                <label>Share Your Experience :</label>
                <textarea
                  value={test}
                  onChange={(e) => setTest(e.target.value)}
                  className="w-full max-w-[800px] h-96 p-2 border rounded-lg shadow-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 max-w-[800px]">
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
