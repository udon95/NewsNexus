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
    navigate(`/article/${row.articleid}`);
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

  // return (
  //   <div className="w-screen min-h-screen flex flex-col overflow-auto">
  //     <div className="flex">
  //       <div className="flex-1 font-grotesk">
  //         <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
  //           User Details:
  //         </div>
  //         <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //           <div className="flex">                
  //             <div className="font-black mb-1">Username: &emsp;</div>
  //             <div className="text-blue-600">
  //               {userDetails.username}
  //             </div>
  //           </div>
  //         </div>
  //         <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //           <div className="flex">                
  //             <div className="font-black mb-1">Email: &emsp;</div>
  //             <div className="text-blue-600">
  //               {userDetails.email}
  //             </div>
  //           </div>
  //         </div>

  //         <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //           <div className="flex">                
  //             <div className="font-black mb-1">User Type: &emsp;</div>
  //             <div className="text-blue-600">
  //               {(premiumUserList.some((user) => user.userid === userDetails.userid)
  //               ? "Premium User"
  //               : "Free User"
  //              )}
  //             </div>
  //           </div>
  //         </div>
  //         <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //           <div className="flex">                
  //             <div className="font-black mb-1">Expert User: &emsp;</div>
  //             <div className="text-blue-600">
  //               {(expertUserList.some((user) => user.username === userDetails.username)
  //               ? "Yes"
  //               : "No"
  //              )}
  //             </div>
  //           </div>
  //         </div>
  //         <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //           <div className="flex">                
  //             <div className="font-black mb-1">Account status: &emsp;</div>
  //             <div className="text-blue-600">
  //               {userDetails.status}
  //             </div>
  //           </div>
  //         </div>
          
  //         <div className="flex ">
  //           <button
  //             type="button"
  //             className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //             onClick={changeUserStatus}
  //           >
  //             {userDetails.status == "Suspended"
  //               ? "Unsuspend User"
  //               : "Suspend User"}
  //           </button>
  //           {expertUserList.some(
  //             (user) => user.username === userDetails.username
  //           ) ? (
  //             <button
  //               type="button"
  //               className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //               onClick={revokeExpertStatus}
  //             >
  //               {" "}
  //               Revoke Expert Status
  //             </button>
  //           ) : (
  //             <div></div>
  //           )}
  //         </div>

  //         <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
  //           {userDetails.username} Articles:
  //         </div>

  //         {userArticles != null ? (
  //           <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
  //             <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
  //             <thead className="bg-gray-200">
  //               <tr>
  //                 <th className="p-3">#</th>
  //                 <th className="p-3">Title</th>
  //                 <th className="p-3">Suspended</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {userArticles.map((row, index) => (
  //                 <tr
  //                   key={row.articleid}
  //                   className="cursor-pointer hover:bg-gray-300 transition-colors"
  //                   onClick={() => openArticle(row)}
  //                 >
  //                   <td className="p-3">{index + 1}</td>
  //                   <td className="p-3">{row.title}</td>
  //                   <td className="p-3">{row.Suspended? "Yes" : "No"}</td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //         ) : (
  //           <div className="ml-10 mt-8">0 Results</div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="w-full min-h-screen bg-gray-50 py-10 px-6 font-grotesk">
  //     <div className="max-w-5xl mx-auto space-y-10">
  //       {/* Header */}
  //       <div className="text-3xl font-bold">User Details</div>
  
  //       {/* User Info Card */}
  //       <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 border border-gray-200">
  //         <div className="flex">
  //           <div className="w-40 font-semibold">Username:</div>
  //           <div className="text-blue-600">{userDetails.username}</div>
  //         </div>
  //         <div className="flex">
  //           <div className="w-40 font-semibold">Email:</div>
  //           <div className="text-blue-600">{userDetails.email}</div>
  //         </div>
  //         <div className="flex">
  //           <div className="w-40 font-semibold">User Type:</div>
  //           <div className="text-blue-600">
  //             {premiumUserList.some((user) => user.userid === userDetails.userid)
  //               ? "Premium User"
  //               : "Free User"}
  //           </div>
  //         </div>
  //         <div className="flex">
  //           <div className="w-40 font-semibold">Expert User:</div>
  //           <div className="text-blue-600">
  //             {expertUserList.some(
  //               (user) => user.username === userDetails.username
  //             )
  //               ? "Yes"
  //               : "No"}
  //           </div>
  //         </div>
  //         <div className="flex">
  //           <div className="w-40 font-semibold">Account Status:</div>
  //           <div className="text-blue-600">{userDetails.status}</div>
  //         </div>
  
  //         {/* Action Buttons */}
  //         <div className="flex gap-x-4 pt-4">
  //           <button
  //             type="button"
  //             className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
  //             onClick={changeUserStatus}
  //           >
  //             {userDetails.status === "Suspended"
  //               ? "Unsuspend User"
  //               : "Suspend User"}
  //           </button>
  
  //           {expertUserList.some(
  //             (user) => user.username === userDetails.username
  //           ) && (
  //             <button
  //               type="button"
  //               className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
  //               onClick={revokeExpertStatus}
  //             >
  //               Revoke Expert Status
  //             </button>
  //           )}
  //         </div>
  //       </div>
  
  //       {/* Articles Section */}
  //       <div className="space-y-4">
  //         <div className="text-2xl font-bold">
  //           {userDetails.username}'s Articles
  //         </div>
  
  //         {userArticles?.length > 0 ? (
  //           <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
  //             <table className="min-w-full table-auto text-left">
  //               <thead className="bg-gray-100 text-gray-700">
  //                 <tr>
  //                   <th className="px-6 py-3">#</th>
  //                   <th className="px-6 py-3">Title</th>
  //                   <th className="px-6 py-3">Suspended</th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-gray-200">
  //                 {userArticles.map((row, index) => (
  //                   <tr
  //                     key={row.articleid}
  //                     className="hover:bg-gray-100 cursor-pointer"
  //                     onClick={() => openArticle(row)}
  //                   >
  //                     <td className="px-6 py-4">{index + 1}</td>
  //                     <td className="px-6 py-4">{row.title}</td>
  //                     <td className="px-6 py-4">
  //                       {row.Suspended ? "Yes" : "No"}
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         ) : (
  //           <div className="text-gray-500">No articles found.</div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="min-h-screen w-full bg-[#EEF4FF] py-12 px-4 font-grotesk flex justify-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* User Details Header */}
        <div className="text-3xl font-bold">User Details</div>

        {/* User Info Card */}
        {/* <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-gray-200">
          {[
            { label: "Username", value: userDetails.username },
            { label: "Email", value: userDetails.email },
            {
              label: "User Type",
              value: premiumUserList.some((u) => u.userid === userDetails.userid)
                ? "Premium User"
                : "Free User"
            },
            {
              label: "Expert User",
              value: expertUserList.some((u) => u.username === userDetails.username)
                ? "Yes"
                : "No"
            },
            { label: "Account Status", value: userDetails.status }
          ].map(({ label, value }) => (
            <div key={label} className="flex">
              <div className="w-40 font-semibold">{label}:</div>
              <div className="text-blue-600">{value}</div>
            </div>
          ))} */}

          {/* Action Buttons */}
          {/* <div className="flex gap-4 pt-4">
            <button
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              onClick={changeUserStatus}
            >
              {userDetails.status === "Suspended" ? "Unsuspend User" : "Suspend User"}
            </button>
            {expertUserList.some((u) => u.username === userDetails.username) && (
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={revokeExpertStatus}
              >
                Revoke Expert Status
              </button>
            )}
          </div>
        </div> */}

<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
      <div className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-base">
        {userDetails.username}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <div className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-base">
        {userDetails.email}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
      <div className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-base">
        {premiumUserList.some((u) => u.userid === userDetails.userid)
          ? "Premium User"
          : "Free User"}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Expert User</label>
      <div className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-base">
        {expertUserList.some((u) => u.username === userDetails.username) ? "Yes" : "No"}
      </div>
    </div>

    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
      <div className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-base">
        {userDetails.status}
      </div>
    </div>
  </div>

  <div className="flex justify-end gap-4 pt-4">
    <button
      type="button"
      className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
      onClick={changeUserStatus}
    >
      {userDetails.status === "Suspended" ? "Unsuspend User" : "Suspend User"}
    </button>

    {expertUserList.some((u) => u.username === userDetails.username) && (
      <button
        type="button"
        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        onClick={revokeExpertStatus}
      >
        Revoke Expert Status
      </button>
    )}
  </div>
</div>


        {/* Articles Section */}
        <div className="space-y-4">
          <div className="text-2xl font-bold">
            {userDetails.username}'s Articles
          </div>

          {userArticles.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200">
              <table className="min-w-full table-auto text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Suspended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userArticles.map((row, index) => (
                    <tr
                      key={row.articleid}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => openArticle(row)}
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{row.title}</td>
                      <td className="px-6 py-4">
                        {row.Suspended ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">No articles found.</div>
          )}
        </div>
      </div>
    </div>
  );


};

export default AdminUserDetails;
