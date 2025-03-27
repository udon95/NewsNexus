import React, { useState, useEffect } from "react";
import Medialogo from "/src/assets/Medialogo.svg";
import { useNavigate } from "react-router-dom";
import { useArticleContext } from "/src/context/ArticleContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-blue-600 underline hover:opacity-80 cursor-pointer',
        },
      }),
    ],    
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full">
      <div className="flex gap-2 flex-wrap bg-white px-3 py-2 border rounded-t-lg">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="font-bold px-2 py-1 hover:bg-gray-100">B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="italic px-2 py-1 hover:bg-gray-100">I</button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className="underline px-2 py-1 hover:bg-gray-100">U</button>
        <button
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          className="text-blue-600 underline px-2 py-1 hover:bg-gray-100"
        >
          Link
        </button>
        <button onClick={() => editor?.chain().focus().unsetLink().run()} className="px-2 py-1 hover:bg-gray-100">
          Unlink
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="w-full h-80 overflow-y-auto p-2 border rounded-b-lg shadow-sm bg-white [&_*:focus]:outline-none"
        onClick={() => editor?.chain().focus().run()}
      />
    </div>
  );
};

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
  const [resetKey, setResetKey] = useState(0);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".post-location-dropdown")) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);  

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
    setResetKey((prev) => prev + 1);
  };

  const handleNavigation = (type) => {
    if (!title.trim()) {
      alert("Title cannot be empty!");
      return;
    }
  
    // ✅ Enforce max word length (30 characters per word)
    const words = title.split(" ");
    for (let word of words) {
      if (word.length > 20) {
        alert("Please avoid long unbroken words (Max: 20 characters per word)");
        return;
      }
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
                  <div className="relative post-location-dropdown">
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
                <label className="text-2xl font-bold font-grotesk mb-1">
                  Media :
                </label>
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
                <label className="text-2xl font-bold font-grotesk mb-1">Write Article:</label>
                <div className="w-3/3 md:w-2/3">
                  <TiptapEditor value={articleContent} onChange={setArticleContent} key={resetKey}/>
                </div>
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