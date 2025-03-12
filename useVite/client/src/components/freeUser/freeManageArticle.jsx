import React from "react";
import ArticleList from "../articleList.jsx";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Function to Handle Clicking an Article
  const handleArticleClick = (article) => {
    console.log(`Clicked on: ${article}`);
    navigate(`/article/${encodeURIComponent(article)}`); // Navigates to article page
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              <ArticleList
                title="My Posted Articles :"
                articles={postedArticles}
                isDraft={false}
                onArticleClick={handleArticleClick}
              />
              <ArticleList
                title="My Drafts :"
                articles={draftArticles}
                isDraft={true}
                onArticleClick={handleArticleClick}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeManageMyArticles;
