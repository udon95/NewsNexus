import React, { useState, useEffect, useRef } from "react";
// import "../index.css";
import AdminSidebar from "./adminSideBar.jsx";
// import Navbar from "../navbar.jsx";

const AdminExperts = () => {

    const [selectedButton, setSelectedButton] = useState(null); // Track selected button

    const handleClick = (id) => {
        setSelectedButton(id); // Set clicked button as selected
    };

    useEffect(() => {
        setSelectedButton(1);
      }, []);

    return (
        <div className="w-screen min-h-screen flex flex-col overflow-auto">
            {/* Navbar */}
            {/* <Navbar /> */}
            <div className="flex">
                {/* Sidebar */}
                {/* <AdminSidebar /> */}
                <div className="flex-1 font-grotesk">
                <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                        Applicant particulars:
                    </div>
                    <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Username
                    </div>
                    <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Professional designation
                    </div>
                    <div className="ml-10 mt-5 max-w-[500px] min-h-[200px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Other details
                    </div>
                    <div className="flex">
                    <button
                    type="button"
                    className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                    onClick={handleClick}>
                    Approve
                </button>
                <button
                    type="button"
                    className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                    onClick={handleClick}>
                    Reject
                </button>
                </div>
                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
                    Applications:
                    </div>
                        <div className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Application 1
                        </div>
                        <div className="ml-10 mt-7 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Application 2
                        </div>
                        <div className="ml-10 mt-7 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Application 3
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AdminExperts;