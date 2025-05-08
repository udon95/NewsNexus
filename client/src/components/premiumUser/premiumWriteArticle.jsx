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
import { useSearchParams } from "react-router-dom";
import ListItem from "@tiptap/extension-list-item";

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
  const [accuracy, setAccuracy] = useState(null);
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [showTopicApplication, setShowTopicApplication] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAction, setUploadAction] = useState(""); // "post" or "draft"
  const [pendingImages, setPendingImages] = useState([]);

  const [searchParams] = useSearchParams();
  const preSelectedType = searchParams.get("type"); // e.g. "room"
  const preSelectedRoomId = searchParams.get("roomid");

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

  useEffect(() => {
    if (
      preSelectedType === "room" &&
      preSelectedRoomId &&
      rooms.length > 0 &&
      rooms.some((r) => r.roomid === preSelectedRoomId)
    ) {
      setPostType("Room");
      setSelectedRoom(preSelectedRoomId);
    }
  }, [preSelectedType, preSelectedRoomId, rooms]);

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
          const { state, commands } = this.editor;
          const { from } = state.selection;
          const node =
            state.doc.resolve(from).nodeAfter || state.doc.resolve(from).parent;
          const currentStyle = node.attrs?.style || "";
          const match = currentStyle.match(/text-indent:\s?(\d+)em/);
          const currentIndent = match ? parseInt(match[1]) : 0;
          const nextIndent = currentIndent + 2;

          commands.updateAttributes("paragraph", {
            style: `text-indent: ${nextIndent}em`,
          });
          return true;
        },
        "Shift-Tab": () => {
          const { state, commands } = this.editor;
          const { from } = state.selection;
          const node =
            state.doc.resolve(from).nodeAfter || state.doc.resolve(from).parent;
          const currentStyle = node.attrs?.style || "";
          const match = currentStyle.match(/text-indent:\s?(\d+)em/);
          const currentIndent = match ? parseInt(match[1]) : 0;
          const nextIndent = Math.max(0, currentIndent - 2);

          commands.updateAttributes("paragraph", {
            style: nextIndent === 0 ? "" : `text-indent: ${nextIndent}em`,
          });
          return true;
        },
        Backspace: () => {
          const { state, commands } = this.editor;
          const { from } = state.selection;
          const node =
            state.doc.resolve(from).nodeAfter || state.doc.resolve(from).parent;

          const isEmpty = node.content.size === 0;
          const currentStyle = node.attrs?.style || "";

          if (isEmpty && currentStyle.includes("text-indent")) {
            commands.updateAttributes("paragraph", {
              style: "",
            });
            return true;
          }

          return false;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomParagraph,
      BulletList,
      OrderedList,
      ListItem,
      UnderlineExtension,
      TiptapLink,
      Highlight,
      Image,
      // IndentExtension, //INDENT
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
    editorProps: {
      handlePaste(view, event, slice) {
        const items = event.clipboardData?.items || [];
        const hasImage = Array.from(items).some((item) =>
          item.type.startsWith("image")
        );

        if (hasImage) {
          alert(
            "Pasting images is not allowed. Please use the Upload Image button."
          );
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const wordsArray = text.trim().split(/\s+/).filter(Boolean);
      const words = wordsArray.length;

      if (words > MAX_WORDS) {
        // Prevent typing beyond limit
        editor.commands.setContent(articleContent); // rollback
        return;
      }

      setWordCount(words);

      setArticleContent(html);

      if (postType === "General") {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const imageSrcsInEditor = Array.from(doc.querySelectorAll("img")).map(
          (img) => img.getAttribute("src")
        );

        setPendingImages((prev) =>
          prev.filter((img) => imageSrcsInEditor.includes(img.previewUrl))
        );
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (postType === "General") {
      // Insert all pending images into editor
      let insertImages = "";
      pendingImages.forEach((img) => {
        insertImages += `<img src="${img.previewUrl}" /><p></p>`;
      });
      editor.chain().focus().insertContent(insertImages).run();
    } else if (postType === "Room") {
      // Remove all pending images from editor
      let editorHtml = editor.getHTML();
      pendingImages.forEach((img) => {
        editorHtml = editorHtml.replace(
          new RegExp(`<img src="${img.previewUrl}"[^>]*>`, "g"),
          ""
        );
      });
      editor.commands.setContent(editorHtml);
    }
  }, [postType]);

  // useEffect(() => {
  //   if (!editor) return;

  //   const handlePaste = (event) => {
  //     const clipboardItems = event.clipboardData?.items;
  //     if (!clipboardItems) return;

  //     for (const item of clipboardItems) {
  //       if (item.type.startsWith("image/")) {
  //         event.preventDefault(); // Block image paste
  //         alert("Pasting images is disabled. Please use the Upload button.");
  //         return;
  //       }
  //     }
  //   };

  //   const editorElement = editor?.view?.dom;
  //   if (editorElement) {
  //     editorElement.addEventListener("paste", handlePaste);
  //   }

  //   return () => {
  //     if (editorElement) {
  //       editorElement.removeEventListener("paste", handlePaste);
  //     }
  //   };
  // }, [editor]);

  const MAX_WORDS = postType === "Room" ? 400 : 1000;

  const handlePostArticle = async () => {
    setUploadAction("post");

    if (isUploading) return;
    setIsUploading(true);
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) {
      alert("User not authenticated. Cannot upload.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    if (!session) {
      alert("User not authenticated. Cannot upload.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    if (
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
    let firstImageUrl = null;
    let updatedHTML = articleContent;
    let uploadedImageUrls = [];

    const topicName = topicOptions.find((t) => t.topicid === topics)?.name;

    // ---------------------- GENERAL ARTICLE ----------------------
    if (postType === "General") {
      // 1. Upload pendingImages and update HTML
      for (const img of pendingImages) {
        const file = img.file;
        if (!file?.name) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${session.userid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Image upload failed.");
          setIsUploading(false);
          setUploadAction(""); // DEVI ADDED THIS
          return;
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;

        if (publicUrl) {
          if (!firstImageUrl) firstImageUrl = publicUrl;
          //console.log("img1", firstImageUrl);
          updatedHTML = updatedHTML.replaceAll(img.previewUrl, publicUrl);
          uploadedImageUrls.push(publicUrl);
        }
      }

      //console.log(firstImageUrl);
      console.log("imgnew", firstImageUrl);

      // 2. Submit to external API (make sure firstImageUrl is passed!)
      const response = await fetch(
        // "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/submit-article",
        // {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     title,
        //     content: updatedHTML,
        //     type: "factual",
        //     authorId: session.userid,
        //     topicid: topics,
        //     topicName,
        //     imagepath: firstImageUrl, // ✅ Critical part
        //   }),
        // }
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
            // imagepath: firstImageUrl, // Optional: keep for backward compatibility
            imageUrls: uploadedImageUrls, // NEW: sends array of image URLs
          }),
        }
      );

      const result = await response.json();
      console.log("result", result);

      if (!response.ok) {
        // if (result.error) {
        //   alert(result.error); // Display moderation failure
        // }

        if (result.feedback) {
          setAiFeedback(result.feedback);
          setAccuracy(result.accuracy || null);
          alert(
            "Article flagged by AI. Please review the highlighted sections."
          );
        } else {
          alert(result.error || "Submission failed.");
        }
        setIsUploading(false);
        setUploadAction(""); // DEVI ADDED THIS
        return;
      }

      const articleid = result.article?.articleid;
      console.log("result article", result.article);

      if (articleid && firstImageUrl) {
        // 3. Update imagepath in the `articles` table after successful submission
        const { data, error } = await supabase
          .from("articles")
          .update({ imagepath: firstImageUrl })
          .eq("articleid", articleid);

        if (error) {
          console.error("Error updating imagepath:", error);
          alert("Failed to update image path.");
          setIsUploading(false);
          setUploadAction(""); // DEVI ADDED THIS
          return;
        }

        console.log("Image path updated for article:", articleid);
      }

      for (const url of uploadedImageUrls) {
        await supabase
          .from("article_images")
          .insert([{ articleid, image_url: url }]);
        console.log("img3", url);
      }

      setAccuracy(result.accuracy);
      setAiFeedback(result.feedback);
      alert(`Article posted successfully. Accuracy Score: ${result.accuracy}%`);
      handleClearInputs();
      return;
    } else {
      // ---------------------- ROOM ARTICLE ----------------------
      updatedHTML = updatedHTML.replace(
        /<img[^>]*src=["']blob:[^"']+["'][^>]*>/g,
        ""
      );

      for (const img of pendingImages) {
        const file = img.file;
        if (!file?.name) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${session.userid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("room-article-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Image upload failed.");
          setIsUploading(false);
          setUploadAction(""); // DEVI ADDED THIS
          return;
        }

        const { data: urlData } = supabase.storage
          .from("room-article-images")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;

        if (urlData?.publicUrl) {
          uploadedImageUrls.push(publicUrl);
        }
      }

      console.log("room images", uploadedImageUrls);

      const articleData = {
        title,
        content: updatedHTML,
        roomid: selectedRoom,
        userid: session.userid,
        created_at: new Date().toISOString(),
        status: "Published",
      };

      try {
        const response = await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/moderate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: updatedHTML,
              imageUrls: uploadedImageUrls,
            }),
          }
        );

        const result = await response.json();
        if (result.error) {
          alert(`Article flagged: ${result.error}`);
          setIsUploading(false);
          setUploadAction(""); // DEVI ADDED THIS
          return;
        }
      } catch (err) {
        alert("Failed to moderate content.");
        console.error(err);
        setIsUploading(false);
        setUploadAction(""); // DEVI ADDED THIS
        return;
      }

      const { data, error } = await supabase
        .from("room_articles")
        .insert([articleData])
        .select("postid");

      if (error) {
        alert("Failed to post room article.");
        setIsUploading(false);
        setUploadAction(""); // DEVI ADDED THIS
        return;
      }

      const postid = data?.[0]?.postid;
      if (postid) {
        for (const url of uploadedImageUrls) {
          await supabase
            .from("room_article_images")
            .insert([{ postid, image_url: url }]);
        }
        // for (const img of pendingImages) {
        //   const file = img.file;
        //   if (!file?.name) continue;

        //   const fileExt = file.name.split(".").pop();
        //   const fileName = `${Date.now()}-${Math.random()
        //     .toString(36)
        //     .substring(2)}.${fileExt}`;
        //   const filePath = `user-${session.userid}/${fileName}`;

        //   const { error: uploadError } = await supabase.storage
        //     .from("room-article-images")
        //     .upload(filePath, file);

        //   if (uploadError) {
        //     console.error("Room image upload failed:", uploadError);
        //     continue;
        //   }

        //   const { data: urlData } = supabase.storage
        //     .from("room-article-images")
        //     .getPublicUrl(filePath);

        //   const publicUrl = urlData?.publicUrl;
        //   if (publicUrl) {
        //     await supabase
        //       .from("room_article_images")
        //       .insert([{ postid, image_url: publicUrl }]);
        //   }
        // }
      }
    }

    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
    alert("Article posted successfully.");
    handleClearInputs();
    setIsUploading(false);
    setUploadAction(""); // DEVI ADDED THIS
  };

  const handleSaveDraft = async () => {
    setUploadAction("draft");

    if (isUploading) return;
    setIsUploading(true);
    const storedUser = localStorage.getItem("userProfile");
    // if (!storedUser) return alert("User not authenticated. Cannot save draft.");
    if (!storedUser) {
      alert("User not authenticated. Cannot save draft.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
    // if (!session) return alert("User not authenticated.");
    if (!session) {
      alert("User not authenticated.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    if (
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields.");
      setIsUploading(false);
      setUploadAction(""); // DEVI ADDED THIS
      return;
    }

    let updatedHTML = articleContent;
    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
    let firstImageUrl = null;
    let uploadedImageUrls = [];

    // if (postType === "General") {
    //   // Upload images and replace blob URLs
    //   for (const img of pendingImages) {
    //     const file = img.file;
    //     if (!file?.name) continue;

    //     const fileExt = file.name.split('.').pop();
    //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    //     const filePath = `user-${session.userid}/${fileName}`;

    //     const { error: uploadError } = await supabase.storage
    //       .from(bucket)
    //       .upload(filePath, file);

    //     if (uploadError) {
    //       console.error("Image upload failed:", uploadError);
    //       alert("Image upload failed.");
    //       setIsUploading(false);
    //       setUploadAction("");  // DEVI ADDED THIS
    //       return;
    //     }

    //     const { data: urlData } = supabase.storage
    //       .from(bucket)
    //       .getPublicUrl(filePath);

    //     if (urlData?.publicUrl) {
    //       if (!firstImageUrl) firstImageUrl = urlData.publicUrl;
    //       updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);
    //       uploadedImageUrls.push(urlData.publicUrl);
    //     }
    //   }

    //   // Save article draft
    //   const { data, error } = await supabase
    //     .from("articles")
    //     .insert([{
    //       title,
    //       text: updatedHTML,
    //       userid: session.userid,
    //       topicid: topics,
    //       time: new Date().toISOString(),
    //       status: "Draft",
    //       imagepath: firstImageUrl || null,
    //     }])
    //     .select("articleid");

    //   if (error) {
    //     console.error("Failed to save draft:", error);
    //     alert("Failed to save draft.");
    //     return;
    //   }

    //   const articleid = data?.[0]?.articleid;
    //   for (const url of uploadedImageUrls) {
    //     await supabase.from("article_images").insert([
    //       { articleid, image_url: url }
    //     ]);
    //   }

    // }

    //DEVI MADE CHANGES HERE (IF THE OLD ONE IS THE INTENDED CORRECT CODDE, IT IS COMMENTED OUT ABOVE JUST CHANGE):
    // Previously, drafts were saved without moderation — this could allow inappropriate or unverified content into the system.
    // Now, draft saving follows the same AI moderation process as posting (for consistency and safety).
    // If AI flags the content, the draft is NOT saved and the user is alerted with feedback.
    // This ensures all saved content (even drafts) pass the same baseline content checks.
    if (postType === "General") {
      for (const img of pendingImages) {
        const file = img.file;
        if (!file?.name) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${session.userid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Image upload failed.");
          setIsUploading(false);
          setUploadAction("");
          return;
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          if (!firstImageUrl) firstImageUrl = urlData.publicUrl;
          updatedHTML = updatedHTML.replaceAll(
            img.previewUrl,
            urlData.publicUrl
          );
          uploadedImageUrls.push(urlData.publicUrl);
        }
      }

      const response = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/moderate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: updatedHTML,
            imageUrls: uploadedImageUrls,
          }),
        }
      );

      const result = await response.json();
      if (result.error) {
        alert(`Draft flagged: ${result.error}`);
        setIsUploading(false);
        setUploadAction("");
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            title,
            text: updatedHTML,
            userid: session.userid,
            topicid: topics,
            time: new Date().toISOString(),
            status: "Draft",
            imagepath: firstImageUrl || null,
          },
        ])
        .select("articleid");

      if (error) {
        console.error("Failed to save draft:", error);
        alert("Failed to save draft.");
        setIsUploading(false);
        setUploadAction("");
        return;
      }

      const articleid = data?.[0]?.articleid;
      for (const url of uploadedImageUrls) {
        await supabase
          .from("article_images")
          .insert([{ articleid, image_url: url }]);
      }
    } else {
      // Clean blob URLs before saving room content
      updatedHTML = updatedHTML.replace(
        /<img[^>]*src=["']blob:[^"']+["'][^>]*>/g,
        ""
      );

      for (const img of pendingImages) {
        const file = img.file;
        if (!file?.name) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${session.userid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("room-article-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Room draft image upload failed:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("room-article-images")
          .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;
        if (publicUrl) {
          uploadedImageUrls.push(publicUrl);

          //   await supabase
          //     .from("room_article_images")
          //     .insert([{ postid, image_url: publicUrl }]);
        }
        console.log("image", publicUrl);
      }

      console.log("uploaded images", uploadedImageUrls);

      try {
        const response = await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/moderate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: updatedHTML,
              imageUrls: uploadedImageUrls,
            }),
          }
        );
        const result = await response.json();
        if (result.error) {
          alert(`Draft flagged: ${result.error}`);
          setIsUploading(false);
          setUploadAction("");
          return;
        }
      } catch {
        return res.status(500).json({ error: "Something went wrong." });
      }

      const { data, error } = await supabase
        .from("room_articles")
        .insert([
          {
            title,
            content: updatedHTML,
            roomid: selectedRoom,
            userid: session.userid,
            created_at: new Date().toISOString(),
            status: "Draft",
          },
        ])
        .select("postid");

      if (error) {
        console.error("Error saving draft:", error);
        alert("Failed to save draft.");
        return;
      }

      const postid = data?.[0]?.postid;
      for (const url of uploadedImageUrls) {
        await supabase
          .from("room_article_images")
          .insert([{ postid, image_url: url }]);
      }
    }

    // Cleanup
    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
    setShowDraftNotification(true);
    alert("Draft saved!");
    handleClearInputs();
    setIsUploading(false);
    setUploadAction(""); // DEVI ADDED THIS
  };

  // const handleEditorImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const previewUrl = URL.createObjectURL(file);
  //     setPendingImages((prev) => [...prev, { file, previewUrl }]);

  //     if (postType === "General") {
  //       editor.chain().focus().setImage({ src: previewUrl }).run();
  //     }
  //   }
  //   e.target.value = null;
  // };

  //DEVI MADE CHANGES HERE: IMPLEMENT FILE SIZE LIMITATION
  const handleEditorImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 50;
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(`Image is too large. Max file size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = null;
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { file, previewUrl }]);

    if (postType === "General") {
      editor.chain().focus().setImage({ src: previewUrl }).run();
    }

    e.target.value = null;
  };

  const handleClearInputs = () => {
    setTitle("");
    setTopics("");
    setArticleContent("");
    setImages([]);
    setSelectedRoom("");
    setShowConfirm(false);
    setPendingImages([]);
    setAccuracy(null);
    setAiFeedback("");
    setUploadAction(""); // <- DEVI ADDED THIS FOR THE LOAD AND POST INDICATOR

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
        background-color: #ffff00;
        color: #ff0000;
        padding: 0 2px;
        border-radius: 3px;
      }
         .ProseMirror {
        outline: none;
        position: relative;
        caret-color: black;
        box-sizing: border-box;
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
                {pendingImages.length > 0 && (
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
                            URL.revokeObjectURL(img.previewUrl);
                            const targetUrl = img.previewUrl;
                            editor.commands.focus();
                            editor.commands.setContent(
                              editor
                                .getHTML()
                                .replaceAll(
                                  `<img src="${targetUrl}"`,
                                  '<img src="__toRemove__"'
                                ) // mark
                            );
                            setPendingImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            setTimeout(() => {
                              const updatedHtml = editor
                                .getHTML()
                                .replaceAll('<img src="__toRemove__"', "");
                              editor.commands.setContent(updatedHtml);

                              // DEVI MADE CHANGES HERE - Optionally force cleanup of deleted image nodes from the DOM, NOT REALLY NEED?
                              // if (editor) {
                              // editor.commands.focus().run();
                              // }
                            }, 0);
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
                      if (e.key === "Tab" || (e.key === "Tab" && e.shiftKey)) {
                        e.preventDefault();
                      }
                    }}
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
              </>
            ) : (
              <p className="text-gray-500">Loading editor...</p>
            )}
          </div>

          {/* <div className="flex justify-end gap-3">
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
          </div> */}

          <div className="flex justify-end gap-3">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              disabled={isUploading}
            >
              Clear
            </button>

            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={handleSaveDraft}
              disabled={isUploading}
            >
              {isUploading && uploadAction === "draft"
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={handlePostArticle}
              disabled={isUploading}
            >
              {isUploading && uploadAction === "post" ? "Posting..." : "Post"}
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

        {showTopicApplication && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
              <h2 className="text-xl font-semibold mb-3 text-left">
                Topic Application
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                <ul className="text-gray-600 text-sm mb-4 list-disc list-inside text-left space-y-2">
                  <li>Your requested topic will be reviewed by our admins.</li>
                  <li>
                    Approved if 15 or more users apply for the same topic.
                  </li>
                  <li>Please post under an existing topic in the meantime.</li>
                </ul>
              </p>
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
      </main>
    </div>
  );
};

export default PremiumWriteArticle;
