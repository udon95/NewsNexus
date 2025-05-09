import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Highlighter,
} from "lucide-react";
import supabase from "../../api/supabaseClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import UnderlineExtension from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Extension } from "@tiptap/core";
import { Paragraph } from "@tiptap/extension-paragraph";

export const FreeWriteArticle = () => {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [images, setImages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [topicOptions, setTopicOptions] = useState([]);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;
  const editorRef = useRef(null);
  const [showTopicApplication, setShowTopicApplication] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [accuracy, setAccuracy] = useState(null);

  const CustomParagraph = Paragraph.extend({
    addAttributes() {
      return {
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            return {
              style: attributes.style || null,
            };
          },
        },
      };
    },
  });

  const IndentExtension = Extension.create({
    name: "custom-indent",
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          this.editor.commands.updateAttributes("paragraph", {
            style: "text-indent: 2em",
          });
          return true;
        },
        "Shift-Tab": () => {
          this.editor.commands.updateAttributes("paragraph", {
            style: "text-indent: 0",
          });
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      CustomParagraph,
      BulletList,
      OrderedList,
      UnderlineExtension,
      TiptapLink,
      Highlight,
      Image,
      IndentExtension, //INDENT
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your article..." }),
      TiptapLink.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setArticleContent(editor.getHTML());
      const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session:", session);

      if (!session?.user) {
        console.warn("No active Supabase session!");
      } else {
        console.log("Supabase user is authenticated");
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log(" Logged in");
      } else if (event === "SIGNED_OUT") {
        console.log(" Logged out");
      }
    });
  }, []);

  const MAX_WORDS = 1000;

  const handlePostArticle = async () => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) {
      alert("User not authenticated. Cannot upload.");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;

    if (!session) {
      alert("User not authenticated. Cannot upload.");
      return;
    }

    console.log("User from localStorage:", session);

    if (!title || !articleContent || !topics) {
      alert("Please fill in all required fields.");
      return;
    }

    let updatedHTML = articleContent;
    const bucket = "articles-images";
    let firstImageUrl = null;

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    for (const img of pendingImages) {
      const file = img.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { data: authSession } = await supabase.auth.getSession();
      const supabaseUid = authSession?.session?.user?.id;
      const filePath = `${supabaseUid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        alert("Image upload failed.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl; // Track first image URL
        updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);
      }
    }

    const articleData = {
      title,
      content: updatedHTML,
      created_by: session.userid, // Use session ID for the user
      created_at: new Date().toISOString(),
    };

    articleData.topic = topics;
    const topicName = topicOptions.find((t) => t.topicid === topics)?.name;

    const response = await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/submit-article",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: updatedHTML,
          type: "factual",
          authorId: session.userid,
          topicid: topics,
          topicName,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (result.feedback) {
        setAiFeedback(result.feedback);
        setAccuracy(result.accuracy || null);

        alert("Article flagged by AI. Please review the highlighted sections.");
      } else {
        alert(result.error || "Submission failed.");
      }

      //  This is important to prevent saving
      return;
    }

    const articleid = data?.[0]?.articleid;

    for (const img of pendingImages) {
      const fileExt = img.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${session.id}/${fileName}`;

      //HERE
      // await supabase.storage
      //   .from("articles-images")
      //   .upload(filePath, img.file, {
      //     cacheControl: "3600",
      //     upsert: false,
      //   });
      //HERE

      const { data: urlData } = supabase.storage
        .from("articles-images")
        .getPublicUrl(filePath);
      const imageUrl = urlData?.publicUrl;

      await supabase
        .from("article_images")
        .insert([{ articleid, image_url: imageUrl }]);
    }
    setAccuracy(result.accuracy);
    setAiFeedback(result.feedback);
    alert(`Article posted successfully. Accuracy Score: ${result.accuracy}%`);
    handleClearInputs();
  };

  const handleSaveDraft = async () => {
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) return alert("User not authenticated. Cannot save draft.");

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    if (!session) return alert("User not authenticated.");

    if (!title || !articleContent || !topics) {
      alert("Please fill in all required fields.");
      return;
    }

    let updatedHTML = articleContent;
    const bucket = "articles-images";
    let firstImageUrl = null;

    for (const img of pendingImages) {
      const file = img.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const { data: authSession } = await supabase.auth.getSession();
      const supabaseUid = authSession?.session?.user?.id;
      const filePath = `${supabaseUid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      if (uploadError) {
        alert("Image upload failed.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl;
        updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);
      }
    }

    const articleData = {
      title,
      text: updatedHTML,
      userid: session.userid,
      topicid: topics,
      time: new Date().toISOString(),
      imagepath: firstImageUrl || null,
      status: "Draft",
    };

    //HERE
    const { data: inserted, error: idError } = await supabase
      .from("articles")
      .insert([articleData])
      .select("articleid");

    if (idError) return alert("Failed to save draft.");

    const articleid = inserted?.[0]?.articleid;
    //HERE

    for (const img of pendingImages) {
      const fileExt = img.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${session.id}/${fileName}`;

      const { data: urlData } = supabase.storage
        .from("articles-images")
        .getPublicUrl(filePath);

      const imageUrl = urlData?.publicUrl;
      if (imageUrl) {
        await supabase
          .from("article_images")
          .insert([{ articleid, image_url: imageUrl }]);
      }
    }
    //HERE

    pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
    //HERE

    alert("Draft saved!");
    handleClearInputs();
  };

  const [pendingImages, setPendingImages] = useState([]);

  const handleEditorImageUpload = (e) => {
    //HERE
    if (pendingImages.length >= 1) {
      alert("Free users can only upload one image.");
      return;
    }
    const file = e.target.files[0];
    if (file.size > 50 * 1024 * 1024) {
      alert("Image exceeds 50MB size limit.");
      return;
    }  
    //HERE
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingImages((prev) => [...prev, { file, previewUrl }]);

      editor.chain().focus().setImage({ src: previewUrl }).run();
    }
    e.target.value = null;
  };

  // Fetch Topics from `topic_categories`
  useEffect(() => {
    const fetchTopics = async () => {
      // Fetch both topicid and name from the topic_categories table
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");

      if (!error && data) {
        setTopicOptions(data); // Data is an array of objects like { topicid, name }
      }
    };
    fetchTopics();
  }, []);

  const handleClearInputs = () => {
    setTitle("");
    setTopics("");
    setArticleContent("");
    setImages([]);
    setShowConfirm(false);
    setPendingImages([]);

    // Reset Tiptap editor content (this is the key)
    if (editor) {
      editor.commands.clearContent();
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .ProseMirror h1 {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 1rem 0;
      }
      .ProseMirror h2 {
        font-size: 2rem;
        font-weight: 600;
        margin: 0.75rem 0;
      }
      .ProseMirror h3 {
        font-size: 2.5rem;
        font-weight: 500;
        margin: 0.5rem 0;
      }
      .ProseMirror p {
        font-size: 1rem;
        margin: 0.5rem 0;
      }
      .ProseMirror ul {
        list-style-type: disc;
        margin-left: 1.5rem;
      }
      .ProseMirror ol {
        list-style-type: decimal;
        margin-left: 1.5rem;
      }
      .ProseMirror img {
        max-width: 100%;
        height: auto;
        margin: 1rem 0;
        border-radius: 8px;
        display: block;
      }
      .ProseMirror p[style*="text-indent"] {
        transition: all 0.2s ease;
      }
      .ProseMirror p[style*="text-indent"] {
        transition: all 0.2s ease;
      }
      .ProseMirror a {
        color: #2563eb; /* Tailwind blue-600 */
        text-decoration: underline;
        cursor: pointer;
      }
      .ProseMirror mark {
        background-color: #bfd8ff;
        padding: 0 2px;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style); // Cleanup
  }, []);

  const handleSubmitTopicApplication = async () => {
    if (!newTopicName.trim()) {
      alert("Please enter a topic name.");
      return;
    }

    const { error } = await supabase.from("topic_applications").insert([
      {
        requested_by: userId,
        topic_name: newTopicName.trim(),
        status: "Pending",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Failed to apply for topic.");
    } else {
      alert(
        "Topic application submitted! Admins will review it when enough users request it."
      );
      setShowTopicApplication(false);
      setNewTopicName("");
    }
  };

  //HERE
  useEffect(() => {
    if (!editor) return;
  
    const handlePaste = (event) => {
      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;
  
      for (const item of clipboardItems) {
        if (item.type.startsWith("image/")) {
          event.preventDefault();
          alert("Pasting images is disabled. Please use the Upload button.");
          return;
        }
      }
    };
  
    const editorElement = editor?.view?.dom;
    if (editorElement) {
      editorElement.addEventListener("paste", handlePaste);
      editorElement.addEventListener("drop", (event) => {
        const hasImage = Array.from(event.dataTransfer?.items || []).some((item) =>
          item.type.startsWith("image/")
        );
        if (hasImage) {
          event.preventDefault();
          alert("Dragging and dropping images is disabled. Please use the Upload button.");
        }
      });      
    }
  
    return () => {
      if (editorElement) {
        editorElement.removeEventListener("paste", handlePaste);
      }
    };
  }, [editor]);  
  //HERE

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full max-w-4xl p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold mb-1">Publish Your Articles :</h1>

        <div className="flex flex-col gap-5 w-full">
          <div>
            <label className="block text-xl font-semibold mb-1">
              Article Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            />
          </div>

          <div>
            <label className="block text-xl font-semibold mb-1">Topic:</label>

            <div className="flex items-center gap-2 w-full">
              <div className="relative w-full">
                <div
                  onClick={() => setShowTopicsDropdown(!showTopicsDropdown)}
                  className="p-2 border rounded-md bg-white w-full cursor-pointer flex justify-between items-center"
                >
                  {/* {topics || "Select a topic"} */}
                  {topics
                    ? topicOptions.find((t) => t.topicid === topics)?.name
                    : "Select a topic"}
                  <button
                    className="ml-2 text-gray-500 text-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents double toggle
                      setShowTopicsDropdown(!showTopicsDropdown);
                    }}
                  >
                    {showTopicsDropdown ? "▲" : "▼"}
                  </button>{" "}
                </div>

                {showTopicsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {topicOptions.map((topic, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setTopics(topic.topicid);
                          setShowTopicsDropdown(false);
                        }}
                        className="p-2 hover:bg-indigo-100 cursor-pointer text-black font-medium"
                      >
                        {topic.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="bg-black text-white rounded-md p-2 flex items-center justify-center h-full"
                onClick={() => setShowTopicApplication(true)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xl font-semibold mb-1">
              Article Content:
            </label>
            {editor ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="imageUploadInput"
                  className="hidden"
                  onChange={handleEditorImageUpload}
                />
                <button
                  className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md"
                  onClick={() =>
                    document.getElementById("imageUploadInput").click()
                  }
                >
                  Upload Image
                </button>

                <div className="flex flex-wrap items-center gap-2 bg-white p-3 mt-4 border rounded-lg shadow-md text-sm font-medium">
                  <select
                    onChange={(e) => {
                      const level = parseInt(e.target.value);
                      if (level === 0) {
                        editor.chain().focus().setParagraph().run();
                      } else {
                        editor.chain().focus().toggleHeading({ level }).run();
                      }
                    }}
                    className="border rounded px-2 py-1"
                    defaultValue="0"
                  >
                    <option value="0">Normal</option>
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                  </select>

                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <UnderlineIcon size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <AlignRight size={16} />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleHighlight().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Highlighter size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setLinkUrl("");
                      setShowLinkModal(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <LinkIcon size={16} />
                  </button>
                </div>
                {(accuracy !== null || aiFeedback) && (
                  <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded text-sm text-black">
                    <strong>Fact Check Results:</strong>
                    {accuracy !== null && (
                      <p>
                        <strong>Accuracy: </strong>
                        {accuracy}%
                      </p>
                    )}
                    <p>
                      <strong>Feedback: </strong>
                    </p>
                    <div
                      className="mt-1"
                      dangerouslySetInnerHTML={{ __html: aiFeedback }}
                    />
                  </div>
                )}

                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md bg-white p-4 mt-3 focus-within:outline-none"
                  onClick={() => editor.commands.focus()}
                >
                  <EditorContent
                    editor={editor}
                    className="min-h-[200px] w-full outline-none p-2 text-base leading-relaxed"
                    style={{ lineHeight: "1.75" }}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Word Count: {wordCount} / {MAX_WORDS}
                </p>
              </>
            ) : (
              <p className="text-gray-500">Loading editor...</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
            >
              Clear
            </button>

            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={handlePostArticle}
            >
              Post
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <p className="text-lg font-semibold mb-4">Clear all fields?</p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={handleClearInputs}
                >
                  Confirm
                </button>
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showTopicApplication && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
              <h2 className="text-xl font-semibold mb-3 text-left">
                Topic Application
              </h2>
              <div className="text-gray-600 text-sm mb-4">
                <ul className="text-gray-600 text-sm mb-4 list-disc list-inside text-left space-y-2">
                  <li>Your requested topic will be reviewed by our admins.</li>
                  <li>
                    Approved if 15 or more users apply for the same topic.
                  </li>
                  <li>Please post under an existing topic in the meantime.</li>
                </ul>
              </div>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Enter your proposed topic name..."
                className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  onClick={handleSubmitTopicApplication}
                >
                  Apply
                </button>
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md"
                  onClick={() => {
                    setNewTopicName("");
                    setShowTopicApplication(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showLinkModal && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/10 z-50">
            <div className="bg-white rounded-md p-6 shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Insert Link</h2>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (!linkUrl.trim()) return;

                    const hasSelection =
                      editor &&
                      editor.view.state.selection?.from !==
                        editor.view.state.selection?.to;

                    if (hasSelection) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: linkUrl })
                        .run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .insertContent([
                          {
                            type: "text",
                            text: "Link",
                            marks: [
                              {
                                type: "link",
                                attrs: { href: linkUrl },
                              },
                            ],
                          },
                        ])
                        .run();
                    }

                    setShowLinkModal(false);
                    setLinkUrl("");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl("");
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FreeWriteArticle;
