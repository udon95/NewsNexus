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
import { useParams } from "react-router-dom"; 

export const PremiumEditPosted = () => {
  const [articleContent, setArticleContent] = useState("");
  const [images, setImages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const storedUser = JSON.parse(localStorage.getItem("userProfile"));
  const userId = storedUser?.user?.userid;
  const editorRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const { postType, articletitle } = useParams();
  const [postid, setPostid] = useState("");
  const [articletext, setArticletext] = useState("");
  const [roomimages, setRoomimages] = useState([]);

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

  const MAX_WORDS = 150;

  useEffect(() => {
    if (articletitle) {
      const storedUser = localStorage.getItem("userProfile");
      if (!storedUser) {       
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const session = parsedUser?.user; // Assuming 'user' is the session data in your stored object

      if (!session) {
        return;
      }

      console.log("User from localStorage:", session);

      const checkArticleInDatabase = async () => {
        if (postType === "General") {
          const { data, error} = await supabase
            .from("articles")
            .select(`
              articleid,
              text
            `)
            .eq("title", articletitle)
            .eq("userid", session.userid);
        
          if (error) {
            return;
          }

          setPostid(data[0]?.postid);
          setArticletext(data[0]?.text);

        } else {
          const { data, error} = await supabase
            .from("room_articles")
            .select(`
              postid,
              content,
              room_article_images(image_url)
            `)
            .eq("title", articletitle)
            .eq("userid", session.userid);

          if (error) {
            return;
          }

          setPostid(data[0]?.postid);
          setArticletext(data[0]?.content);
          setRoomimages(data[0]?.room_article_images?.map(img => img.image_url) || []);

        }
      }  
      checkArticleInDatabase();
    }  
  }, [articletitle]);

  const handleUpdateArticle = async () => {
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

    if (!articleContent) {
      alert("Please fill in all required fields.");
      return;
    }

    if (wordCount > MAX_WORDS) {
      alert(`The amendment exceeds the ${MAX_WORDS} word limit!`);
      return;
    }    

    let updatedHTML = articleContent;
    const bucket = "articles-images";
    let firstImageUrl = null;

    for (const img of pendingImages) {
      const file = img.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

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
    
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        if (!firstImageUrl) firstImageUrl = urlData.publicUrl; // Track first image URL
        updatedHTML = updatedHTML.replaceAll(img.previewUrl, urlData.publicUrl);        
      }
    }      

    if(postType === "General") {
      const { error } = await supabase
        .from("articles")
        .update([{
          amendment: updatedHTML
        }])
        .eq("title", articletitle);

      if (error) {
        alert("Failed to update article.");
        return;
      }
    
    } else {
      const { error } = await supabase
        .from("room_articles")
        .update([{
          amendment: updatedHTML
        }])
        .eq("title", articletitle);

      if (error) {
        alert("Failed to update article.");
        return;
      }

      for (const img of pendingImages) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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

        await supabase.from("room_article_images").insert([
          { postid, image_url: imageUrl }
        ]);
      }
    }

    alert("Article updated!");
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

  const handleClearInputs = () => {
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

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full max-w-4xl p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold mb-1">Update Your Articles :</h1>

        <div className="flex flex-col gap-5 w-full">
          <div>
            <label className="block text-xl font-semibold mb-1">Note:</label>
              <div className="text-l">
                <div>Updates will appear in a separate section from the main content</div> 
                <div>However, images added to room articles will be permanently added to the main content images</div>
                <div>New updates will overwrite the previous one</div>  
              </div>
          </div>

          <div>
            <label className="block text-2xl font-semibold mb-1">
              {articletitle}  
            </label>
          </div>

          {/* Show room images only if postType is Room */}
          {postType === "Room" && roomimages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {roomimages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Room Image ${index + 1}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
              ))}
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: articletext }}
            className="prose max-w-none"
          ></div>

          <div>
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
                      <div key={index} className="relative border rounded-lg overflow-hidden shadow">
                        <img
                          src={img.previewUrl}
                          alt={`Upload Preview ${index}`}
                          className="object-cover w-full h-32"
                        />
                        <button
                          onClick={() => {
                            setPendingImages((prev) => prev.filter((_, i) => i !== index));
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={handleUpdateArticle}
            >
              Save
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
      </main>
    </div>
  );
};

export default PremiumEditPosted;