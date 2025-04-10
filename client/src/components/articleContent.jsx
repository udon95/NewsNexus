import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import articleImage from "../assets/test.png"; // Import the article image
import useAuthHook from "../hooks/useAuth";
// import { ArrowLeft } from "lucide-react";

const ArticleContent = ({ articleRef, title, text, imagepath, postDate, author }) => {
  // const { title } = useParams(); // Get the article title from URL
  // const { user } = useAuthHook();
  // const postDate = "22/01/2025"; // or dynamic date from article
  // const fakeAuthor = { userid: "fake123", username: "John Doe" };
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 mx-auto max-w-4xl font-grotesk">
      {/* Title */}
      <h1 className="font-grotesk text-4xl sm:text-5xl font-bold text-black text-left">
        {title}
      </h1>

      {/* Image at the top */}
      {imagepath && (
        <img
          src={imagepath}
          alt="Article"
          className="w-full h-auto object-cover my-6 bg-gray-300"  // Full width, maintain aspect ratio
        />
      )}

      {/* Post Meta */}
      <span className="text-lg text-[#00317F] mb-4 self-start">
        Posted by{" "}
        <Link
          to={`/public-profile/${author?.userid}`}
          className="underline hover:text-blue-600"
        >
          {author?.username}
        </Link>{" "}
        on {postDate}
      </span>

      {/* Article Body */}
      <div
        ref={articleRef}
        className="text-lg sm:text-xl font-medium text-black leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{
          __html: text.replace(
            /<img/g,
            '<img class="w-full h-auto object-cover my-6 bg-gray-300"'
          )
        }}
      />
    </div>
  );
};

export default ArticleContent;