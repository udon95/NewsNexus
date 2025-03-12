import React, { useState } from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";

export const FreeSubmitTest = ({rating, setRating}) => {
  const [test, setTest] = useState("");

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-medium text-black max-md:px-4 max-md:pb-24">
              dhsaoijdiosajidosaiodasj
              
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeSubmitTest;
