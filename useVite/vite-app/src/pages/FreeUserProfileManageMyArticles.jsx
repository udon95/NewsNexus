import React from "react";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import "../index.css";
import SidebarFree from "../components/SidebarFree.jsx";

const ArticleList = ({ title, articles }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Tracks which article's menu is open

  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="space-y-2">
        {articles.map((article, index) => (
          <li
            key={index}
            className="relative flex justify-between items-center gap-3 py-2 px-4 rounded-lg bg-white shadow-lg border border-gray-300"
          >
            {/* Number and Article Name */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-black">{index + 1}.</span>
              <span className="text-lg text-black">{article}</span>
            </div>

            {/* Three-Dot Menu Button */}
            <button
              className="p-2 text-2xl font-bold text-gray-600 hover:text-black"
              onClick={() =>
                setOpenMenuIndex(openMenuIndex === index ? null : index)
              }
            >
              ⋮
            </button>

            {/* Dropdown Menu (Appears on Click) */}
            {openMenuIndex === index && (
              <div className="absolute top-10 right-4 bg-white shadow-md border border-gray-300 rounded-lg py-2 w-36 z-10">
                <ul className="flex flex-col">
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Edit
                    </button>
                  </li>
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Delete
                    </button>
                  </li>
                  <li>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                      Share
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

const postedArticles = [
  "Personal Top 10 Singaporean Xiao Mei Mei",
  "Latest Malaysian Forest Fire",
  "US Currency Strengthens again",
];

const draftArticles = [
  "Personal Reflection of 2024 Economics",
  "An Objective View of ASEAN Political Landscape",
];

export const FreeUserProfileManageMyArticles = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto"> 
      <main className="flex-grow w-full flex min-h-full overflow-auto"> 
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <aside className="w-1/4 min-h-full bg-blue-200 max-md:w-full">
            <SidebarFree />
          </aside>

          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full px-6 md:px-10 pt-8 pb-12 w-full text-2xl font-medium text-black max-md:px-4 max-md:pb-24">
              <ArticleList title="My Posted Articles :" articles={postedArticles} />
              <ArticleList title="My Drafts :" articles={draftArticles} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeUserProfileManageMyArticles;