import React, { useState } from "react";
// import "../index.css";
import AdminSidebar from "./adminSideBar.jsx";
import Navbar from "../navBar.jsx";

const AdminGuidelines = () => {

    const handleClick = () => {
        alert("updated");
    };

return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />
      <div className="flex">  
        {/* Sidebar */}
        <AdminSidebar />
    
            <div className="flex-1">
                <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                    Guidelines:
                </div>
                <textarea className="ml-10  min-w-[700px] min-h-[400px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
                ></textarea>
                <button
                    type="button"
                    className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                    onClick={handleClick}>
                    Update
                </button>
            </div>
      </div>
    </div>
  );
};

export default AdminGuidelines;