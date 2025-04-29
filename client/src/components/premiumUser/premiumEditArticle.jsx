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
import { useParams } from "react-router-dom";
import PremSideBar from "./premSideBar";
import { NodeSelection } from "prosemirror-state";

export const PremiumEditArticle = () => {
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
  const supabaseUid = storedUser?.user?.id || storedUser?.user?.userid;
  const editorRef = useRef(null);
  const [showTopicApplication, setShowTopicApplication] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const { id } = useParams(); // Used to fetch article data
  const [editMode, setEditMode] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [isRoom, setIsRoom] = useState(false);
  const [amendment, setAmendment] = useState("");
  const supabaseImagesInsertedRef = useRef(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  //   console.log("Auth session:", supabase.auth.getSession());

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
    editable: true, // default to true

    editorProps: {
      handleClickOn(view, pos, node, nodePos, event) {
        if (node.type.name === "image") {
          const { state, dispatch } = view;
          const selection = state.tr.setSelection(
            NodeSelection.create(state.doc, nodePos)
          );
          dispatch(selection);
          return true;
        }
        return false;
      },
      attributes: {
        class: "focus:outline-none",
        contenteditable: isDraft ? "true" : "false",
      },
    },

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
      if (!editorReady) return;

      const text = editor.getText();
      const wordsArray = text.trim().split(/\s+/).filter(Boolean);
      const words = wordsArray.length;

      if (words > MAX_WORDS) {
        editor.commands.setContent(articleContent);
        return;
      }

      setWordCount(words);
      const html = editor.getHTML();
      setArticleContent(html);

      const doc = new DOMParser().parseFromString(html, "text/html");
      const imageSrcsInEditor = Array.from(doc.querySelectorAll("img")).map(
        (img) => img.getAttribute("src")
      );

      setPendingImages((prev) => {
        const isGeneralDraft = isDraft && postType === "General";
        if (!isGeneralDraft) return prev;

        const local = prev.filter((img) => img.previewUrl?.startsWith("blob:"));
        const supabaseImages = prev.filter(
          (img) => !img.previewUrl?.startsWith("blob:")
        );

        const stillUsedLocal = local.filter((img) =>
          imageSrcsInEditor.includes(img.previewUrl)
        );
        const stillUsedSupabase = supabaseImages.filter((img) =>
          imageSrcsInEditor.includes(img.previewUrl)
        );

        const removedLocal = local.filter(
          (img) => !imageSrcsInEditor.includes(img.previewUrl)
        );

        removedLocal.forEach((img) => {
          if (img.previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(img.previewUrl);
          }
        });

        return [...stillUsedLocal, ...stillUsedSupabase];
      });
    },
  });

  const setEditorContent = (html) => {
    if (editor) {
      editor.commands.setContent(html || "");
    }
  };

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

    console.log("User from localStorage:", session);

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

    // let updatedHTML = articleContent;
    let updatedHTML = editor?.getHTML() || articleContent;
    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
    let firstImageUrl = null;

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    // for (const img of pendingImages) {
    for (const img of pendingImages) {
      const file = img.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const filePath = `user-${supabaseUid}/${fileName}`;

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
          // updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);
          const doc = new DOMParser().parseFromString(updatedHTML, "text/html");
          doc.querySelectorAll("img").forEach((imgTag) => {
            if (imgTag.src === img.previewUrl) {
              imgTag.src = urlData.publicUrl;
            }
          });
          updatedHTML = doc.body.innerHTML;
        }
      }
    }

    const articleData = {
      title,
      content: updatedHTML,
      created_by: session.userid, // Use session ID for the user
      created_at: new Date().toISOString(),
    };

    if (postType === "General") {
      articleData.topic = topics;

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

      console.log(articleData.topic, error);

      if (error) {
        alert("Failed to post article.");
        return;
      }

      const articleid = data?.[0]?.articleid;

      for (const img of pendingImages) {
        if (!img.file) continue; // skip images loaded from Supabase (no file to upload)

        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${session.userid}/${fileName}`; // Corrected path

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
    } else {
      articleData.roomid = selectedRoom;
      const { data, error } = await supabase
        .from("room_articles")
        .insert([
          {
            title: articleData.title,
            content: articleData.content,
            roomid: selectedRoom,
            userid: session.userid,
            // created_at: articleData.created_at,
            status: "Published",
          },
        ])
        .select("postid");

      if (error) {
        alert("Failed to post article.");
        return;
      }

      const postid = data?.[0]?.postid;
      for (const img of pendingImages) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const filePath = `user-${userId}/${fileName}`;

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

    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
    alert("Article posted!");
    handleClearInputs();
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

    // let updatedHTML = articleContent;
    let updatedHTML = editor?.getHTML() || articleContent;
    const bucket =
      postType === "Room" ? "room-article-images" : "articles-images";
    let firstImageUrl = null;

    // Remove old images only if General
    if (postType === "General" && id) {
      const { data: oldImages } = await supabase
        .from("article_images")
        .select("image_url")
        .eq("articleid", id);

      const oldPaths = (oldImages || [])
        .map((img) => {
          const prefix = "articles-images/";
          const startIndex = img.image_url.indexOf(prefix);
          return startIndex !== -1
            ? img.image_url.slice(startIndex + prefix.length)
            : null;
        })
        .filter(Boolean);

      if (oldPaths.length > 0) {
        await supabase.storage.from("articles-images").remove(oldPaths);
      }

      await supabase.from("article_images").delete().eq("articleid", id);
    }

    // Upload new images first
    for (const img of pendingImages) {
      const file = img.file;
      if (!file) continue; // skip already uploaded Supabase images

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `user-${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert("Image upload failed.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl;

        // Replace local object URL with Supabase URL
        const doc = new DOMParser().parseFromString(updatedHTML, "text/html");
        doc.querySelectorAll("img").forEach((imgTag) => {
          if (imgTag.src === img.previewUrl) {
            imgTag.src = urlData.publicUrl;
          }
        });
        updatedHTML = doc.body.innerHTML;
      }
    }

    const articleData = {
      title,
      userid: session.userid,
      topicid: topics,
      time: new Date().toISOString(),
      imagepath: firstImageUrl || null,
      status: "Draft",
    };

    if (postType === "General") {
      const { error } = await supabase
        .from("articles")
        .update({
          title: articleData.title,
          text: updatedHTML,
          topicid: articleData.topicid,
          userid: articleData.userid,
          time: articleData.time,
          imagepath: articleData.imagepath,
          status: "Draft",
        })
        .eq("articleid", id);

      if (error) {
        console.error("Error saving draft:", error);
        return alert("Failed to save draft.");
      }

      // Insert images into article_images table
      for (const img of pendingImages) {
        if (!img.file) continue;
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${userId}/${fileName}`;
        const { data: urlData } = supabase.storage
          .from("articles-images")
          .getPublicUrl(filePath);
        const imageUrl = urlData?.publicUrl;
        if (imageUrl) {
          await supabase
            .from("article_images")
            .insert([{ articleid: id, image_url: imageUrl }]);
        }
      }
    } else {
      const { error } = await supabase
        .from("room_articles")
        .update({
          title: articleData.title,
          content: updatedHTML,
          roomid: selectedRoom,
          userid: session.userid,
          created_at: articleData.time,
          status: "Draft",
        })
        .eq("postid", id);

      if (error) {
        console.error("Error saving draft:", error);
        return alert("Failed to save draft.");
      }

      // Insert images into room_article_images table
      for (const img of pendingImages) {
        if (!img.file) continue;
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `user-${userId}/${fileName}`;
        const { data: urlData } = supabase.storage
          .from("room-article-images")
          .getPublicUrl(filePath);
        const imageUrl = urlData?.publicUrl;
        if (imageUrl) {
          await supabase
            .from("room_article_images")
            .insert([{ postid: id, image_url: imageUrl }]);
        }
      }
    }

    pendingImages.forEach((img) => {
      if (img.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setPendingImages([]);

    setShowDraftNotification(true);
    alert("Draft saved!");
  };

  const handlePostGeneralDraft = async () => {
    if (!title || !articleContent || !topics) {
      alert("Please fill in all required fields for General article.");
      return;
    }

    let updatedHTML = editor?.getHTML() || articleContent;
    let firstImageUrl = null;

    for (const img of pendingImages) {
      const file = img.file;
      if (!file) continue;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `user-${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("articles-images")
        .upload(filePath, file);
      if (uploadError) {
        alert("Image upload failed.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("articles-images")
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl;

        const doc = new DOMParser().parseFromString(updatedHTML, "text/html");
        doc.querySelectorAll("img").forEach((imgTag) => {
          if (imgTag.src === img.previewUrl) {
            imgTag.src = urlData.publicUrl;
          }
        });
        updatedHTML = doc.body.innerHTML;
      }
    }

    const { error } = await supabase
      .from("articles")
      .update({
        title,
        text: updatedHTML,
        topicid: topics,
        userid: userId,
        time: new Date().toISOString(),
        imagepath: firstImageUrl || null,
        status: "Published",
      })
      .eq("articleid", id);

    if (error) {
      alert("Failed to post General article.");
      return;
    }

    pendingImages.forEach((img) => {
      if (img.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setPendingImages([]);

    alert("General article posted!");
    handleClearInputs();
  };

  const handlePostRoomDraft = async () => {
    if (!title || !articleContent || !selectedRoom) {
      alert("Please fill in all required fields for Room article.");
      return;
    }

    let updatedHTML = editor?.getHTML() || articleContent;

    for (const img of pendingImages) {
      const file = img.file;
      if (!file) continue;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `user-${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("room-article-images")
        .upload(filePath, file);
      if (uploadError) {
        alert("Image upload failed.");
        return;
      }
    }

    const { error } = await supabase
      .from("room_articles")
      .update({
        title,
        content: updatedHTML,
        roomid: selectedRoom,
        userid: userId,
        created_at: new Date().toISOString(),
        status: "Published",
      })
      .eq("postid", id);

    if (error) {
      alert("Failed to post Room article.");
      return;
    }

    pendingImages.forEach((img) => {
      if (img.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setPendingImages([]);

    alert("Room article posted!");
    handleClearInputs();
  };

  const [pendingImages, setPendingImages] = useState([]);

  // const handleEditorImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {

  //     if (file.size > 50 * 1024 * 1024) {
  //       alert("Image size exceeds 50MB limit. Please upload a smaller file.");
  //       return;
  //     }

  //     const previewUrl = URL.createObjectURL(file);
  //     setPendingImages((prev) => [...prev, { file, previewUrl }]);

  //     if (postType === "General") {
  //       editor.chain().focus().setImage({ src: previewUrl }).run();
  //     }
  //   }
  //   e.target.value = null;
  // };

  const handleEditorImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Image size exceeds 50MB limit. Please upload a smaller file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { file, previewUrl }]);

    // Only for General Post + Draft
    if (editor && isDraft && postType === "General") {
      editor.chain().focus().setImage({ src: previewUrl }).run();
    }

    e.target.value = null; // Reset the input
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

  useEffect(() => {
    if (!editor) return;

    const fetchArticleToEdit = async () => {
      if (!id) return;

      try {
        const { data: generalData, error: generalError } = await supabase
          .from("articles")
          .select("*")
          .eq("articleid", id);
        // .single();

        // if (generalData) {
        if (generalData && generalData.length > 0) {
          const article = generalData[0];
          setPostType("General");
          setIsRoom(false);
          setIsDraft(article.status === "Draft");
          setTitle(article.title);
          setTopics(article.topicid);
          setArticleContent(article.text);
          // setEditorContent(article.text);
          editor.commands.setContent(article.text); // This is already called
          if (article.amendment) {
            setAmendment(article.amendment);
          }

          if (generalError) {
            console.error(
              "Supabase error fetching article:",
              generalError.message
            );
          }

          console.log("Fetched article status:", article.status);
          console.log("Setting isDraft to:", article.status === "Draft");

          if (generalData.status === "Draft") {
            const { data: imageRows } = await supabase
              .from("article_images")
              .select("image_url")
              .eq("articleid", id);

            if (imageRows) {
              const draftImages = imageRows.map((img) => ({
                file: null,
                previewUrl: img.image_url,
              }));

              if (!supabaseImagesInsertedRef.current) {
                setPendingImages(draftImages); // overwrite
                for (const img of imageRows) {
                  editor.commands.setImage({ src: img.image_url });
                }
                supabaseImagesInsertedRef.current = true;
              }
            }

            setTimeout(() => {
              editor.setEditable(true);
              setEditorReady(true);
            }, 0);
          }

          return; // STOP right here, do not proceed to fetch roomData
        }

        const { data: roomData, error: roomError } = await supabase
          .from("room_articles")
          .select("postid, title, content, roomid, status")
          .eq("postid", id)
          .single();

        if (roomData) {
          setPostType("Room");
          setIsRoom(true);
          setIsDraft(roomData.status === "Draft");
          setTitle(roomData.title);
          setSelectedRoom(roomData.roomid);
          setArticleContent(roomData.content);
          setEditorContent(roomData.content);
          if (roomData.amendment) {
            setAmendment(roomData.amendment);
          }

          if (editor) editor.setEditable(roomData.status === "Draft");

          const { data: imageRows } = await supabase
            .from("room_article_images")
            .select("image_url")
            .eq("postid", id);

          if (imageRows) {
            setPendingImages(
              imageRows.map((img) => ({
                file: null,
                previewUrl: img.image_url,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error loading article for editing:", err);
      }
    };

    fetchArticleToEdit();
  }, [editor, id]);

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
    setEditorReady(false);
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
    // <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
    //   <main className="w-full max-w-4xl p-10 flex flex-col gap-6">
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden bg-indigo-50 justify-center">
      <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[250px] md:flex-none">
          <PremSideBar />
        </aside>
        <main className="w-full max-w-4xl p-10 flex flex-col gap-6 mx-auto">
          <h1 className="text-3xl font-bold mb-1">
            {isDraft
              ? "Edit Your Draft Articles :"
              : "Edit Your Posted Articles :"}
          </h1>

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
                disabled={!isDraft}
                className="w-full p-2 border border-black rounded-md bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-xl font-semibold mb-1">
                Post Type:
              </label>
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="postType"
                      value="General"
                      checked={postType === "General"}
                      disabled
                    />
                    General
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="postType"
                      value="Room"
                      checked={postType === "Room"}
                      disabled
                    />
                    Room
                  </label>
                </div>

                {postType === "General" ? (
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative w-full">
                      <div
                        onClick={() =>
                          isDraft && setShowTopicsDropdown(!showTopicsDropdown)
                        }
                        className={`p-2 border rounded-md bg-white w-full cursor-${
                          isDraft ? "pointer" : "default"
                        } flex justify-between items-center`}
                      >
                        {topics
                          ? topicOptions.find((t) => t.topicid === topics)?.name
                          : "Select a topic"}

                        <button
                          className="ml-2 text-gray-500 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            isDraft &&
                              setShowTopicsDropdown(!showTopicsDropdown);
                          }}
                        >
                          {showTopicsDropdown ? "▲" : "▼"}
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
                    {isDraft && (
                      <button
                        className="bg-black text-white rounded-md p-2 flex items-center justify-center h-full"
                        onClick={() => setShowTopicApplication(true)}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full">
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="p-2 border rounded-md w-full bg-white appearance-none pr-8"
                      disabled={!isDraft}
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

                  {isDraft && (
                    <button
                      className="w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md"
                      onClick={() =>
                        document.getElementById("imageUploadInput").click()
                      }
                    >
                      Upload Image
                    </button>
                  )}

                  {pendingImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {pendingImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative border rounded-lg overflow-hidden shadow"
                        >
                          <img
                            src={img.previewUrl}
                            className="object-cover w-full"
                            style={{ height: "8rem" }}
                            alt={`Preview ${index}`}
                          />
                          {isDraft && (
                            <button
                              onClick={() => {
                                const url = img.previewUrl;

                                if (url?.startsWith("blob:")) {
                                  URL.revokeObjectURL(url);
                                }

                                setPendingImages((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );

                                if (
                                  editor &&
                                  isDraft &&
                                  postType === "General"
                                ) {
                                  const html = editor.getHTML();
                                  const tempDiv = document.createElement("div");
                                  tempDiv.innerHTML = html;

                                  const imgs = tempDiv.querySelectorAll("img");
                                  imgs.forEach((imgTag) => {
                                    if (imgTag.src === url) {
                                      imgTag.remove();
                                    }
                                  });

                                  editor.commands.setContent(tempDiv.innerHTML);
                                  editor.setEditable(true);
                                  setArticleContent(tempDiv.innerHTML);
                                }
                              }}
                              className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-100"
                            >
                              ×
                            </button>
                          )}
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
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
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

                  <div
                    className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md bg-white p-4 mt-3 focus-within:outline-none"
                    onClick={() => editor.commands.focus()}
                  >
                    <EditorContent
                      editor={editor}
                      className={`min-h-[200px] w-full outline-none p-2 text-base leading-relaxed ${
                        !isDraft ? "pointer-events-none opacity-60" : ""
                      }`}
                      onClick={() => isDraft && editor.commands.focus()}
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

                  {!isDraft && (
                    <div className="mt-6">
                      <label className="block text-xl font-semibold mb-1">
                        Update (max 200 words):
                      </label>
                      <textarea
                        value={amendment}
                        rows={5}
                        className="w-full border border-black rounded-md p-2 bg-white"
                        placeholder="Enter your update..."
                        onChange={(e) => {
                          const words = e.target.value
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean);
                          if (words.length <= 200) setAmendment(e.target.value);
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Word Count:{" "}
                        {amendment.trim().split(/\s+/).filter(Boolean).length} /
                        200
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading editor...</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {isDraft ? (
                <>
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                    onClick={() => navigate("/premiumDashboard/manageArticles")}
                  >
                    Cancel
                  </button>

                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveDraft}
                  >
                    Update
                  </button>

                  {postType === "General" ? (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md"
                      onClick={handlePostGeneralDraft}
                    >
                      Post Draft (General)
                    </button>
                  ) : (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md"
                      onClick={handlePostRoomDraft}
                    >
                      Post Draft (Room)
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                    onClick={() => navigate("/premiumDashboard/manageArticles")}
                  >
                    Cancel
                  </button>

                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={async () => {
                      const words = amendment
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean);
                      if (words.length === 0)
                        return alert(
                          "Please enter an amendment before submitting."
                        );
                      if (words.length > 200)
                        return alert("Amendment must be 200 words or fewer.");

                      const targetTable =
                        postType === "General" ? "articles" : "room_articles";
                      const targetKey =
                        postType === "General" ? "articleid" : "postid";

                      const { error } = await supabase
                        .from(targetTable)
                        .update({ amendment: amendment.trim() })
                        .eq(targetKey, id);

                      if (error) return alert("Failed to submit amendment.");
                      setShowUpdateSuccess(true);
                    }}
                  >
                    Add Update
                  </button>
                </>
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
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    onClick={() => navigate("/premiumDashboard/manageArticles")}
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
                <p className="text-gray-600 text-sm mb-4">
                  <ul className="text-gray-600 text-sm mb-4 list-disc list-inside text-left space-y-2">
                    <li>
                      Your requested topic will be reviewed by our admins.
                    </li>
                    <li>
                      Approved if 15 or more users apply for the same topic.
                    </li>
                    <li>
                      Please post under an existing topic in the meantime.
                    </li>
                  </ul>
                </p>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Enter your proposed topic name..."
                  className="w-full p-2 mb-4 border border-gray-300 rounded-md"
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    onClick={() => window.history.back()}
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
          {showUpdateSuccess && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50">
              <div
                className="bg-white p-6 rounded-lg shadow-xl text-left"
                style={{ maxWidth: "400px", width: "auto" }}
              >
                <p className="text-lg font-semibold mb-2">
                  Update submitted successfully!
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your update has been recorded. Thank you for keeping your
                  article accurate and up to date!
                </p>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setShowUpdateSuccess(false);
                      navigate("/premiumDashboard/manageArticles");
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

export default PremiumEditArticle;
