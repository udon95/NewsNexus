import React, { useState, useEffect, useRef } from "react";
import {
  ImagePlus,
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
import { Link } from "react-router-dom";
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
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { Paragraph } from "@tiptap/extension-paragraph";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";

export const PremiumWriteArticle = () => {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [images, setImages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [postType, setPostType] = useState("General");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [topicOptions, setTopicOptions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;
  const editorRef = useRef(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [roomArticleType, setRoomArticleType] = useState("factual"); // only for Room
  const [aiFeedback, setAiFeedback] = useState("");
  const [collabId, setCollabId] = useState("collab-id");
  const [showDraftNotification, setShowDraftNotification] = useState(false);

  // console.log("Auth session:", supabase.auth.getSession());

  // useEffect(() => {
  //   const checkSession = async () => {
  //     const { data, error } = await supabase.auth.getSession();
  //     console.log("Session check:", data?.session);

  //     if (!data?.session) {
  //       alert("You're not logged in");
  //       return;
  //     }

  //     console.log("Logged in user:", data.session.user);
  //   };

  //   checkSession();
  // }, []);

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
    content: articleContent,
    onUpdate: ({ editor }) => {
      setArticleContent(editor.getHTML());
      const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    },
  });

  //NEW
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

  //NEW
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log(" Logged in");
      } else if (event === "SIGNED_OUT") {
        console.log(" Logged out");
      }
    });
  }, []);

  const MAX_WORDS = postType === "Room" ? 400 : 1000;

  // const handlePostArticle = async () => {
  //   // Retrieve user from localStorage
  //   const storedUser = localStorage.getItem("userProfile");
  //   if (!storedUser) {
  //     alert("User not authenticated. Cannot upload.");
  //     return;
  //   }

  //   const parsedUser = JSON.parse(storedUser);
  //   const session = parsedUser?.user; // Assuming 'user' is the session data in your stored object

  //   if (!session) {
  //     alert("User not authenticated. Cannot upload.");
  //     return;
  //   }

  //   console.log("User from localStorage:", session);

  //   // Proceed if all necessary fields are filled
  //   if (
  //     !title ||
  //     !articleContent ||
  //     (postType === "General" && !topics) ||
  //     (postType === "Room" && !selectedRoom)
  //   ) {
  //     alert("Please fill in all required fields.");
  //     return;
  //   }

  //   let updatedHTML = articleContent;
  //   const bucket =
  //     postType === "Room" ? "room-article-images" : "articles-images";
  //   let firstImageUrl = null;

  //   const { data: sessionData, error: sessionError } =
  //     await supabase.auth.getSession();

  //   for (const img of pendingImages) {
  //     const file = img.file;
  //     const fileExt = file.name.split(".").pop();
  //     const fileName = `${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substring(2)}.${fileExt}`;

  //     const { data: authSession } = await supabase.auth.getSession();
  //     const supabaseUid = authSession?.session?.user?.id;
  //     const filePath = `${supabaseUid}/${fileName}`;

  //     const { error: uploadError } = await supabase.storage
  //       .from(bucket)
  //       .upload(filePath, file);

  //     if (uploadError) {
  //       alert("Image upload failed.");
  //       return;
  //     }

  //     const { data: urlData } = supabase.storage
  //       .from(bucket)
  //       .getPublicUrl(filePath);
  //     if (urlData?.publicUrl) {
  //       if (!firstImageUrl) firstImageUrl = urlData.publicUrl; // Track first image URL
  //       if (postType === "General") {
  //         updatedHTML = updatedHTML.replaceAll(
  //           img.previewUrl,
  //           urlData.publicUrl
  //         );
  //       }
  //     }
  //   }

  //   const articleData = {
  //     title,
  //     content: updatedHTML,
  //     created_by: session.userid, // Use session ID for the user
  //     created_at: new Date().toISOString(),
  //   };

  //   if (postType === "General") {
  //     articleData.topic = topics;

  //     const { data, error } = await supabase
  //       .from("articles")
  //       .insert([
  //         {
  //           title: articleData.title,
  //           text: articleData.content,
  //           userid: articleData.created_by,
  //           topicid: topics, // Insert the UUID
  //           time: articleData.created_at,
  //           status: "Published",
  //           imagepath: firstImageUrl || null,
  //         },
  //       ])
  //       .select("articleid");

  //     console.log(articleData.topic, error);

  //     if (error) {
  //       alert("Failed to post article.");
  //       return;
  //     }

  //     const articleid = data?.[0]?.articleid;

  //     for (const img of pendingImages) {
  //       const fileExt = img.file.name.split(".").pop();
  //       const fileName = `${Date.now()}-${Math.random()
  //         .toString(36)
  //         .substring(2)}.${fileExt}`;
  //       const filePath = `${session.id}/${fileName}`;

  //       await supabase.storage
  //         .from("articles-images")
  //         .upload(filePath, img.file, {
  //           cacheControl: "3600",
  //           upsert: false,
  //         });

  //       const { data: urlData } = supabase.storage
  //         .from("articles-images")
  //         .getPublicUrl(filePath);
  //       const imageUrl = urlData?.publicUrl;

  //       await supabase
  //         .from("article_images")
  //         .insert([{ articleid, image_url: imageUrl }]);
  //     }
  //   } else {
  //     articleData.roomid = selectedRoom;
  //     const { data, error } = await supabase
  //       .from("room_articles")
  //       .insert([
  //         {
  //           title: articleData.title,
  //           content: articleData.content,
  //           roomid: selectedRoom,
  //           userid: session.userid,
  //           created_at: articleData.created_at,
  //           status: "Published",
  //         },
  //       ])
  //       .select("postid");

  //     if (error) {
  //       alert("Failed to post article.");
  //       return;
  //     }

  //     const postid = data?.[0]?.postid;
  //     for (const img of pendingImages) {
  //       const fileExt = img.file.name.split(".").pop();
  //       const fileName = `${Date.now()}-${Math.random()
  //         .toString(36)
  //         .substring(2)}.${fileExt}`;
  //       const { data: authSession } = await supabase.auth.getSession();
  //       const supabaseUid = authSession?.session?.user?.id;
  //       const filePath = `${supabaseUid}/${fileName}`;

  //       await supabase.storage
  //         .from("room-article-images")
  //         .upload(filePath, img.file);

  //       const { data: urlData } = supabase.storage
  //         .from("room-article-images")
  //         .getPublicUrl(filePath);

  //       const imageUrl = urlData?.publicUrl;

  //       await supabase
  //         .from("room_article_images")
  //         .insert([{ postid, image_url: imageUrl }]);
  //     }
  //   }

  //   alert("Article posted!");
  //   handleClearInputs();
  // };

  // const getOrCreateTopicId = async (topicName) => {
  //   const matchedTopic = topicOptions.find(
  //     (t) => t.name.toLowerCase() === topicName.toLowerCase()
  //   );
  //   if (matchedTopic) return matchedTopic.topicid;

  //   const { data: newTopic, error: insertError } = await supabase
  //     .from("topic_categories")
  //     .insert([
  //       {
  //         name: topicName,
  //         Creator: "User",
  //         created_at: new Date().toISOString(),
  //       },
  //     ])
  //     .select("topicid")
  //     .single();

  //   if (insertError) {
  //     alert("Failed to create new topic.");
  //     return null;
  //   }
  //   return newTopic.topicid;
  // };

  // useEffect(() => {
  //   if (!editor) return;

  //   const provider = new HocuspocusProvider({
  //     url: "wss://lazg8po476.execute-api.ap-southeast-1.amazonaws.com/production/", // The WebSocket URL to your Hocuspocus server
  //     document: editor,
  //     collab: collabId, // Ensure each user joins the same room to sync their changes
  //   });

  //   return () => provider.disconnect();
  // }, [editor, collabId]);

  const handlePostArticle = async () => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) {
      alert("User not authenticated. Cannot upload.");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user; // Assuming 'user' is the session data in your stored object

    if (!session) {
      alert("User not authenticated. Cannot upload.");
      return;
    }

    // console.log("User from localStorage:", session);

    // Proceed if all necessary fields are filled

    if (
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    let updatedHTML = articleContent;
    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
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
        if (postType === "General") {
          updatedHTML = updatedHTML.replaceAll(
            img.previewUrl,
            urlData.publicUrl
          );
        }
      }
    }

    const articleData = {
      title,
      content: updatedHTML,
      created_by: session.userid, // Use session ID for the user
      created_at: new Date().toISOString(),
    };

    const topicName = topicOptions.find((t) => t.topicid === topics)?.name;

    // CASE 1: General Article (always factual)
    if (postType === "General") {
      const response = await fetch("http://localhost:5000/api/submit-article", {
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
      });

      const result = await response.json();

      if (!response.ok) {
        console.log(result);
        if (result.highlightedHTML) {
          console.log("🔴 AI Feedback returned:", result.highlightedHTML);
          setAiFeedback(result.highlightedHTML);
          alert(
            "❌ Article flagged by AI. Please review the highlighted sections."
          );
        } else {
          alert(result.error || "Submission failed.");
        }

        // ✅ This is important to prevent saving
        return;
      }

      if (result.verdict === "true") {
        if (result.explanation) {
          alert(`✅ Article passed AI check:\n${result.explanation}`);
        } else {
          alert("✅ Article passed AI check.");
        }
      }

      //  Save to articles table
      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            title: articleData.title,
            text: articleData.content,
            userid: articleData.created_by,
            topicid: topics, // Insert the UUID
            time: articleData.created_at,
            status: "Published",
            imagepath: firstImageUrl || null,
          },
        ])
        .select("articleid");

      if (error) {
        alert("Failed to save article.");
        return;
      }

      const articleid = data?.[0]?.articleid;

      // Save multiple images to article_images
      for (const img of pendingImages) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `${session.id}/${fileName}`;

        await supabase.storage
          .from("articles-images")
          .upload(filePath, img.file, {
            cacheControl: "3600",
            upsert: false,
          });

        const { data: urlData } = supabase.storage
          .from("articles-images")
          .getPublicUrl(filePath);
        const imageUrl = urlData?.publicUrl;

        await supabase
          .from("article_images")
          .insert([{ articleid, image_url: imageUrl }]);
      }

      alert("Article posted successfully.");
      handleClearInputs();
      return;
    }

    // 🏠 CASE 2: Room Opinion Article (skip validation)
    if (postType === "Room") {
      articleData.roomid = selectedRoom;
      const { data, error } = await supabase
        .from("room_articles")
        .insert([
          {
            title: articleData.title,
            content: articleData.content,
            roomid: selectedRoom,
            userid: session.userid,
            created_at: articleData.created_at,
            status: "Published",
          },
        ])
        .select("postid");

      if (error) {
        alert("Failed to post room article.");
        return;
      }

      const postid = data?.[0]?.postid;

      for (const img of pendingImages) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const { data: authSession } = await supabase.auth.getSession();
        const supabaseUid = authSession?.session?.user?.id;
        const filePath = `${supabaseUid}/${fileName}`;

        await supabase.storage
          .from("room-article-images")
          .upload(filePath, img.file);

        const { data: urlData } = supabase.storage
          .from("room-article-images")
          .getPublicUrl(filePath);

        const imageUrl = urlData?.publicUrl;

        await supabase
          .from("room_article_images")
          .insert([{ postid, image_url: imageUrl }]);
      }
    }

    alert("Opinion room article posted successfully.");
    handleClearInputs();
    return;
  };

  const handleSaveDraft = async () => {
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) return alert("User not authenticated. Cannot save draft.");

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    if (!session) return alert("User not authenticated.");

    if (
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    let updatedHTML = articleContent;
    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
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
        if (postType === "General") {
          updatedHTML = updatedHTML.replaceAll(
            img.previewUrl,
            urlData.publicUrl
          );
        }
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

    if (postType === "General") {
      articleData.topicid = topics;

      const { error } = await supabase.from("articles").insert([articleData]);
      if (error) return alert("Failed to save draft.");
    } else {
      const { data, error } = await supabase
        .from("room_articles")
        .insert([
          {
            title: articleData.title,
            content: articleData.text,
            roomid: selectedRoom,
            userid: session.userid,
            created_at: articleData.time,
            status: "Draft",
          },
        ])
        .select("postid");

      if (error) {
        console.error("Error saving draft:", error);
        return alert("Failed to save draft.");
      }

      const postid = data?.[0]?.postid;

      for (const img of pendingImages) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const { data: authSession } = await supabase.auth.getSession();
        const supabaseUid = authSession?.session?.user?.id;
        const filePath = `${supabaseUid}/${fileName}`;

        await supabase.storage
          .from("room-article-images")
          .upload(filePath, img.file);

        const { data: urlData } = supabase.storage
          .from("room-article-images")
          .getPublicUrl(filePath);

        const imageUrl = urlData?.publicUrl;

        if (imageUrl) {
          await supabase
            .from("room_article_images")
            .insert([{ postid, image_url: imageUrl }]);
        }
      }
    }
    setShowDraftNotification(true);

    alert("Draft saved!");
    handleClearInputs();
  };

  const [pendingImages, setPendingImages] = useState([]);

  const handleEditorImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingImages((prev) => [...prev, { file, previewUrl }]);

      if (postType === "General") {
        editor.chain().focus().setImage({ src: previewUrl }).run();
      }
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

  useEffect(() => {
    const fetchUserRooms = async () => {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      const userId = storedUser?.user?.userid;
      if (!userId) return;

      // Step 1: Get roomids where this user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("room_members")
        .select("roomid")
        .eq("userid", userId)
        .is("exited_at", null); // only active memberships

      if (memberError || !memberData) {
        console.error("Error fetching room memberships:", memberError);
        return;
      }

      const roomIds = memberData.map((entry) => entry.roomid).filter(Boolean);
      const uniqueRoomIds = [...new Set(roomIds)];

      if (uniqueRoomIds.length === 0) {
        setRooms([]); // user is not in any rooms
        return;
      }

      // Step 2: Fetch only those rooms from `rooms` table
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("roomid, name") //  use the correct column (roomid!)
        .in("roomid", uniqueRoomIds); //  this MUST match the key used in SELECT

      if (!roomError && roomData) {
        setRooms(roomData);
      } else {
        console.error("Error fetching room info:", roomError);
      }
    };

    fetchUserRooms();
  }, []);

  const handleClearInputs = () => {
    setTitle("");
    setTopics("");
    setArticleContent("");
    setImages([]);
    setSelectedRoom("");
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
    const rawInput = newTopicName.trim();
    const normalizedInput = rawInput.toLowerCase();

    if (!normalizedInput) {
      alert("Please enter a topic name.");
      return;
    }

    // 🔍 Check if topic already exists in `topic_categories`
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

    // 🔍 Check if user already applied for this topic
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
        },
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
            <label className="block text-xl font-semibold mb-1">
              Post Type:
            </label>
            <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
              <div className="flex gap-4">
                {["General", "Room"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="postType"
                      value={type}
                      checked={postType === type}
                      onChange={() => setPostType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>

              {postType === "General" ? (
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
              ) : (
                <div className="relative w-full">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="p-2 border rounded-md w-full bg-white appearance-none pr-8"
                  >
                    <option value="" disabled>
                      Select a room
                    </option>
                    {rooms.map((room) => (
                      <option key={room.roomid} value={room.roomid}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4 flex gap-4 items-center">
                    <label className="text-sm font-medium">
                      Room Article Type:
                    </label>
                    {["factual", "opinion"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="roomArticleType"
                          value={type}
                          checked={roomArticleType === type}
                          onChange={() => setRoomArticleType(type)}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>

                  {/* Custom ▼ triangle */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 text-sm">
                    ▼
                  </div>
                </div>
              )}
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

                {/* Preview attached images for Room posts */}
                {postType === "Room" && pendingImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {pendingImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative border rounded-lg overflow-hidden shadow"
                      >
                        <img
                          src={img.previewUrl}
                          alt={`Upload Preview ${index}`}
                          className="object-cover w-full h-32"
                        />
                        <button
                          onClick={() => {
                            setPendingImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

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

                {aiFeedback && (
                  <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded text-sm text-red-800">
                    <strong>AI Feedback:</strong>
                    <div
                      className="p-4 bg-red-50 text-red-800 border border-red-200 mt-4 rounded"
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

        {showDraftNotification && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50">
            <div
              className="bg-white p-6 rounded-lg shadow-xl text-left"
              style={{ maxWidth: "400px", width: "auto" }}
            >
              <p className="text-lg font-semibold mb-2">
                Draft saved successfully!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Your draft will expire in 7 days. Don't forget to publish it
                before then!
              </p>

              {/* OK Button to acknowledge the notification */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowDraftNotification(false)} // Close the notification
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PremiumWriteArticle;
