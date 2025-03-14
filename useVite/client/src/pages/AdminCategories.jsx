import React, { useState } from "react";
import "../index.css";
import AdminSidebar from "../components/adminUser/adminSideBar.jsx";
import Navbar from "../components/navBar.jsx";

const AdminCategories = () => {
    const topics = [
        "Finance", "Politics", "Entertainment", "Sports", "Weather",
        "Lifestyle", "Beauty", "Hollywood", "China", "Horticulture",
        "Culinary", "LGBTQ++", "Singapore", "Environment",
        "Investment", "USA", "Luxury", "Korea"
    ];

    // State for selected topic
    const [selectedTopic, setSelectedTopic] = useState("");

    // Function to update selected topic
    const moveSelection = (topic) => {
        setSelectedTopic(topic);
    };

    return (
        <div className="min-h-screen w-screen bg-white">
            {/* Navbar */}
            <Navbar />
            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />
                <div className="flex-1">
                    <div className="flex">
                        {/* Display Selected Topic */}
                        <div className="ml-10 mt-5 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg">
                            {selectedTopic || "Select a category"} {/* Display selected topic or placeholder */}
                        </div>

                        {/* Add Button */}
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#3F414C] ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                            onClick={() => alert(`Added: ${selectedTopic}`)}>
                            Add
                        </button>
                    </div>

                    {/* Category List */}
                    <div className="flex flex-col items-start w-full mx-10 my-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {topics.map((topic, index) => (
                                <button
                                    key={index}
                                    onClick={() => moveSelection(topic)}
                                    className="text-base font-semibold cursor-pointer px-5 py-3 rounded-[20px] border-none transition-all text-white bg-[#7FB0FE] hover:bg-[#00317f]">
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
