import React, { useState, useEffect, useRef } from "react";
import supabase from "../../api/supabaseClient";


const AdminCategories = () => {
    const [topics, setTopics] = useState([]);
    const [suggestedTopics, setSuggestedTopics] = useState([]);
    const [newTopic, setNewTopic] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
          const { data, error } = await supabase
          .from("topic_categories")
          .select("*");
          if (error) {
            console.error("Error fetching users:", error);
          } else {
            setTopics(data);
            console.log(data)
          }
        };

        const fetchSuggestedTopics = async () => {
            const { data, error } = await supabase
            .from("topic_applications")
            .select("*")
            .eq('status', "Pending");
            if (error) {
              console.error("Error fetching users:", error);
            } else {
              setSuggestedTopics(data);
              console.log(data)
            }
          };

        fetchTopics();
        fetchSuggestedTopics();
      }, []);

    const createTopic = async () =>  {
        const { data, error } = await supabase
        .from('topic_categories')
        .insert([{ name: newTopic}])
        .select();
        if (error) {
            console.error('Error inserting data:', error);
        } else {
            alert('Added topic : '+ newTopic);
        }
    };

    const createTopicDeleteSuggestion = async (cat) =>  {
        const { data, error } = await supabase
        .from('topic_categories')
        .insert([{ name: cat.topic_name}])
        .select();
        if (error) {
            console.error('Error inserting data:', error);
        } else {
            const { data1, error } = await supabase
            .from('topic_applications')
            .update({ status: "Resolved" })
            .eq('application_id', cat.application_id);

            console.log('Matching row:', data1);

        } if (error) {
            console.error('Error inserting data:', error);
        } else {
        alert('Added topic : '+ cat.topic_name );
        window.location.reload();
        }
    };

    return (
        <div className="w-screen min-h-screen flex flex-col overflow-auto">
            <div className="flex">
                <div className="flex-1 font-grotesk">
                <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
                Add New Categories:
                </div>
                    <div className="flex">
                        <input className="ml-10 mt-5 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg" 
                            onChange={(e) => setNewTopic(e.target.value)}>
                        </input>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                            onClick={createTopic}>
                            Add
                        </button>
                    </div>
                    <div className="flex flex-col items-start w-full mx-10 my-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {topics.map((topic, index) => (
                                <button
                                    key={index}
                                    className="text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all text-white bg-[#7FB0FE] hover:bg-[#00317f]">
                                    {topic.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
                    User Suggested Categories:
                    </div>
                    {suggestedTopics.length > 0 ? (
                        suggestedTopics.map((row) => (
                            <div className="flex" key={row.application_id}>
                            <div className="ml-10 mt-5 min-w-100 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg">
                                {row.topic_name}
                            </div>
                            <button
                                className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                                onClick={() => createTopicDeleteSuggestion(row)}
                            >
                                Add
                            </button>
                            </div>
                        ))
                        ) : (
                        <div className="ml-10 mt-8">0 results</div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;