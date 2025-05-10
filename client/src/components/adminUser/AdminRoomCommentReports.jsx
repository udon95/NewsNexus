import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";

const AdminRoomCommentReports = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rows, setRows] = useState([]);
  const targetType = "room comment";
  const [comment, setComment] = useState(null);
  const [resolvedStatus, setResolvedStatus] = useState(false);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [comments, setComments] = useState([]);

  const openReport = (row) => {
    fetchComment(row.target_id);

    setSelectedItem(row);
    console.log(row);
    console.log(comment);
  };

  const fetchComment = async (target_id) => {
    const { data, error } = await supabase
      .from("room_comments")
      .select("*")
      .eq("commentid", target_id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setComment(data);
      console.log(data);
    }
  };

  const suspendComment = async (report, bool) => {
    console.log(report);

    const { data, error } = await supabase
      .from("room_comments")
      .update({ Suspended: bool })
      .eq("commentid", report.target_id);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      const { data, error } = await supabase
        .from("reports")
        .update({
          resolved: true,
          resolution: bool ? "Comment suspended" : "No further action",
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
        setRows(data);
      }
    };
    fetchRows();

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("room_comments")
        .select("*");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setComments(data);
        console.log(data);
      }
    };
    fetchComments();
  }, [targetType]);


    useEffect(() => {
      setDisplayedRows(
        rows.filter((row) => row.resolved === resolvedStatus)
          .filter((row) =>
            comments.some((comment) => 
              comment.commentid === row.target_id && (resolvedStatus ? true : comment.Suspended === false))
          )
      );
      console.log(displayedRows);
    }, [resolvedStatus, comments, rows]);

  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status");
    setResolvedStatus(statusElement.value === "resolved");
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          {selectedItem && comment ? (
            <div>
              <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                Report details:
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Username : &emsp; {selectedItem ? selectedItem.username : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Infringement : &emsp; {selectedItem ? selectedItem.reason : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Comment : <br /> {selectedItem ? comment.content : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Comment Status : &emsp;
                {comment && comment.Suspended ? "Suspended" : "Active"}
              </div>
              <div className="flex">
                <button
                  type="button"
                  className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                  onClick={() =>
                    suspendComment(selectedItem, !comment.Suspended)
                  }
                >
                  {comment && comment.Suspended == true
                    ? "Unsuspend"
                    : "Suspend"}{" "}
                  Comment
                </button>
                {selectedItem.resolved == false ? (
                  <button
                    type="button"
                    className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                    onClick={() =>
                      suspendComment(selectedItem, false)
                    }
                  >
                    Reject report
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex">
            <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
              Room Comment Reports:
            </div>
            <select
              id="status"
              name="status"
              className=" sm:text-xl text-left mt-8 ml-40 font-bold"
              onChange={handleResolvedStatusChange}
            >
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            {displayedRows.length > 0 ? (
              <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
              <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => openReport(row)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{row.reason}</td>
                    <td className="p-3">{comments.find((com) => com.commentid === row.target_id)?.content || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

              // displayedRows.map((row) => (
              //   <div key={row.id}>
              //     <div
              //       className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              //       onClick={() => openReport(row)}
              //     >
              //       Report {++count} : &emsp;{row.reason}
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

export default AdminRoomCommentReports;
