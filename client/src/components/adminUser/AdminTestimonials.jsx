import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";

const AdminTestimonials = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState([]);
  const [rows, setRows] = useState([]);
  const [displayedStatus, setDisplayedtatus] = useState("all");
  const [displayedRows, setDisplayedRows] = useState([]);
  const [users, setUsers] = useState([]);


  const openReport = (row) => {
    fetchUsername(row.userid);

    setSelectedItem(row);
    console.log(row.homepage_display);
    console.log(row.id);
  };

  const fetchUsername = async (userid) => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("userid", userid)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setSelectedUser(data);
    }
  };

  const setDisplay = async (id, bool) => {
    console.log(id);

    const { data, error } = await supabase
      .from("testimonial")
      .update({ homepage_display: bool })
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching data:", error);
    }
    window.location.reload();
  };

  useEffect(() => {
    const fetchRows = async () => {
      const { data, error } = await supabase
        .from("testimonial")
        .select("*");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setRows(data);
      }
    };
    fetchRows();

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setUsers(data);
      }
    };
    fetchUsers();
  });

  useEffect(() => {
    if(displayedStatus == "all"){
      setDisplayedRows(rows);
    }else if(displayedStatus == "displayed"){
      setDisplayedRows(rows.filter((row) => row.homepage_display == true));
    } else{
      setDisplayedRows(rows.filter((row) => row.homepage_display == false));
    }

  }, [displayedStatus, rows]);

  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status");
    console.log(statusElement);
    setDisplayedtatus(statusElement);
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          {selectedItem ? (
            <div>
              <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                Testimonial Details:
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Username : &emsp;{selectedUser ? selectedUser.username : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
                Rating : &emsp;{selectedItem ? selectedItem.rating : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Shared Experience : <br />
                {selectedItem ? selectedItem.share_experience : ""}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 break-words text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Areas of Improvement : <br />
                {selectedItem ? selectedItem.areas_to_improve : ""}
              </div>
              <div className="flex">
                <button
                  type="button"
                  className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                  onClick={() =>
                    setDisplay(
                      selectedItem.id,
                      selectedItem.homepage_display ? false : true
                    )
                  }
                >
                  {selectedItem.homepage_display
                    ? "Takedown testimonial"
                    : "Display testimonial"}
                </button>
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex">
            <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
              User Testimonials:
            </div>
            <select
              id="status"
              name="status"
              className=" sm:text-xl text-left mt-8 ml-40 font-bold"
              onChange={handleResolvedStatusChange}
            >
              <option value="all">All</option>
              <option value="displayed">Displayed</option>
              <option value="not displayed">Not displayed</option>
            </select>
          </div>

          <div>
            {displayedRows.length > 0 ? (
              <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
                <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Displayed</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">Design</th>
                    <th className="p-3">Factcheck</th>
                    <th className="p-3">Access</th>
                    <th className="p-3">Safety</th>
                    <th className="p-3">Pricing</th>
                    <th className="p-3">News Quality</th>

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
                      <td className="p-3">{users.find((user) => user.userid === row.userid)?.username || "Unknown"}</td>
                      <td className="p-3">{row.homepage_display? "Yes" : "No"}</td>
                      <td className="p-3">{row.submitted}</td>
                      <td className="p-3">{row.design}</td>
                      <td className="p-3">{row.factcheck}</td>
                      <td className="p-3">{row.accessible}</td>
                      <td className="p-3">{row.safety}</td>
                      <td className="p-3">{row.price}</td>
                      <td className="p-3">{row.news}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="ml-10 mt-8">0 results</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
