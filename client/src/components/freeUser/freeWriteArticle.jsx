import React, { useState } from "react";
import Medialogo from "/src/assets/Medialogo.svg";
import { useNavigate } from "react-router-dom";
import { useArticleContext } from "/src/context/ArticleContext";

export const FreeWriteArticle = () => {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [media, setMedia] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selection, setSelection] = useState("");
  const navigate = useNavigate();
  const { addArticle } = useArticleContext();

  const topicOptions = [
    "Finance",
    "Politics",
    "Entertainment",
    "Sports",
    "Weather",
    "Lifestyle",
    "Beauty",
    "Hollywood",
    "China",
    "Horticulture",
    "Culinary",
    "LGBTQ++",
    "Singapore",
    "Environment",
    "Investment",
    "USA",
    "Luxury",
    "Korea",
  ];
  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setMedia(URL.createObjectURL(file));
    } else {
      setMedia(null);
    }
  };

  const handleClearInputs = () => {
    setTitle("");
    setTopics("");
    setArticleContent("");
    setMedia(null);
    setShowConfirm(false);
    setSelection("");
  };

  const handleNavigation = (type) => {
    if (!title.trim()) {
      alert("Title cannot be empty!");
      return;
    }
    addArticle(title, type);
    navigate("/freeDashboard/manageArticles");
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <main className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <section className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-medium text-black font-grotesk max-md:px-4 max-md:pb-24">
              <div className="mb-6">
                <label className="text-2xl font-bold font-grotesk mb-1">
                  Article Title :
                </label>
                <div className="flex items-center justify-center w-3/3 md:w-2/3 h-18 cursor-pointer gap-3">
                  {/* Title Input */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="p-2 border rounded-lg shadow-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-[48%]"
                  />
                  {/* Topics Dropdown */}
                  <select
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    className="p-2 border rounded-lg shadow-sm bg-white font-grotesk text-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-[48%]"
                  >
                    <option value="" disabled hidden>
                      Select Topics
                    </option>
                    {topicOptions.map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  {/* Post location */}
                  <div className="relative">
                    <button
                      className="px-4 py-2 bg-black font-grotesk text-white rounded-lg shadow-md flex items-center"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      V
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full left-0 bg-white shadow-md border border-gray-300 rounded-lg min-w-[120px] z-50 ">
                        <ul className="flex flex-col">
                          <li>
                            <button
                              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                              onClick={() => {
                                setSelection("General");
                                setShowDropdown(false);
                              }}
                            >
                              General{" "}
                              {selection === "General" && <span>✔</span>}
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="mb-6">
                <label className="text-2xl font-bold font-grotesk mb-1">Media :</label>
                <div
                  className="flex items-center justify-center w-3/3 md:w-2/3 h-20 mt-1 border-2 border-dashed border-gray-400 rounded-lg bg-white cursor-pointer  gap-3"
                  onClick={() => document.getElementById("fileUpload").click()}
                >
                  <input
                    type="file"
                    id="fileUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                  {media ? (
                    <img
                      src={media}
                      alt="Uploaded Preview"
                      className="h-full w-auto rounded-lg"
                    />
                  ) : (
                    <img
                      src={Medialogo}
                      alt="Media Upload Icon"
                      className="h-12 w-12 text-gray-500"
                    />
                  )}
                </div>
              </div>

              {/* Write Article Section */}
              <div className="mb-6">
                <label className="text-2xl font-bold font-grotesk mb-1">
                  Write Article:
                </label>
                <textarea
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="flex items-center justify-center w-3/3 md:w-2/3 h-100 p-2 border rounded-lg shadow-sm bg-white text-black font-normal text-xl focus:outline-none focus:ring-2 focus:ring-blue-400  gap-3"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 w-3/3 md:w-2/3">
                <button 
                  className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md"
                  onClick={() => handleNavigation("draft")}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md"
                  onClick={() => setShowConfirm(true)}
                >
                  Delete
                </button>
                <button 
                  className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md"
                  onClick={() => handleNavigation("posted")}
                >
                  Post
                </button>
              </div>

              {/* Confirmation Modal */}
              {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <p className="text-xl font-semibold mb-4">
                      Are you sure you want to delete?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        className="px-4 py-2 text-white bg-red-500 rounded-lg shadow-md"
                        onClick={handleClearInputs}
                      >
                        Confirm
                      </button>
                      <button
                        className="px-4 py-2 text-black bg-gray-300 rounded-lg shadow-md"
                        onClick={() => setShowConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreeWriteArticle;
