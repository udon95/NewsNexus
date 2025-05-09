import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import supabase from "../../api/supabaseClient";

const AdminUserDetails = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  let count = 0;
  const location = useLocation();
  const { user } = location.state || {};
  const [freeUserList, setFreeUserList] = useState([]);
  const [premiumUserList, setPremiumUserList] = useState([]);
  const [expertUserList, setExpertUserList] = useState([]);

  const updateUserEmail = async () => {
    const email = document.getElementById("emailInput").value;
    const { data, error } = await supabase
      .from("users")
      .update({ email: email })
      .eq("userid", userDetails.userid);
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      alert("Email updated");
    }
  };

  const changeUserStatus = async () => {
    const newStatus =
      userDetails.status === "Suspended" ? "Active" : "Suspended";
    const { data, error } = await supabase
      .from("users")
      .update({ status: newStatus }) // Pass an object with the column to update
      .eq("userid", userDetails.userid);
    if (error) {
      console.error("Error updating status:", error);
      return;
    }
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      status: newStatus,
    }));
  };

  const openArticle = (row) => {
    navigate(`/article/${encodeURIComponent(row.title)}`);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userDetails, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("userid", user.userid)
          .single();

        if (userError) throw userError;
        console.log(userDetails);
        setUserDetails(userDetails);

        const { data: userArticles, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("userid", user.userid);

        if (articlesError) throw articlesError;
        console.log(userArticles);
        setUserArticles(userArticles);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchUserTypes = async () => {
      const { data, error } = await supabase.from("usertype").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setFreeUserList(data.filter((row) => row.usertype === "Free"));
        setPremiumUserList(data.filter((row) => row.usertype === "Premium"));
      }
    };

    const fetchExpertUsers = async () => {
      const { data, error } = await supabase
        .from("expert_application")
        .select("*")
        .eq("status", "Approved");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setExpertUserList(data);
      }
    };

    fetchUserTypes();
    fetchExpertUsers();
    fetchUserData();
  }, [user, user.userid]);

  const revokeExpertStatus = async () => {
    const { data, error } = await supabase
      .from("expert_application")
      .update({ status: "Rejected" }) // Ensure keys are strings
      .eq("username", userDetails.username)
      .select(); // To retrieve the updated data
    if (error) {
      console.error("Error updating data:", error);
    } else {
      alert("User Expert Status Revoked ");
      window.location.reload();
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            User details:
          </div>

          <div className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
            Username:&emsp;{userDetails.username}
          </div>
          <div className="flex ">
            <input
              className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
              value={"Email:  " + userDetails.email}
              id="emailInput"
              readOnly
            />
            <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value={"Account status:\t" + userDetails.status}
            readOnly
            />
          </div>

          <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value={"User Type:  "+
              premiumUserList.some((user) => user.userid === userDetails.userid)
                ? "Premium User"
                : "Free User"
            }
            readOnly
          />
          <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value={"Expert User:  "+
              expertUserList.some(
                (user) => user.username === userDetails.username
              )
                ? "Yes"
                : "No"
            }
            readOnly
          />
          <div className="flex ">
            <button
              type="button"
              className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
              onClick={changeUserStatus}
            >
              {userDetails.status == "Suspended"
                ? "Unsuspend User"
                : "Suspend User"}
            </button>
            {expertUserList.some(
              (user) => user.username === userDetails.username
            ) ? (
              <button
                type="button"
                className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                onClick={revokeExpertStatus}
              >
                {" "}
                Revoke Expert Status
              </button>
            ) : (
              <div></div>
            )}
          </div>

          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
            {userDetails.username} articles:
          </div>

          {userArticles != null ? (
            <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
              <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Suspended</th>
                </tr>
              </thead>
              <tbody>
                {userArticles.map((row, index) => (
                  <tr
                    key={row.articleid}
                    className="cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => openArticle(row)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{row.title}</td>
                    <td className="p-3">{row.Suspended? "Yes" : "No"}</td>
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
  );
};

export default AdminUserDetails;
