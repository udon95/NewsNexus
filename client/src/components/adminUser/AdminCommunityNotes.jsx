import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const AdminCommunityNotes = () => {
  const [notes, setNotes] = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [approvedNotes, setApprovedNotes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [displayedArticleList, setDisplayedArticlesList] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleOwner, setArticleOwner] = useState(null);
  const [selectedArticleNotes, setSelecteddArticlesNotes] = useState([]);

  const navigate = useNavigate();
  let count = 0;

  useEffect(() => {
    const fetchRows = async () => {
      const { data: noteData, error: noteError } = await supabase
        .from("community_notes")
        .select("*");
      if (noteError) {
        console.error("Error fetching data:", noteError);
      } else {
        setNotes(noteData);
      }
    };
    const fetchArticle = async () => {
      const { data, error } = await supabase.from("articles").select("*");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setArticles(data);
        console.log(data);
      }
    };
    fetchRows();
    fetchArticle();
  }, []);

  useEffect(() => {
    setDisplayedArticlesList(
      articles.filter(
        (article) =>
          pendingNotes.some((note) => note.target_id === article.articleid) &&
          !approvedNotes.some((note) => note.target_id === article.articleid)
      )
    );

    console.log("pendingNotes");
    console.log(pendingNotes);
  }, [pendingNotes]);

  useEffect(() => {
    console.log("approvedNotes");
    console.log(approvedNotes);
  }, [approvedNotes]);

  useEffect(() => {
    console.log("articles");
    console.log(articles);

    setPendingNotes(notes.filter((note) => note.Status == "Pending"));
    setApprovedNotes(notes.filter((note) => note.Status == "Approved"));
  }, [articles, notes]);

  useEffect(() => {
    console.log("selectedNote");
    console.log(selectedArticle);

    setSelecteddArticlesNotes(
      notes.filter((note) => note.target_id === selectedArticle.articleid)
    );
  }, [selectedArticle]);

  useEffect(() => {
    console.log("displayedArticleList");
    console.log(displayedArticleList);
  }, [displayedArticleList]);

  useEffect(() => {
    console.log("selectedArticleNotes");
    console.log(selectedArticleNotes);
  }, [selectedArticleNotes]);

  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status").value;
    setDisplayedArticlesList(
      articles.filter((article) =>
          statusElement == "Approved" ? approvedNotes.some((note) => note.target_id === article.articleid)
            : pendingNotes.some((note) => note.target_id === article.articleid) &&
              !approvedNotes.some((note) => note.target_id === article.articleid)
      )
    );
  };

  const articleRedirect = () => {
    navigate("/article/" + selectedArticle.title);
  };

  const openNote = (row) => {
    setSelectedArticle(row);

    const fetchUSer = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userid", row.userid)
        .single();
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setArticleOwner(data.username);
      }
    };
    fetchUSer();
  };

  const setDisplayNotes = async (row) => {
    const { data, error } = await supabase
      .from("community_notes")
      .update({ Status: "Pending" })
      .eq("target_id", row.target_id);
    if (error) {
      console.error("Error fetching data:", error);
    }

    const { data1, error1 } = await supabase
      .from("community_notes")
      .update({ Status: row.Status == "Pending" ? "Approved" : "Pending" })
      .eq("id", row.id)
      .single();
    if (error1) {
      console.error("Error fetching data:", error1);
    } else {
      alert(
        row.Status == "Pending"
          ? "Community note set!"
          : "Community note removed"
      );
      window.location.reload();
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          {selectedArticle ? (
            <div>
              <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                Community Notes details:
              </div>
              <div
                className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none underline focus:ring-2 focus:ring-gray-300 cursor-pointer"
                onClick={() => articleRedirect()}
              >
                Article Link : <br /> {selectedArticle.title}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Posted by: &emsp;{articleOwner}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Article Status : &emsp;
                {selectedArticle && selectedArticle.Suspended
                  ? "Suspended"
                  : "Active"}
              </div>
              {selectedArticleNotes.length > 0 ? (
                <div className="text-2xl sm:text-2xl text-left mt-8 ml-10 font-bold">
                  Suggested Notes:
                </div>
              ) : (
                <div></div>
              )}
              {selectedArticleNotes.length > 0 ? (
                <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
                <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Note</th>
                    <th className="p-3">Displayed</th>
                    <th className="p-3">Toggle display</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArticleNotes.map((row, index) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-gray-300 transition-colors"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{row.username}</td>
                      <td className="p-3">{row.note}</td>
                      <td className="p-3">{row.Status == "Approved" ? "Yes" : "No"}</td>
                      <td className="p-3"><button
                      type="button"
                      className={`px-6 py-3 bg-[#3F414C] flex items-center justify-center text-white rounded-lg hover:bg-opacity-90 cursor-pointer ${
                            row.Status ? 'bg-red-600' : 'bg-[#3F414C]'}`}
                      onClick={() => setDisplayNotes(row)}
                    >
                      {row.Status == "Approved" ? "Remove" : "Display"}
                    </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                
                // selectedArticleNotes.map((row) => (
                //   <div className="flex" key={row.id}>
                //     <div className="ml-10 mt-5 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                //       {row.username} : <br />
                //       {row.note}
                //     </div>
                //     <button
                //       type="button"
                //       className="px-6 py-3 bg-[#3F414C] flex items-center justify-center ml-10 mt-5 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                //       onClick={() => setDisplayNotes(row)}
                //     >
                //       {row.Status == "Approved" ? "Displayed" : "Select"}
                //     </button>
                //   </div>
                // ))
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex">
            <div className="text-2xl sm:text-3xl text-left mt-15 ml-10 font-bold">
              Article Community Notes:
            </div>
            <select
              id="status"
              name="status"
              className=" sm:text-xl text-left mt-8 ml-40 font-bold"
              onChange={handleResolvedStatusChange}
            >
              <option value="Pending">Untagged</option>
              <option value="Approved">Tagged</option>
            </select>
          </div>

          <div>
            {displayedArticleList.length > 0 ? (
              <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
                <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Title</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {displayedArticleList.map((row, index) => (
                      <tr
                        key={row.articleid}
                        className="cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => openNote(row)}
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{row.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              // displayedArticleList.map((row) => (
              //   <div key={row.articleid}>
              //     <div
              //       className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              //       onClick={() => openNote(row)}
              //     >
              //       Article {++count} : &emsp;{row.title}
              //     </div>
              //   </div>
              // ))
            ) : (
              <div className="ml-10 mt-8">0 results</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityNotes;
