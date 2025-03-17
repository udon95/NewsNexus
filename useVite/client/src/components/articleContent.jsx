import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import articleImage from "../assets/test.png"; // Import the article image
import useAuthHook from "../hooks/useAuth";
import { ArrowLeft } from "lucide-react";

const ArticleContent = ({ articleRef }) => {
  const { title } = useParams(); // Get the article title from URL
  const { user } = useAuthHook();
  const postDate = "22/01/2025"; // or dynamic date from article
  const fakeAuthor = { userid: "fake123", username: "John Doe" };
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 mx-auto max-w-4xl font-grotesk">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 text-blue-600 underline flex items-center"
      >
        <ArrowLeft/> Back
      </button>
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
        Posted by{" "}
        <Link
          to={`/public-profile/${(user || fakeAuthor).userid}`}
          className="underline hover:text-blue-600"
        >
          {(user || fakeAuthor).username}
        </Link>{" "}
        on {postDate}
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
