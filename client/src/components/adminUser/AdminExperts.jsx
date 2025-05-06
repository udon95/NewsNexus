import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";

const AdminExperts = () => {
  const [applications, setApplications] = useState([]);
  const [applicant, setApplicant] = useState(null);
  const [topics, setTopics] = useState([]);
  const [userTopic, setUserTopic] = useState(null);

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

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("expert_application")
        .select("*")
        .eq("status", "Pending");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setApplications(data);
        console.log(data);
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

  useEffect(() => {
    setUserTopic(topics.find((topic) => topic.topicid == applicant.topicid));
    console.log(applicant.topicid);
    console.log(userTopic);

  }, [applicant]);

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          {applicant && userTopic? (
            <div>
              <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                Applicant particulars:
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                User:&emsp;{applicant.username}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Topic:&emsp;{userTopic.name}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                Profession:
                <br />
                {applicant ? applicant.description : "Professional designation"}
              </div>
              <div className="ml-10 mt-5 max-w-[500px] min-h-[200px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                {applicant.cv
                  ? applicant.cv.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))
                  : "No professional designation"}
              </div>
              <div className="flex">
                <button
                  type="button"
                  className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                  onClick={() => handleClick(true)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                  onClick={() => handleClick(false)}
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Expert applications:
          </div>
          <div className="flex flex-col items-start w-full mx-10 ">
            {applications.map((application) => (
              <div
                key={application.username}
                className=" mt-8 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                onClick={() => setApplicant(application)}
              >
                {application.username}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExperts;
