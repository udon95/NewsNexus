import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const AdminArticleReports = () => {
  const [selectedItem, setSelectedItem] = useState(null);;
  const [rows, setRows] = useState([]);
  const targetType = "article"; 
  const [link, setLink] = useState([]);;
  let count = 0;
  const navigate = useNavigate();
  const [resolvedStatus, setResolvedStatus] = useState(false);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [article, setArticle] = useState(null);


  const openReport = (row) => {
    fetchArticleLink(row.target_id)
    console.log(article);

    setSelectedItem(row); 
    console.log(selectedItem.resolution?.length > 0 );
  }

  const fetchArticleLink = async (target_id) => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("articleid", target_id)
      .single();
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setLink("/article/" + data.title);
      setArticle(data);
      console.log(data);
    }
  };

  const articleRedirect = () => {
    navigate(link);
  };

  const suspendArticle = async (target_id,bool) => {
    console.log(target_id);

    const { data, error } = await supabase
      .from("articles")
      .update({ Suspended: bool })
      .eq("articleid", target_id);

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      const { data, error } = await supabase
      .from("reports")
      .update({
        resolved: true,
        resolution: bool ? "Article suspended" : "No further action"
      })
      .eq("target_id", target_id)
      .single();
      if (error) {
        console.error('Error fetching data:', error);
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
        console.error('Error fetching data:', error);
      } else {
        setRows(data);
      }
    };
    fetchRows();
  }, [targetType]);


  useEffect(() => {
    setDisplayedRows(rows.filter((row) => row.resolved === resolvedStatus));
  }, [resolvedStatus, rows]);

 
  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status");
    setResolvedStatus(statusElement.value === "resolved");
    setDisplayedRows(rows.filter((row) => row.resolved === resolvedStatus));
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
        {selectedItem ? <div>          
            <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
              Report details:
            </div>
            <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
            Username : &emsp;{selectedItem ? selectedItem.username : ""}
            </div>
            <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
              Infringement : &emsp;{selectedItem ? selectedItem.reason : ""}
            </div>
            <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none underline focus:ring-2 focus:ring-gray-300 cursor-pointer"
            onClick={() => articleRedirect()}>
              Article Link : <br />{article ? article.title : ""}
            </div>
            <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
              Article Status : &emsp;{article&&article.Suspended ? "Suspended" : "Active"}
            </div>
            <div className="flex">
              <button
                type="button"
                className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"            
                onClick={() => suspendArticle(selectedItem.target_id,(!article.Suspended))}>
                {article && article.Suspended==true?"Unsuspend":"Suspend"} article 
              </button>
              {selectedItem.resolved==false? <button
                type="button"
                className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"           
                onClick={() => suspendArticle(selectedItem.target_id,false)} >
                Reject report
              </button>:<div></div>}
            </div>
          </div>: <div></div>}
          <div className="flex">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Article reports:
          </div>
            <select id="status" name="status" className=" sm:text-xl text-left mt-8 ml-40 font-bold" onChange={handleResolvedStatusChange}>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
            </select>
            </div>

          <div>
          {displayedRows.length > 0?displayedRows.map((row) => (
              <div key={row.id}>
                <div className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                    onClick={() => openReport(row)}>
                  Report {++count} : &emsp;{row.reason}
                </div>
              </div>
            )):<div className="ml-10 mt-8">0 results</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticleReports;
