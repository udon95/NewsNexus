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
import FactCheckReview from "./../factCheckReview"; // Assuming FactCheckReview.jsx is in the same directory or path is adjusted

export const PremiumWriteArticle = () => {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("");
  const [articleContent, setArticleContent] = useState(""); // Raw HTML from editor
  // const [images, setImages] = useState([]); // This state seems unused, pendingImages is used instead
  const [showConfirm, setShowConfirm] = useState(false);
  const [postType, setPostType] = useState("General");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [topicOptions, setTopicOptions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;
  // const editorRef = useRef(null); // editor instance is directly used
  const [newTopicName, setNewTopicName] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  // const [roomArticleType, setRoomArticleType] = useState("factual"); // only for Room - seems unused

  // --- States for Fact Checking Flow ---
  const [aiFeedback, setAiFeedback] = useState(""); // Stores feedback HTML from AI
  const [accuracy, setAccuracy] = useState(null); // Stores accuracy score from AI
  const [userProvidedFeedbackForRecheck, setUserProvidedFeedbackForRecheck] =
    useState(""); // User's text feedback for re-check
  const [isFactCheckingOrSubmitting, setIsFactCheckingOrSubmitting] =
    useState(false); // General loading state for API calls
  const [showFactCheckReviewModal, setShowFactCheckReviewModal] =
    useState(false); // Controls visibility of FactCheckReview modal
  const [contentForReview, setContentForReview] = useState(""); // Stores HTML content that was sent for the last fact-check
  const [imageUrlsForReview, setImageUrlsForReview] = useState([]); // Stores image URLs for the contentForReview

  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [showTopicApplication, setShowTopicApplication] = useState(false);
  // const [isUploading, setIsUploading] = useState(false); // Replaced by isFactCheckingOrSubmitting
  const [uploadAction, setUploadAction] = useState(""); // "post" or "draft"
  const [pendingImages, setPendingImages] = useState([]); // { file: File, previewUrl: string }

  const [searchParams] = useSearchParams();
  const preSelectedType = searchParams.get("type");
  const preSelectedRoomId = searchParams.get("roomid");

  // Fetch Topics
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");
      if (!error && data) setTopicOptions(data);
    };
    fetchTopics();
  }, []);

  // Fetch User Rooms
  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!userId) return;
      const { data: memberData, error: memberError } = await supabase
        .from("room_members")
        .select("roomid")
        .eq("userid", userId)
        .is("exited_at", null);

      if (memberError || !memberData) return;
      const roomIds = [
        ...new Set(memberData.map((entry) => entry.roomid).filter(Boolean)),
      ];
      if (roomIds.length === 0) {
        setRooms([]);
        return;
      }
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("roomid, name")
        .in("roomid", roomIds);
      if (!roomError && roomData) setRooms(roomData);
    };
    fetchUserRooms();
  }, [userId]);

  // Pre-select room if params are present
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
    /* ... */
  });
  const IndentExtension = Extension.create({
    /* ... */
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
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your article..." }),
      TiptapLink.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: articleContent, // Initialize with articleContent
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
        editor.commands.setContent(articleContent); // Rollback
        return;
      }
      setWordCount(words);
      setArticleContent(html);

      // Handle pending images if post type is General
      // This logic might need review if images are removed/added outside the image upload button
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

  const MAX_WORDS = postType === "Room" ? 400 : 1000;

  // Effect to handle image display in editor based on postType
  useEffect(() => {
    if (!editor) return;
    // This logic for re-inserting/removing images on postType change might be complex.
    // Simpler might be to clear pendingImages or handle them differently if postType changes after images are added.
  }, [postType, editor, pendingImages]);

  // Function to upload pending images and get their public URLs
  const uploadAndGetImagePublicUrls = async (imagesToUpload, bucket) => {
    let firstImageUrl = null;
    let uploadedImageUrls = [];
    let htmlWithUploadedUrls = editor ? editor.getHTML() : articleContent; // Get current HTML

    for (const img of imagesToUpload) {
      const file = img.file;
      if (!file?.name) continue;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `user-${userId}/${fileName}`; // Ensure userId is available

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      if (uploadError) {
        console.error("Image upload failed:", uploadError);
        throw new Error("Image upload failed: " + uploadError.message); // Propagate error
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;

      if (publicUrl) {
        if (!firstImageUrl) firstImageUrl = publicUrl;
        htmlWithUploadedUrls = htmlWithUploadedUrls.replaceAll(
          img.previewUrl,
          publicUrl
        );
        uploadedImageUrls.push(publicUrl);
      }
    }
    return {
      firstImageUrl,
      uploadedImageUrls,
      finalHtml: htmlWithUploadedUrls,
    };
  };

  const handlePostArticle = async () => {
    setUploadAction("post");
    if (isFactCheckingOrSubmitting) return;
    setIsFactCheckingOrSubmitting(true);

    if (!userId) {
      alert("User not authenticated. Cannot upload.");
      setIsFactCheckingOrSubmitting(false);
      setUploadAction("");
      return;
    }
    if (
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields.");
      setIsFactCheckingOrSubmitting(false);
      setUploadAction("");
      return;
    }

    const currentEditorHTML = editor ? editor.getHTML() : articleContent;
    const topicName =
      postType === "General"
        ? topicOptions.find((t) => t.topicid === topics)?.name
        : null;

    try {
      if (postType === "General") {
        // --- General Article Flow with Fact-Checking ---
        if (!showFactCheckReviewModal) {
          // STAGE 1: Initial Fact-Check (or Re-check if userProvidedFeedbackForRecheck is present)
          const { uploadedImageUrls, finalHtml } =
            await uploadAndGetImagePublicUrls(pendingImages, "articles-images");

          const checkPayload = {
            content: finalHtml,
            topicName,
            userFeedback: userProvidedFeedbackForRecheck || null,
          };

          const response = await fetch(
            "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/check-article",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(checkPayload),
            }
          );
          const result = await response.json();

          setUserProvidedFeedbackForRecheck(""); // Clear after use

          if (!response.ok) {
            // AI flagged issues or error during check
            setAiFeedback(result.feedback || "Error: Could not get feedback.");
            setAccuracy(result.accuracy || 0);
            setContentForReview(finalHtml); // Store the HTML that was checked
            setImageUrlsForReview(uploadedImageUrls); // Store corresponding image URLs
            setShowFactCheckReviewModal(true); // Show review modal
            alert(
              result.error ||
                "Article flagged by AI. Please review the highlighted sections."
            );
          } else {
            // Check was successful, AI provides feedback and accuracy
            setAiFeedback(result.feedback);
            setAccuracy(result.accuracy || 0);
            setContentForReview(finalHtml);
            setImageUrlsForReview(uploadedImageUrls);
            setShowFactCheckReviewModal(true); // Always show review modal after a check for user confirmation
          }
        } else {
          // STAGE 2: Submitting article after user approval from FactCheckReview modal
          const submitPayload = {
            title,
            content: contentForReview, // Use the HTML that was reviewed and approved
            type: "factual",
            authorId: userId,
            topicid: topics,
            topicName,
            imageUrls: imageUrlsForReview, // Use image URLs corresponding to contentForReview
            userFeedback: null, // Or pass last user feedback if backend needs it for logs
            refactCheck: true, // IMPORTANT: Tell backend to use provided accuracy/feedback
            accuracy: accuracy,
            feedback: aiFeedback,
          };

          const response = await fetch(
            "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/submit-article",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(submitPayload),
            }
          );
          const result = await response.json();

          if (!response.ok) {
            // Even with refactCheck:true, submission might fail (e.g. server error, last minute moderation issue if re-checked)
            alert(result.error || "Submission failed after review.");
            // Optionally, keep the review modal open or show error differently
            // setShowFactCheckReviewModal(true); // Could allow user to try re-check again if applicable
          } else {
            // Successful submission
            const articleid = result.article?.articleid;
            if (articleid && imageUrlsForReview.length > 0) {
              // Update imagepath in articles table (if backend doesn't handle this with imageUrls[0])
              // This might be redundant if backend's /submit-article already sets imagepath from imageUrls[0]
              await supabase
                .from("articles")
                .update({ imagepath: imageUrlsForReview[0] })
                .eq("articleid", articleid);

              // Link images to article in article_images (if backend doesn't handle this)
              // This is also potentially redundant if backend handles it
              for (const url of imageUrlsForReview) {
                await supabase
                  .from("article_images")
                  .insert([{ articleid, image_url: url }]);
              }
            }
            alert(
              `Article posted successfully. Accuracy Score: ${
                result.accuracy || accuracy
              }%`
            );
            handleClearInputsAndReviewState();
            setShowFactCheckReviewModal(false);
          }
        }
      } else {
        // --- Room Article Flow (Simpler, direct moderation and post) ---
        const { uploadedImageUrls, finalHtml, firstImageUrl } =
          await uploadAndGetImagePublicUrls(
            pendingImages,
            "room-article-images"
          );

        // Moderate content for Room Article
        const moderateResponse = await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/moderate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: finalHtml,
              imageUrls: uploadedImageUrls,
            }),
          }
        );
        const moderateResult = await moderateResponse.json();
        if (!moderateResponse.ok) {
          alert(
            `Room article flagged: ${
              moderateResult.error || "Moderation failed"
            }`
          );
          setIsFactCheckingOrSubmitting(false);
          setUploadAction("");
          return;
        }

        // Post Room Article
        const articleData = {
          title,
          content: finalHtml,
          roomid: selectedRoom,
          userid: userId,
          created_at: new Date().toISOString(),
          status: "Published",
        };
        const { data, error } = await supabase
          .from("room_articles")
          .insert([articleData])
          .select("postid");

        if (error) {
          throw new Error("Failed to post room article: " + error.message);
        }
        const postid = data?.[0]?.postid;
        if (postid && uploadedImageUrls.length > 0) {
          for (const url of uploadedImageUrls) {
            await supabase
              .from("room_article_images")
              .insert([{ postid, image_url: url }]);
          }
        }
        alert("Room article posted successfully.");
        handleClearInputsAndReviewState();
      }
    } catch (error) {
      console.error("Error in handlePostArticle:", error);
      alert(`An error occurred: ${error.message}`);
      // If error occurred during STAGE 1 (check-article), the review modal might not be open.
      // If it occurred during STAGE 2 (submit-article), the modal is open.
      // Decide if setShowFactCheckReviewModal(false) is appropriate here or keep it open for user.
    } finally {
      setIsFactCheckingOrSubmitting(false);
      setUploadAction("");
    }
  };

  const handleSaveDraft = async () => {
    setUploadAction("draft");
    if (isFactCheckingOrSubmitting) return;
    setIsFactCheckingOrSubmitting(true);

    // ... (validation: userId, title, content, etc.)
    if (
      !userId ||
      !title ||
      !articleContent ||
      (postType === "General" && !topics) ||
      (postType === "Room" && !selectedRoom)
    ) {
      alert("Please fill in all required fields to save a draft.");
      setIsFactCheckingOrSubmitting(false);
      setUploadAction("");
      return;
    }

    const currentEditorHTML = editor ? editor.getHTML() : articleContent;

    try {
      const bucket =
        postType === "Room" ? "room-article-images" : "articles-images";
      const { uploadedImageUrls, finalHtml, firstImageUrl } =
        await uploadAndGetImagePublicUrls(pendingImages, bucket);

      // Moderation for drafts (both General and Room)
      const moderateResponse = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/moderate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: finalHtml,
            imageUrls: uploadedImageUrls,
          }),
        }
      );
      const moderateResult = await moderateResponse.json();
      if (!moderateResponse.ok) {
        alert(
          `Draft flagged by moderation: ${
            moderateResult.error || "Content not suitable for draft."
          }`
        );
        setIsFactCheckingOrSubmitting(false);
        setUploadAction("");
        return;
      }

      if (postType === "General") {
        const { data, error } = await supabase
          .from("articles")
          .insert([
            {
              title,
              text: finalHtml,
              userid: userId,
              topicid: topics,
              time: new Date().toISOString(),
              status: "Draft",
              imagepath: firstImageUrl || null,
              // Do not save accuracy/feedback for drafts initially
            },
          ])
          .select("articleid");
        if (error)
          throw new Error("Failed to save general draft: " + error.message);
        const articleid = data?.[0]?.articleid;
        if (articleid) {
          for (const url of uploadedImageUrls) {
            await supabase
              .from("article_images")
              .insert([{ articleid, image_url: url }]);
          }
        }
      } else {
        // Room Draft
        const { data, error } = await supabase
          .from("room_articles")
          .insert([
            {
              title,
              content: finalHtml,
              roomid: selectedRoom,
              userid: userId,
              created_at: new Date().toISOString(),
              status: "Draft",
            },
          ])
          .select("postid");
        if (error)
          throw new Error("Failed to save room draft: " + error.message);
        const postid = data?.[0]?.postid;
        if (postid) {
          for (const url of uploadedImageUrls) {
            await supabase
              .from("room_article_images")
              .insert([{ postid, image_url: url }]);
          }
        }
      }
      alert("Draft saved successfully!");
      setShowDraftNotification(true);
      handleClearInputsAndReviewState();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(`Failed to save draft: ${error.message}`);
    } finally {
      setIsFactCheckingOrSubmitting(false);
      setUploadAction("");
    }
  };

  const handleEditorImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_FILE_SIZE_MB = 50; // Example limit
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`Image is too large. Max file size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = null;
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { file, previewUrl }]);
    if (editor) {
      // Insert into editor only if it's a general post or if images are allowed in room post editor
      if (postType === "General") {
        // Or your condition for allowing images in editor
        editor.chain().focus().setImage({ src: previewUrl }).run();
      }
    }
    e.target.value = null;
  };

  const removePendingImage = (indexToRemove, previewUrlToRemove) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(previewUrlToRemove);
    // Remove from pendingImages state
    setPendingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    // Remove from Tiptap editor if it exists there
    if (editor && editor.getHTML().includes(previewUrlToRemove)) {
      const currentContent = editor.getHTML();
      // Regex to remove the img tag, including potential surrounding p tags if empty
      const imgTagRegex = new RegExp(
        `<p><img src="${previewUrlToRemove}"[^>]*><\/p>|<img src="${previewUrlToRemove}"[^>]*>`,
        "g"
      );
      const updatedContent = currentContent.replace(imgTagRegex, "");
      editor.commands.setContent(updatedContent);
    }
  };

  const handleClearInputsAndReviewState = () => {
    setTitle("");
    setTopics("");
    // setArticleContent(""); // Editor content will be cleared by editor.commands.clearContent()
    setSelectedRoom("");
    setShowConfirm(false);
    setPendingImages([]);
    if (editor) {
      editor.commands.clearContent(true); // Pass true to clear history as well
      setWordCount(0); // Reset word count after clearing editor
    }
    // Reset fact-check states
    setAiFeedback("");
    setAccuracy(null);
    setUserProvidedFeedbackForRecheck("");
    setShowFactCheckReviewModal(false);
    setContentForReview("");
    setImageUrlsForReview([]);
    setUploadAction("");
  };

  useEffect(() => {
    const style = document.createElement("style");
    // ... (Tiptap editor styling)
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmitTopicApplication = async () => {
    /* ... */
  };

  // --- FactCheckReview Modal Action Handlers ---
  const handleApproveFromReviewModal = () => {
    // User has approved the AI's feedback (or the result of a re-check).
    // Now, handlePostArticle will proceed to STAGE 2 (submission).
    // showFactCheckReviewModal is already true.
    // contentForReview, imageUrlsForReview, accuracy, aiFeedback are already set.
    handlePostArticle(); // This will now go to the 'else' block in handlePostArticle for submission
  };

  const handleRequestRecheckFromReviewModal = async (userFeedbackText) => {
    if (!userFeedbackText.trim()) {
      alert("Please provide feedback for the re-check.");
      return;
    }
    setUserProvidedFeedbackForRecheck(userFeedbackText); // Store it
    setShowFactCheckReviewModal(false); // Hide modal temporarily while re-checking
    // Call handlePostArticle, which will now pick up `userProvidedFeedbackForRecheck`
    // and go through STAGE 1 (check-article) again.
    // The content sent will be `contentForReview` as that's what the user was looking at.

    // We need to call the check-article part of handlePostArticle directly or refactor
    // For simplicity here, let's re-trigger the check logic.
    setIsFactCheckingOrSubmitting(true);
    setUploadAction("post"); // Indicate a posting action is in progress
    const topicName = topicOptions.find((t) => t.topicid === topics)?.name;

    try {
      const checkPayload = {
        content: contentForReview, // Use the content that was previously reviewed
        topicName,
        userFeedback: userFeedbackText,
      };
      const response = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/api/check-article",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkPayload),
        }
      );
      const result = await response.json();

      setAiFeedback(result.feedback || "Error during re-check.");
      setAccuracy(result.accuracy || 0);
      // contentForReview and imageUrlsForReview remain the same as they were for the initial check
      // that led to this re-check request.

      if (!response.ok) {
        alert(
          result.error || "Article flagged again after re-check. Please review."
        );
      } else {
        alert("Re-check complete. Please review the updated feedback.");
      }
    } catch (error) {
      console.error("Error during re-check API call:", error);
      alert("Failed to process re-check request: " + error.message);
      setAiFeedback("Error: Could not process re-check.");
      setAccuracy(0);
    } finally {
      setShowFactCheckReviewModal(true); // Re-show modal with new feedback
      setIsFactCheckingOrSubmitting(false);
      setUserProvidedFeedbackForRecheck(""); // Clear after use
      setUploadAction("");
    }
  };

  const handleCancelFromReviewModal = () => {
    setShowFactCheckReviewModal(false);
    // Reset states related to the current review cycle
    setAiFeedback("");
    setAccuracy(null);
    setUserProvidedFeedbackForRecheck("");
    setContentForReview(""); // Clear the content that was under review
    setImageUrlsForReview([]); // Clear its associated images
    // The main editor (articleContent) still holds what the user was originally writing.
    // User can choose to try posting again (will trigger a fresh check) or clear everything.
  };

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full max-w-4xl p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold mb-1">Publish Your Articles :</h1>

        <div className="flex flex-col gap-5 w-full">
          {/* Article Title Input */}
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
              disabled={isFactCheckingOrSubmitting || showFactCheckReviewModal}
            />
          </div>

          {/* Post Type and Topic/Room Selection */}
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
                      onChange={() => {
                        if (
                          isFactCheckingOrSubmitting ||
                          showFactCheckReviewModal
                        )
                          return;
                        setPostType(type);
                        // Clear pending images if switching to Room type and images are in editor
                        if (
                          type === "Room" &&
                          editor &&
                          pendingImages.length > 0
                        ) {
                          // This logic needs to be careful not to clear images intended for room post if they are not in editor
                        }
                      }}
                      disabled={
                        isFactCheckingOrSubmitting || showFactCheckReviewModal
                      }
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
              {postType === "General" ? (
                <div className="flex items-center gap-2 w-full">
                  {/* Topic Dropdown */}
                  <div className="relative w-full">
                    <div
                      onClick={() =>
                        !(
                          isFactCheckingOrSubmitting || showFactCheckReviewModal
                        ) && setShowTopicsDropdown(!showTopicsDropdown)
                      }
                      className={`p-2 border rounded-md bg-white w-full cursor-pointer flex justify-between items-center ${
                        isFactCheckingOrSubmitting || showFactCheckReviewModal
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {topics
                        ? topicOptions.find((t) => t.topicid === topics)?.name
                        : "Select a topic"}
                      <button className="ml-2 text-gray-500 text-sm">
                        {" "}
                        {showTopicsDropdown ? "▲" : "▼"}{" "}
                      </button>
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
                    className="bg-black text-white rounded-md p-2 flex items-center justify-center h-full disabled:opacity-50"
                    onClick={() => setShowTopicApplication(true)}
                    disabled={
                      isFactCheckingOrSubmitting || showFactCheckReviewModal
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                /* Room Selection */
                <div className="relative w-full">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="p-2 border rounded-md w-full bg-white appearance-none pr-8 disabled:opacity-50"
                    disabled={
                      isFactCheckingOrSubmitting || showFactCheckReviewModal
                    }
                  >
                    <option value="" disabled>
                      {" "}
                      Select a room{" "}
                    </option>
                    {rooms.map((room) => (
                      <option key={room.roomid} value={room.roomid}>
                        {" "}
                        {room.name}{" "}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 text-sm">
                    ▼
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article Content Editor */}
          <div>
            <label className="block text-xl font-semibold mb-1">
              Article Content:
            </label>
            {editor ? (
              <>
                {/* Image Upload Button - only for General posts or if Room posts allow images in editor */}
                {postType === "General" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="imageUploadInput"
                      className="hidden"
                      onChange={handleEditorImageUpload}
                    />
                    <button
                      className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      onClick={() =>
                        document.getElementById("imageUploadInput").click()
                      }
                      disabled={
                        isFactCheckingOrSubmitting || showFactCheckReviewModal
                      }
                    >
                      {" "}
                      Upload Image for Article Body{" "}
                    </button>
                  </>
                )}
                {/* For Room posts, if images are not in editor but attached separately */}
                {postType === "Room" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="roomImageUploadInput"
                      className="hidden"
                      onChange={handleEditorImageUpload}
                    />
                    <button
                      className="w-full mt-2 bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      onClick={() =>
                        document.getElementById("roomImageUploadInput").click()
                      }
                      disabled={
                        isFactCheckingOrSubmitting || showFactCheckReviewModal
                      }
                    >
                      {" "}
                      Attach Image(s) for Room Post{" "}
                    </button>
                  </>
                )}

                {/* Preview attached images (common for both, but display might differ) */}
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
                          onClick={() =>
                            !(
                              isFactCheckingOrSubmitting ||
                              showFactCheckReviewModal
                            ) && removePendingImage(index, img.previewUrl)
                          }
                          className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-100 disabled:opacity-50"
                          disabled={
                            isFactCheckingOrSubmitting ||
                            showFactCheckReviewModal
                          }
                        >
                          {" "}
                          ×{" "}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tiptap Toolbar */}
                <div
                  className={`flex flex-wrap items-center gap-2 bg-white p-3 mt-4 border rounded-lg shadow-md text-sm font-medium ${
                    isFactCheckingOrSubmitting || showFactCheckReviewModal
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {/* ... Toolbar buttons (Bold, Italic, etc.) ... */}
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
                    {" "}
                    <option value="0">Normal</option>{" "}
                    <option value="1">H1</option> <option value="2">H2</option>{" "}
                    <option value="3">H3</option>{" "}
                  </select>
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <Bold size={16} />{" "}
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <Italic size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <UnderlineIcon size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <ListOrdered size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <List size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <AlignLeft size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <AlignCenter size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <AlignRight size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleHighlight().run()
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <Highlighter size={16} />{" "}
                  </button>
                  <button
                    onClick={() => {
                      setLinkUrl("");
                      setShowLinkModal(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {" "}
                    <LinkIcon size={16} />{" "}
                  </button>
                </div>

                {/* Display AI Feedback & Accuracy if not in review modal (e.g., for drafts or non-critical info) */}
                {/* This section might be redundant if all feedback is shown in the modal */}
                {(accuracy !== null || aiFeedback) &&
                  !showFactCheckReviewModal && (
                    <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded text-sm text-black">
                      <strong>Fact Check Results (Informational):</strong>
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

                {/* Tiptap Editor Content Area */}
                <div
                  className={`min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md bg-white p-4 mt-3 focus-within:outline-none ${
                    isFactCheckingOrSubmitting || showFactCheckReviewModal
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={() =>
                    !(isFactCheckingOrSubmitting || showFactCheckReviewModal) &&
                    editor.commands.focus()
                  }
                >
                  <EditorContent
                    editor={editor}
                    className="min-h-[200px] w-full outline-none p-2 text-base leading-relaxed"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {" "}
                  Word Count: {wordCount} / {MAX_WORDS}{" "}
                </p>
                {wordCount >= MAX_WORDS && (
                  <p className="text-red-600 text-sm mt-1">
                    {" "}
                    Maximum word count reached.{" "}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Loading editor...</p>
            )}
          </div>

          {/* Action Buttons: Clear, Save Draft, Post */}
          <div className="flex justify-end gap-3">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              disabled={isFactCheckingOrSubmitting || showFactCheckReviewModal}
            >
              {" "}
              Clear{" "}
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={handleSaveDraft}
              disabled={
                isFactCheckingOrSubmitting ||
                showFactCheckReviewModal ||
                postType ===
                  "General" /* Disable draft for general if it goes through fact check first */
              }
            >
              {isFactCheckingOrSubmitting && uploadAction === "draft"
                ? "Saving..."
                : "Save Draft"}
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={handlePostArticle}
              disabled={isFactCheckingOrSubmitting || showFactCheckReviewModal}
            >
              {isFactCheckingOrSubmitting && uploadAction === "post"
                ? showFactCheckReviewModal
                  ? "Submitting..."
                  : "Checking..."
                : showFactCheckReviewModal
                ? "Submit Post"
                : "Check & Proceed"}
            </button>
          </div>
        </div>

        {/* Modals: Clear Confirmation, Link Input, Draft Notification, Topic Application */}
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

        {/* FactCheckReview Modal */}
        {showFactCheckReviewModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <FactCheckReview
                accuracy={accuracy}
                feedback={aiFeedback}
                onApprove={handleApproveFromReviewModal}
                onRequestRecheck={handleRequestRecheckFromReviewModal}
                onCancel={handleCancelFromReviewModal}
                isLoading={isFactCheckingOrSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PremiumWriteArticle;
