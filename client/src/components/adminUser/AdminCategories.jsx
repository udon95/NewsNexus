import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";

const AdminCategories = () => {
  const [topics, setTopics] = useState([]);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [newTopic, setNewTopic] = useState([]);
  const [topicCount, setTopicCount] = useState([]);

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

    const fetchSuggestedTopics = async () => {
      const { data, error } = await supabase
        .from("topic_applications")
        .select("*")
        .eq("status", "Pending");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setSuggestedTopics(data);
        console.log(data);
      }
    };

    fetchTopics();
    fetchSuggestedTopics();
  }, []);

  useEffect(() => {
    const grouped = Object.entries(
      suggestedTopics.reduce((acc, item) => {
        acc[item.topic_name] = (acc[item.topic_name] || 0) + 1;
        return acc;
      }, {})
    ).map(([topic_name, count]) => ({ topic_name, count }));

    setTopicCount(grouped.filter((suggestion) => topics.some((topic) => !(topic.name === suggestion.topic_name))));
  }, [suggestedTopics]);

  useEffect(() => {
    console.log(topicCount);
  }, [topicCount]);

  const createTopic = async () => {
    const { data, error } = await supabase
      .from("topic_categories")
      .insert([{ name: newTopic }])
      .select();
    if (error) {
      console.error("Error inserting data:", error);
    } else {
      alert("Added topic : " + newTopic);
    }
  };

  const createTopicFromSuggestion = async (topic) => {
    const normalizedName = topic.topic_name.charAt(0).toUpperCase() + topic.topic_name.slice(1).toLowerCase();
  
    const { data: updateData, error: updateError } = await supabase
      .from("topic_applications")
      .update({ status: "Approved" })
      .eq("topic_name", topic.topic_name)
      .select();
    if (updateError) {
      console.error("Error updating application:", updateError);
      return;
    }
  
    const { data: insertData, error: insertError } = await supabase
      .from("topic_categories")
      .insert([{ name: normalizedName }])
      .select();
    if (insertError) {
      console.error("Error inserting topic:", insertError);
      return;
    }
  
    alert("Added topic: " + normalizedName);
    window.location.reload();
  };

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex">
        <div className="flex-1 font-grotesk">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Add New Categories:
          </div>
          <div className="flex">
            <input
              className="ml-10 mt-5 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg"
              onChange={(e) => setNewTopic(e.target.value)}
            ></input>
            <button
              type="submit"
              className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
              onClick={createTopic}
            >
              Add
            </button>
          </div>
          <div className="flex flex-col items-start w-full mx-10 my-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <button
                  key={index}
                  className="text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all text-white bg-[#7FB0FE] hover:bg-[#00317f]"
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            User Suggested Categories:
          </div>
          {topicCount.length > 0 ? (
              <div className="overflow-x-auto ml-10 mt-8 max-w-5xl">
              <table className="min-w-full bg-gray-100 rounded-2xl shadow-lg text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Suggestions</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {topicCount.map((topic, index) => (
                  <tr
                    key={topic.topic_name}
                    className="cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => openReport(row)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{topic.topic_name}</td>
                    <td className="p-3">{topic.count}</td>
                    <td className="p-3">{                
                      <button className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                        onClick={() => createTopicFromSuggestion(topic)}>
                        Add
                      </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            // topicCount.map((topic) => (
            //   <div className="flex" key={topic.topic_name}>
            //     <div className="ml-10 mt-5 min-w-100 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg">
            //       {topic.topic_name}: &emsp;{topic.count} Suggestions
            //     </div>
            //     <button
            //       className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
            //       onClick={() => createTopicFromSuggestion(topic)}
            //     >
            //       Add
            //     </button>
            //   </div>
            // ))
          ) : (
            <div className="ml-10 mt-8">0 Results</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
