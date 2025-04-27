import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Plus, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Highlighter } from "lucide-react";
import supabase from "../../api/supabaseClient";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline'; 
import TiptapLink from '@tiptap/extension-link'; 
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { Extension } from '@tiptap/core';
import { Paragraph } from '@tiptap/extension-paragraph';
import FreeSidebar from "./FreeSidebar";


const EditFreeArticle = () => {
  const navigate = useNavigate();
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
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [monthlyPostCount, setMonthlyPostCount] = useState(0);
  const { id: articleId } = useParams();
  const [articleStatus, setArticleStatus] = useState(null);
  const [amendment, setAmendment] = useState("");
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);  


  console.log("Auth session:", supabase.auth.getSession());

  const CustomParagraph = Paragraph.extend({
    addAttributes() {
      return {
        style: {
          default: null,
          parseHTML: element => element.getAttribute('style'),
          renderHTML: attributes => {
            return {
              style: attributes.style || null,
            };
          },
        },
      };
    },
  });

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
  
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("articleid", articleId)
        .single();
  
      if (error || !data) {
        alert("Failed to load article.");
        return;
      }
  
      setTitle(data.title);
      setTopics(data.topicid);
      setArticleContent(data.text);
      if (data.imagepath) {
        setPendingImages([{ file: null, previewUrl: data.imagepath }]);
      }
      setArticleStatus(data.status);
      setEditorContent(data.text); // initialize editor
      setAmendment(data.amendment || "");
    };
  
    fetchArticle();
  }, [articleId]);
  
  const setEditorContent = (html) => {
    if (editor) {
      editor.commands.setContent(html || "");
    }
  };  
  
  const IndentExtension = Extension.create({
    name: 'custom-indent',
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          this.editor.commands.updateAttributes('paragraph', {
            style: 'text-indent: 2em',
          });
          return true;
        },
        'Shift-Tab': () => {
          this.editor.commands.updateAttributes('paragraph', {
            style: 'text-indent: 0',
          });
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    editable: false, // default to false
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
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TiptapLink.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: '',

    onUpdate: ({ editor }) => {

      const text = editor.getText();
      const wordsArray = text.trim().split(/\s+/).filter(Boolean);
      const words = wordsArray.length;

      if (words > MAX_WORDS) {
       // Prevent adding new words by restoring previous content
        editor.commands.setContent(articleContent); // roll back to last valid state
        return;
      }

      setWordCount(words);
      setArticleContent(editor.getHTML());

  
      const html = editor.getHTML();

      // Clean up removed images from pendingImages
      const doc = new DOMParser().parseFromString(html, "text/html");
      const imageSrcsInEditor = Array.from(doc.querySelectorAll("img")).map((img) => img.getAttribute("src"));
  
      setPendingImages((prev) =>
        prev.filter((img) => imageSrcsInEditor.includes(img.previewUrl))
      );
    },
  });

  useEffect(() => {
    if (editor && articleStatus !== null) {
      editor.setEditable(articleStatus !== "Published");
    }
  }, [editor, articleStatus]);  

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    const fetchMonthlyPostCount = async () => {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      const session = storedUser?.user;
      if (!session) return;
  
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
      const { data, error } = await supabase
        .from("articles")
        .select("articleid")
        .eq("userid", session.userid)
        .eq("status", "Published")
        .gte("time", firstDayOfMonth)
        .lte("time", lastDayOfMonth);
  
      if (!error && data) {
        setMonthlyPostCount(data.length);
      }
    };
  
    fetchMonthlyPostCount();
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
    if (!articleId) return;
  
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) return alert("User not authenticated.");
  
    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    if (!session) return alert("User not authenticated.");
  
    if (!title || !topics || !articleContent) return alert("Please fill in all fields.");
  
    if (articleStatus === "Draft") {
        if (monthlyPostCount >= 4) {
            alert("You’ve reached your monthly limit of 4 published articles. Upgrade to Premium for unlimited posts.");
            return;
          }     

      // --- If it's a draft, update the full article ---
      const { error } = await supabase
        .from("articles")
        .update({
          title,
          text: articleContent,
          topicid: topics,
          time: new Date().toISOString(),
          status: "Published",
        })
        .eq("articleid", articleId);
  
      if (error) return alert("Failed to update article.");
      alert("Article updated and published!");
    } else if (articleStatus === "Published") {
      // --- If it's published, only insert amendment ---
      if (!amendment.trim()) return alert("Please enter your update.");
  
      const { error } = await supabase
        .from("articles")
        .update({ amendment: amendment.trim() })
        .eq("articleid", articleId);
  
      if (error) return alert("Failed to submit update.");
      alert("Update submitted!");
      setShowUpdateSuccess(true);
    }
  };  

  const handleSaveDraft = async () => {

    if (!articleId) return;
  
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) return alert("User not authenticated.");
    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    if (!session) return alert("User not authenticated.");
  
    if (!title || !articleContent || !topics) {
      alert("Please fill in all required fields.");
      return;
    }
  
    let updatedHTML = editor?.getHTML() || articleContent;
    const bucket = "articles-images";
    let firstImageUrl = pendingImages.find(img => img.file === null)?.previewUrl || null;
    let uploadedImageUrls = [];

    // Remove previous images from Supabase bucket
        // const oldImagePaths = []; // If you stored paths (not just URLs), use those
        // if (oldImagePaths.length > 0) {
        //     await supabase.storage.from("articles-images").remove(oldImagePaths);
        // }

    // Extract old image paths to delete from Supabase Storage
    const { data: oldImages } = await supabase
        .from("article_images")
        .select("image_url")
        .eq("articleid", articleId);

    const oldPaths = (oldImages || []).map(img => {
        const prefix = "articles-images/";
        const startIndex = img.image_url.indexOf(prefix);
        return startIndex !== -1 ? img.image_url.slice(startIndex + prefix.length) : null;
    }).filter(Boolean);
              

    if (oldPaths.length > 0) {
        // await supabase.storage.from("articles-images").remove(oldPaths);
        if (oldPaths.length > 0) {
            const { error: deleteError } = await supabase.storage.from("articles-images").remove(oldPaths);
            if (deleteError) console.error("Delete error:", deleteError);
          }          
    }

    // Delete old image records (optional but recommended)
    await supabase
        .from("article_images")
        .delete()
        .eq("articleid", articleId);
  
    for (const img of pendingImages) {
      const file = img.file;
      if (!file) continue;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `user-${session.userid}/${fileName}`;
  
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) {
        alert("Image upload failed.");
        return;
      }
  
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl;
        updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);
        uploadedImageUrls.push(urlData.publicUrl);
      }
    }
  
    // FIX: Use update instead of insert
    const { error } = await supabase
    .from("articles")
    .update({
      title,
      text: updatedHTML,
      topicid: topics,
      imagepath: firstImageUrl || null,
      time: new Date().toISOString(),
      status: "Draft", // remain draft
    })
    .eq("articleid", articleId);
  
    if (error) {
        console.error("Draft update error:", error.message); // ADD THIS LOGGING
        return alert("Failed to update draft.");
    }  
  
    // Insert new images into article_images table
    for (const imageUrl of uploadedImageUrls) {
      await supabase.from("article_images").insert([
        { articleid: articleId, image_url: imageUrl }
      ]);
    }
  
    setShowDraftNotification(true);
    alert("Draft updated!");
  };
    

  const [pendingImages, setPendingImages] = useState([]); 
  
  const handleEditorImageUpload = async (e) => {

    console.log("Upload triggered", e.target.files[0]);

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Image size exceeds 50MB limit. Please upload a smaller file.");
      return;
    }    
  
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    const userId = storedUser?.user?.userid;
  
    if (!userId) {
      alert("User not authenticated.");
      return;
    }
  
    // Fetch usertype from Supabase
    const { data: userTypeData, error } = await supabase
      .from("usertype")
      .select("usertype")
      .eq("userid", userId)
      .single();
  
    if (error || !userTypeData) {
      alert("Failed to verify user type.");
      return;
    }
  
    const userType = userTypeData.usertype.toLowerCase();
  
    // const totalImages = pendingImages.length + (articleStatus === "Draft" || articleStatus === "Published" ? (articleContent.includes("<img") ? 1 : 0) : 0);

    const doc = new DOMParser().parseFromString(editor?.getHTML?.() || "", "text/html");
    const currentImages = Array.from(doc.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    const totalImages = currentImages.length + pendingImages.length;

    if (userType === "free" && totalImages >= 1) {
      alert("Free users can only upload 1 image. Please remove the existing image first.");
      return;
    }
    
  
    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { file, previewUrl }]);
    console.log("Added to pendingImages", previewUrl);
  
    console.log("Inserting image to editor")
    editor.chain().focus().setImage({ src: previewUrl }).run();
    e.target.value = null;
  };  

  const handleRemoveImage = (indexToRemove) => {
    const removedUrl = pendingImages[indexToRemove].previewUrl;
    URL.revokeObjectURL(removedUrl); // cleanup memory
    const updatedImages = pendingImages.filter((_, i) => i !== indexToRemove);
    setPendingImages(updatedImages);
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(editor.getHTML(), "text/html");
    const imgs = doc.querySelectorAll("img");
    const imgCount = doc.querySelectorAll("img").length;
    // const totalImages = pendingImages.length + imgCount;
    imgs.forEach((img) => {
      if (img.src === removedUrl) img.remove();
    });
    editor.commands.setContent(doc.body.innerHTML);
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
    const style = document.createElement('style');
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
    const rawInput = newTopicName.trim();
    const normalizedInput = rawInput.toLowerCase();
  
    if (!normalizedInput) {
      alert("Please enter a topic name.");
      return;
    }
  
    // Check if topic already exists in `topic_categories`
    const { data: existingTopics, error: topicFetchError } = await supabase
      .from("topic_categories")
      .select("name");
  
    if (topicFetchError) {
      alert("Error checking existing topics.");
      return;
    }
  
    const topicExists = existingTopics.some(
      (topic) => topic.name.trim().toLowerCase() === normalizedInput
    );
  
    if (topicExists) {
      alert("This topic already exists. Please choose an existing topic.");
      return;
    }
  
    // Check if user already applied for this topic
    const { data: userApplications, error: appFetchError } = await supabase
      .from("topic_applications")
      .select("topic_name")
      .eq("requested_by", userId)
      .eq("status", "Pending");
  
    if (appFetchError) {
      alert("Error checking your previous applications.");
      return;
    }
  
    const alreadyApplied = userApplications.some(
      (app) => app.topic_name.trim().toLowerCase() === normalizedInput
    );
  
    if (alreadyApplied) {
      alert("You’ve already applied for this topic.");
      return;
    }
  
    // Insert the application
    const { error: insertError } = await supabase
      .from("topic_applications")
      .insert([
        {
          requested_by: userId,
          topic_name: rawInput, // keep original casing for admin view
          status: "Pending",
          created_at: new Date().toISOString(),
        }
      ]);
  
    if (insertError) {
      alert("Failed to apply for topic.");
    } else {
      alert("Topic application submitted!");
      setShowTopicApplication(false);
      setNewTopicName("");
    }
  };  

return (
    // <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
    //   <main className="w-full max-w-4xl p-10 flex flex-col gap-6">
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden bg-indigo-50 justify-center">
    <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[250px] md:flex-none">
          <FreeSidebar />
        </aside>
    <main className="w-full max-w-4xl p-10 flex flex-col gap-6 mx-auto">
      <h1 className="text-3xl font-bold mb-1">
        {articleStatus === "Draft" ? "Edit Your Draft Articles :" : "Edit Your Posted Articles :"}
      </h1>

        <div className="flex flex-col gap-5 w-full">
          <div>
            <label className="block text-xl font-semibold mb-1">Article Title:</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                disabled={articleStatus === "Published"}
            />

          </div>

          <div>
            <label className="block text-xl font-semibold mb-1">Topic:</label>

              <div className="flex items-center gap-2 w-full">
              <div className="relative w-full">
                <div
                    onClick={() => {
                        if (articleStatus !== "Published") setShowTopicsDropdown(!showTopicsDropdown);
                    }}
                    className="p-2 border rounded-md bg-white w-full cursor-pointer flex justify-between items-center"
                >
                  {/* {topics || "Select a topic"} */}
                  {topics ? topicOptions.find((t) => t.topicid === topics)?.name : "Select a topic"}
                  {articleStatus !== "Published" && (
                  <button
                    className="ml-2 text-gray-500 text-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents double toggle
                      setShowTopicsDropdown(!showTopicsDropdown);
                    }}
                  >
                  {showTopicsDropdown ? "▲" : "▼"}
                </button>  
                )}
                </div>

                {showTopicsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {topicOptions.map((topic, i) => (
                      <div
                        key={i}
                        onClick={() => {
                            if (articleStatus !== "Published") {
                              setTopics(topic.topicid);
                              setShowTopicsDropdown(false);
                            }
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
                onClick={() => articleStatus !== "Published" && setShowTopicApplication(true)}
                disabled={articleStatus === "Published"}
              >
                <Plus size={16} />
              </button>

            </div>
          </div>

          <div>
            <label className="block text-xl font-semibold mb-1">Article Content:</label>
            {editor ? (
              <>
              {articleStatus !== "Published" && (
              <input
                type="file"
                accept="image/*"
                id="imageUploadInput"
                className="hidden"
                onChange={handleEditorImageUpload}
              />
            )}
              {articleStatus !== "Published" && (
              <>
              <button
                className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md"
                onClick={() => document.getElementById("imageUploadInput").click()}
              >
                Upload Image
              </button>
              </>
              )}

            {/* {pendingImages.length > 0 && ( */}
            {articleStatus !== "Published" && pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
                {pendingImages.map((img, index) => (
                <div key={index} className="relative w-32 h-32 border rounded overflow-hidden">
                    <img src={img.previewUrl} alt="Preview" className="object-cover w-full h-full" />
                    {articleStatus !== "Published" && (
                    <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                        ✕
                    </button>
                    )}
                </div>
                ))}
            </div>
            )}

            {articleStatus !== "Published" && (
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 mt-4 border rounded-lg shadow-md text-sm font-medium">
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value)
                if (level === 0) {
                  editor.chain().focus().setParagraph().run()
                } else {
                  editor.chain().focus().toggleHeading({ level }).run()
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

            <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-1 hover:bg-gray-100 rounded"><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-1 hover:bg-gray-100 rounded"><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-1 hover:bg-gray-100 rounded"><UnderlineIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-1 hover:bg-gray-100 rounded"><ListOrdered size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-1 hover:bg-gray-100 rounded"><List size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1 hover:bg-gray-100 rounded"><AlignLeft size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1 hover:bg-gray-100 rounded"><AlignCenter size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-1 hover:bg-gray-100 rounded"><AlignRight size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleHighlight().run()} className="p-1 hover:bg-gray-100 rounded"><Highlighter size={16} /></button>
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
          )}

          <div
            className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md bg-white p-4 mt-3 focus-within:outline-none"
            onClick={() => editor.commands.focus()}
          >
          <EditorContent
            editor={editor}
            className={`min-h-[200px] w-full outline-none p-2 text-base leading-relaxed ${
              articleStatus === "Published" ? "pointer-events-none opacity-60" : ""
            }`}
            style={{ lineHeight: '1.75' }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') e.preventDefault();
            }}
            onClick={() => articleStatus === "Draft" && editor.commands.focus()}
          />

          </div>
                <p className="text-sm text-gray-500 mt-1">
                  Word Count: {wordCount} / {MAX_WORDS}
                  {wordCount >= MAX_WORDS && (
                  <p className="text-grey-600 text-sm mt-1">
                    You’ve reached the maximum word count.
                  </p>
                )}
                </p>
                {articleStatus === "Published" && (
                    <div className="mt-6">
                    <label className="block text-xl font-semibold mb-1">Update (max 200 words):</label>
                    <textarea
                        value={amendment}
                        rows={5}
                        className="w-full border border-black rounded-md p-2 bg-white"
                        placeholder="Enter your update..."
                        onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                            if (words.length <= 200) setAmendment(e.target.value);
                        }}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Word Count: {amendment.trim().split(/\s+/).filter(Boolean).length} / 200
                    </p>

                    </div>
                )}

              </>
            ) : (
              <p className="text-gray-500">Loading editor...</p>
            )}
          </div>

          {userId && (
            <p className="text-right text-sm text-black mb-1">
              You’ve posted {monthlyPostCount} out of 4 articles this month. Update your subscription for unlimited posts..!!
            </p>
          )}

        <div className="flex justify-end gap-3 mt-6">
            <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => navigate("/freeDashboard/manageArticles")}
                >
                Cancel
            </button>

            {articleStatus === "Draft" ? (
                <>
                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveDraft}
                >
                    Update
                </button>

                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={handlePostArticle}
                >
                    Post Draft
                </button>
                </>
            ) : (
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={handlePostArticle}
                >
                    Add Update
                </button>
            )}
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
              <h2 className="text-xl font-semibold mb-3 text-left">Topic Application</h2>
              <div className="text-gray-600 text-sm mb-4">
              <ul className="text-gray-600 text-sm mb-4 list-disc list-inside text-left space-y-2">
                <li>Your requested topic will be reviewed by our admins.</li>
                <li>Approved if 15 or more users apply for the same topic.</li>
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

                  const hasSelection = editor && editor.view.state.selection?.from !== editor.view.state.selection?.to;

                  if (hasSelection) {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                  } else {
                    editor.chain().focus().insertContent([
                      {
                        type: 'text',
                        text: 'Link',
                        marks: [
                          {
                            type: 'link',
                            attrs: { href: linkUrl },
                          },
                        ],
                      },
                    ]).run();
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
      {showDraftNotification && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-left" style={{ maxWidth: '400px', width: 'auto' }}>
            <p className="text-lg font-semibold mb-2">Draft saved successfully!</p>
            <p className="text-sm text-gray-500 mt-2">
              Your draft will expire in 7 days. Don't forget to publish it before then!
            </p>
      
            {/* OK Button to acknowledge the notification */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                    setShowDraftNotification(false);
                    navigate("/freeDashboard/manageArticles"); // ← REDIRECT TO MANAGE PAGE
                }}                
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showUpdateSuccess && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-left" style={{ maxWidth: '400px', width: 'auto' }}>
            <p className="text-lg font-semibold mb-2">Update submitted successfully!</p>
            <p className="text-sm text-gray-500 mt-2">
                Your update has been recorded. Thank you for keeping your article accurate and up to date!
            </p>

            <div className="flex justify-end mt-4">
                <button
                onClick={() => {
                    setShowUpdateSuccess(false);
                    navigate("/freeDashboard/manageArticles");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                OK
                </button>
            </div>
            </div>
        </div>
        )}
      </main>
      </main>
    </div>
  );
};

export default EditFreeArticle;
