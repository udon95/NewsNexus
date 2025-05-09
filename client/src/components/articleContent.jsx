import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ArticleContent = ({ articleRef, text, postDate, author, imagepath }) => {
  const navigate = useNavigate();

  const cleanedHTML = (() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    // Remove <img> tags that match the imagepath
    if (imagepath) {
      const imgTags = doc.querySelectorAll("img");
      imgTags.forEach((img) => {
        if (img.src === imagepath) {
          img.remove();
        } else {
          // Add styling class to other images
          img.className =
            "w-full h-auto object-cover my-6 bg-gray-300";
        }
      });
    }

    return doc.body.innerHTML;
  })();

  const usernameValue = (typeof author === "object" && author?.username) || author;


  return (
    <div className="flex flex-col w-full font-grotesk">

      {/* Post Meta */}
      {/* <span className="text-lg text-[#00317F] mb-4 self-start">
        Posted by{" "}
        <Link
          to={`/public-profile/${usernameValue}`}
          className="underline hover:text-blue-600"
        >
          {usernameValue}
        </Link>{" "}
        on {postDate}
      </span> */}

      {/* Article Body */}
      <div
        ref={articleRef}
        className="text-lg sm:text-xl font-medium text-black leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: cleanedHTML }}
      />
    </div>
  );
};

export default ArticleContent;
