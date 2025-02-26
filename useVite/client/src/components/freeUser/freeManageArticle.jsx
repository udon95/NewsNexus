import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../index.css";
import SidebarFree from "./freeSideBar.jsx";
import ArticleList from "../articleList.jsx";

const postedArticles = [
  "Personal Top 10 Singaporean Xiao Mei Mei",
  "Latest Malaysian Forest Fire",
  "US Currency Strengthens again",
];

const draftArticles = [
  "Personal Reflection of 2024 Economics",
  "An Objective View of ASEAN Political Landscape",
];

export const FreeManageMyArticles = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full px-6 md:px-10 pt-8 pb-12 w-full text-2xl font-medium text-black max-md:px-4 max-md:pb-24">
              <ArticleList
                title="My Posted Articles :"
                articles={postedArticles}
              />
              <ArticleList title="My Drafts :" articles={draftArticles} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeManageMyArticles;
