import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";

const AdminExperts = () => {
  const [applications, setApplications] = useState([]);
  const [applicant, setApplicant] = useState(null);
  const [topics, setTopics] = useState([]);
  const [userTopic, setUserTopic] = useState(null);
  // const [statusFilter, setStatusFilter] = useState("Pending");

  const handleClick = async (isApproved) => {
    // Ensure 'applicant' is defined
    if (!applicant) {
      console.error("No applicant selected.");
      return;
    }
    const status = isApproved ? "Approved" : "Rejected";

    const { data, error } = await supabase
      .from("expert_application")
      .update({ status: status }) // Ensure keys are strings
      .eq("username", applicant.username)
      .select(); // To retrieve the updated data

    if (error) {
      console.error("Error updating data:", error);
    } else {
      // Update the local state to reflect changes
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.username === applicant.username ? { ...app, status: status } : app
        )
      );
      alert("Application " + status);
      window.location.reload();
    }
  };

  // useEffect(() => {
  //   const fetchApplications = async () => {
  //     const { data, error } = await supabase
  //       .from("expert_application")
  //       // .select("*")
  //       .select("username, email, usertype, topicid, description, cv, status")
  //       .eq("status", "Pending");
  //     if (error) {
  //       console.error("Error fetching users:", error);
  //     } else {
  //       setApplications(data);
  //       console.log(data);
  //     }
  //   };
  //   fetchApplications();
  // }, []);

  useEffect(() => {
  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("expert_application")
      .select("username, email, usertype, topicid, description, cv, status")
      .eq("status", "Pending")

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data);
    }
  };

  fetchApplications();
}, []);


  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setTopics(data);
        console.log(data);
      }
    };
    fetchTopics();
  }, []);

  // useEffect(() => {
  //   setUserTopic(topics.find((topic) => topic.topicid == applicant.topicid));
  //   console.log(userTopic);

  // }, [applicant]);

  const setApplicantWithTopic = (application) => {
    setApplicant(application);
    setUserTopic(topics.find((topic) => topic.topicid == application.topicid));
    console.log(application.topicid);
    console.log(userTopic);
  };

  // return (
  //   <div className="w-screen min-h-screen flex flex-col overflow-auto">
  //     <div className="flex">
  //       <div className="flex-1 font-grotesk">
  //         {applicant ? (
  //           <div>
  //             <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
  //               Applicant Particulars:
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">
  //                 <div className="font-black mb-1">User: &emsp;</div>
  //                 <div className="text-blue-600">{applicant.username}</div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">
  //                 <div className="font-black mb-1">Topic: &emsp;</div>
  //                 <div className="text-blue-600">{userTopic.name}</div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">
  //                 <div className="font-black mb-1">Profession: &emsp;</div>
  //                 <div className="text-blue-600">
  //                   {applicant ? applicant.description : "Nil"}
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="ml-10 mt-5 max-w-[700px] min-h-[200px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
  //               <div className="flex">
  //                 <div className="font-black mb-1">Experiences: &emsp;</div>
  //                 <div className="text-blue-600">
  //                   {applicant.cv
  //                     ? applicant.cv.split("\n").map((line, idx) => (
  //                         <span key={idx}>
  //                           {line}
  //                           <br />
  //                         </span>
  //                       ))
  //                     : "No professional designation"}
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="flex">
  //               <button
  //                 type="button"
  //                 className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //                 onClick={() => handleClick(true)}
  //               >
  //                 Approve
  //               </button>
  //               <button
  //                 type="button"
  //                 className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
  //                 onClick={() => handleClick(false)}
  //               >
  //                 Reject
  //               </button>
  //             </div>
  //           </div>
  //         ) : (
  //           <div></div>
  //         )}
  //         <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
  //           Expert Applications:
  //         </div>
  //         <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
  //           <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
  //             <thead className="bg-gray-200">
  //               <tr>
  //                 <th className="p-3">#</th>
  //                 <th className="p-3">User</th>
  //                 <th className="p-3">Category</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {applications.map((application, index) => (
  //                 <tr
  //                   key={application.username}
  //                   className="cursor-pointer hover:bg-gray-300 transition-colors"
  //                   onClick={() => setApplicantWithTopic(application)}
  //                 >
  //                   <td className="p-3">{index + 1}</td>
  //                   <td className="p-3">{application.username}</td>
  //                   <td className="p-3">
  //                     {" "}
  //                     {topics.find(
  //                       (topic) => topic.topicid === application.topicid
  //                     )?.name || "Unknown"}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //         {/* <div className="flex flex-col items-start w-full mx-10 ">
  //           {applications.map((application) => (
              
  //             <div
  //               key={application.username}
  //               className=" mt-8 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
  //               onClick={() => setApplicantWithTopic(application)}
  //             >
  //               {application.username}
  //             </div>
  //           ))}
  //         </div> */}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="min-h-screen w-full bg-[#EEF4FF] flex justify-center px-4 py-12 font-grotesk">
<div className="w-full max-w-4xl mx-auto space-y-10">

{!applicant && (
  <div className="text-center text-gray-500 italic border border-gray-300 bg-white rounded-lg shadow p-4 mb-6">
    Select an application below to view applicant details.
  </div>
)}
  
        {/* {applicant && (
          <div className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold">Applicant Particulars</h2>
  
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Username</label>
                <div className="text-blue-600">{applicant.username}</div>
              </div>
              <div>
                <label className="font-semibold">Topic</label>
                <div className="text-blue-600">{userTopic?.name || "Unknown"}</div>
              </div>
              <div>
                <label className="font-semibold">Profession</label>
                <div className="text-blue-600">{applicant.description || "Nil"}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold">Experiences</label>
                <div className="text-blue-600 whitespace-pre-line">
                  {applicant.cv
                    ? applicant.cv
                    : "No professional designation"}
                </div>
              </div>
            </div>
  
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => handleClick(true)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleClick(false)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )} */}
  
  {applicant && (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-6">
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
          {applicant.username}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
          {applicant.email || "N/A"}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">User Type</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
          {applicant.usertype || "Free User"}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Expert User</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
          {userTopic ? "Yes" : "No"}
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Account Status</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
          {applicant.status}
        </div>
      </div>
    </div>
        {/* ✅ ADD THESE TWO BLOCKS BELOW THE GRID */}
    <div className="sm:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">Profession</label>
      <div className="bg-gray-100 px-4 py-2 rounded-lg text-base font-medium text-gray-800">
        {applicant.description || "No profession/description provided"}
      </div>
    </div>

    <div className="sm:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (CV)</label>
      <div className="bg-gray-100 px-4 py-2 rounded-lg text-base text-gray-800 whitespace-pre-line max-h-60 overflow-y-auto">
        {applicant.cv ? applicant.cv : "No CV submitted"}
      </div>
    </div>

    <div className="flex justify-end pt-4 gap-4">
      <button
        onClick={() => handleClick(true)}
        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Approve
      </button>
      <button
        onClick={() => handleClick(false)}
        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Reject
      </button>
    </div>
  </div>
)}


        {/* Table Header */}
        <div className="text-2xl font-bold  mb-2">Expert Applications</div>
  
        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Category</th>
              </tr>
            </thead>
{/*             <tbody className="divide-y divide-gray-100">
              {applications.map((application, index) => (
                <tr
                  key={application.username}
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setApplicantWithTopic(application)}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{application.username}</td>
                  <td className="px-4 py-3">
                    {topics.find((topic) => topic.topicid === application.topicid)?.name || "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody> */}
            <tbody className="divide-y divide-gray-100">
  {applications.map((application, index) => (
    <tr
      key={`${application.username}-${index}`}
      className="hover:bg-gray-50 cursor-pointer transition"
      onClick={() => setApplicantWithTopic(application)}
    >
      <td className="px-4 py-3">{index + 1}</td>
      <td className="px-4 py-3">{application.username}</td>
      <td className="px-4 py-3">
        {topics.find(
          (topic) => String(topic.topicid) === String(application.topicid)
        )?.name || "Unknown"}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
  
};

export default AdminExperts;
