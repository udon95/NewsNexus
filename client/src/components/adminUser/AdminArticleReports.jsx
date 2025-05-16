import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const AdminArticleReports = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rows, setRows] = useState([]);
  const targetType = "article";
  const [link, setLink] = useState([]);
  const navigate = useNavigate();
  const [resolvedStatus, setResolvedStatus] = useState(false);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [article, setArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  const openReport = (row) => {
    fetchArticleLink(row.target_id);
    console.log(article);

    setSelectedItem(row);
    console.log(selectedItem.resolution?.length > 0);
  };

  const fetchArticleLink = async (target_id) => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("articleid", target_id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setLink("/article/" + data.articleid);
      setArticle(data);
      console.log(data);
    }
  };

  const articleRedirect = () => {
    navigate(link);
  };

  const suspendArticle = async (report, bool) => {
    console.log(report);

    const { data, error } = await supabase
      .from("articles")
      .update({ Suspended: bool })
      .eq("articleid", report.target_id);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      const { data, error } = await supabase
        .from("reports")
        .update({
          resolved: true,
          resolution: bool ? "Article suspended" : "No further action",
        })
        .eq("id", report.id)
        .single();
      if (error) {
        console.error("Error fetching data:", error);
      }
    }
    window.location.reload();
  };

  useEffect(() => {
    const fetchRows = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("target_type", targetType);
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log(data);
        setRows(data);
      }
    };
    fetchRows();

    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setArticles(data);
        console.log(data);
      }
    };
    fetchArticles();

  }, [targetType]);

  useEffect(() => {
    setDisplayedRows(
      rows.filter((row) => row.resolved === resolvedStatus)
        .filter((row) =>
          articles.some((art) => 
            art.articleid === row.target_id && (resolvedStatus ? true : art.Suspended === false))
        )
    );
    console.log(displayedRows);
  }, [resolvedStatus, articles, rows]);

  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status");
    setResolvedStatus(statusElement.value === "resolved");
  };

  // return (
  //   <div className="w-screen min-h-screen flex flex-col overflow-auto">
  //     <div className="flex">
  //       <div className="flex-1 font-grotesk">
  //         {selectedItem ? (
  //           <div>
  //             <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
  //               Report Details:
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">                
  //                 <div className="font-black mb-1">Username: &emsp;</div>
  //                 <div className="text-blue-600">
  //                   {selectedItem ? selectedItem.username : ""}
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">                
  //                 <div className="font-black mb-1">Infringement: &emsp;</div>
  //                 <div className="text-blue-600">
  //                   {selectedItem ? selectedItem.reason : ""}
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">
  //                 <div className="font-black mb-1">Article Status: &emsp;</div>
  //                 <div className="text-blue-600">
  //                   {article && article.Suspended ? "Suspended" : "Active"}
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //                 <div className="font-black mb-1">Article Link:</div>
  //                 <div className="underline cursor-pointer text-blue-600"  
  //                     onClick={() => articleRedirect()}>
  //                   {article ? article.title : ""}
  //               </div>
  //             </div>
  //             <div className="flex">
  //               <button
  //                 type="button"
  //                 className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //                 onClick={() =>
  //                   suspendArticle(selectedItem, !article.Suspended)
  //                 }
  //               >
  //                 {article && article.Suspended == true
  //                   ? "Unsuspend"
  //                   : "Suspend"}{" "}
  //                 Article
  //               </button>
  //               {selectedItem.resolved == false ? (
  //                 <button
  //                   type="button"
  //                   className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //                   onClick={() =>
  //                     suspendArticle(selectedItem, false)
  //                   }
  //                 >
  //                   Reject Report
  //                 </button>
  //               ) : (
  //                 <div></div>
  //               )}
  //             </div>
  //           </div>
  //         ) : (
  //           <div></div>
  //         )}
  //         <div className="flex">
  //           <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
  //             Article Reports:
  //           </div>
  //           <select
  //             id="status"
  //             name="status"
  //             className=" sm:text-xl text-left mt-8 ml-40 font-bold"
  //             onChange={handleResolvedStatusChange}
  //           >
  //             <option value="unresolved">Unresolved</option>
  //             <option value="resolved">Resolved</option>
  //           </select>
  //         </div>

  //         <div>
  //           {displayedRows.length > 0 ? (
  //             <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
  //             <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
  //             <thead className="bg-gray-200">
  //               <tr>
  //                 <th className="p-3">#</th>
  //                 <th className="p-3">Reason</th>
  //                 <th className="p-3">Title</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {displayedRows.map((row, index) => (
  //                 <tr
  //                   key={row.id}
  //                   className="cursor-pointer hover:bg-gray-300 transition-colors"
  //                   onClick={() => openReport(row)}
  //                 >
  //                   <td className="p-3">{index + 1}</td>
  //                   <td className="p-3">{row.reason}</td>
  //                   <td className="p-3">{articles.find((art) => art.articleid === row.target_id)?.title || "Unknown"}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>

  //             // displayedRows.map((row) => (
  //             //   <div key={row.id}>
  //             //     <div
  //             //       className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
  //             //       onClick={() => openReport(row)}
  //             //     >
  //             //       Report {++count} : &emsp;{row.reason}
  //             //     </div>
  //             //   </div>
  //             // ))
  //           ) : (
  //             <div className="ml-10 mt-8">0 Results</div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="w-full min-h-screen bg-indigo-50 py-10 px-4 font-grotesk flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
  
        {/* Selected Report Details */}
        {selectedItem && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Report Details</h2>
  
            <div className="bg-gray-100 rounded-xl shadow p-4 text-sm">
              <span className="font-bold">Username:</span>{" "}
              <span className="text-blue-600">{selectedItem.username}</span>
            </div>
  
            <div className="bg-gray-100 rounded-xl shadow p-4 text-sm">
              <span className="font-bold">Infringement:</span>{" "}
              <span className="text-blue-600">{selectedItem.reason}</span>
            </div>
  
            <div className="bg-gray-100 rounded-xl shadow p-4 text-sm">
              <span className="font-bold">Article Status:</span>{" "}
              <span className="text-blue-600">
                {article?.Suspended ? "Suspended" : "Active"}
              </span>
            </div>
  
            <div className="bg-gray-100 rounded-xl shadow p-4 text-sm">
              <span className="font-bold">Article Link:</span>{" "}
              <span
                onClick={articleRedirect}
                className="text-blue-600 underline cursor-pointer"
              >
                {article?.title}
              </span>
            </div>
  
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                className="px-6 py-2 bg-[#3F414C] text-white rounded-lg text-sm font-medium hover:bg-opacity-90"
                onClick={() => suspendArticle(selectedItem, !article?.Suspended)}
              >
                {article?.Suspended ? "Unsuspend" : "Suspend"} Article
              </button>
              {!selectedItem.resolved && (
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-opacity-90"
                  onClick={() => suspendArticle(selectedItem, false)}
                >
                  Reject Report
                </button>
              )}
            </div>
          </div>
        )}
  
        {/* Report Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Article Reports:</h2>
          <select
            id="status"
            name="status"
            className="text-base border border-gray-300 rounded px-3 py-2 shadow-sm"
            onChange={handleResolvedStatusChange}
          >
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
  
        {!selectedItem && (
          <div className="text-sm text-gray-600 italic">
            Click a report row below to view its full details.
          </div>
        )}
  
        {/* Report Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 px-6 py-4 overflow-x-auto w-full">
          {displayedRows.length > 0 ? (
            <table className="w-full text-sm text-left table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Title</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => openReport(row)}
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{row.reason}</td>
                    <td className="px-4 py-2">
                      {articles.find((a) => a.postid === row.target_id)?.title ||
                        "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-600">0 Results</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default AdminArticleReports;
