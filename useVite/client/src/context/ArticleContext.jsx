import React, { createContext, useContext, useState, useEffect } from "react";

const ArticleContext = createContext();

export const useArticleContext = () => useContext(ArticleContext);

const initialPostedArticles = [
  "Personal Top 10 Singaporean Xiao Mei Mei",
  "Latest Malaysian Forest Fire",
  "US Currency Strengthens again",
];

const initialDraftArticles = [
  "Personal Reflection of 2024 Economics",
  "An Objective View of ASEAN Political Landscape",
];

export const ArticleProvider = ({ children }) => {
  const [postedArticles, setPostedArticles] = useState(
    JSON.parse(sessionStorage.getItem("postedArticles")) || []
  );

  const [draftArticles, setDraftArticles] = useState(
    JSON.parse(sessionStorage.getItem("draftArticles")) || []
  );

  useEffect(() => {
    sessionStorage.setItem("postedArticles", JSON.stringify(postedArticles));
    sessionStorage.setItem("draftArticles", JSON.stringify(draftArticles));
  }, [postedArticles, draftArticles]);

  const addArticle = (title, type) => {
    if (!title.trim()) return;

    if (type === "posted") {
      setPostedArticles((prev) => [title, ...prev]);
    } else if (type === "draft") {
      setDraftArticles((prev) => [title, ...prev]);
    }
  };

  return (
    <ArticleContext.Provider
      value={{
        postedArticles: [...initialPostedArticles, ...postedArticles],
        draftArticles: [...initialDraftArticles, ...draftArticles],
        addArticle,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};