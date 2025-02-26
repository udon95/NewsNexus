import React from "react";
import {  useParams } from "react-router-dom";
import articleImage from "../assets/test.png"; // Import the article image

const ArticleContent = ({articleRef}) => {
  const { title } = useParams(); // Get the article title from URL

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 mx-auto max-w-4xl font-grotesk">
      {/* Article Title */}
      <h1 className="font-grotesk text-4xl sm:text-5xl font-bold text-black text-left">
        {decodeURIComponent(title)}
      </h1>

      {/* Article Image */}
      <img
        src={articleImage}
        alt="Article"
        className="w-full rounded-lg my-6 bg-gray-300"
      />

      {/* 🔄 Moved Date to Bottom Left */}
      <span className="text-lg text-[#00317F] mb-4 self-start">
        Posted by Author on 22/01/2025
      </span>

      {/* Expanded Article Content */}
      <div
        ref={articleRef}
        className="text-lg sm:text-xl font-medium text-black leading-relaxed space-y-6"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
          convallis odio at lacus fermentum, sit amet molestie dolor convallis.
          Quisque imperdiet nibh in nisl congue, non vehicula lectus tristique.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </p>
        <p>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident.
        </p>
      </div>
    </div>
  );
};

export default ArticleContent;
