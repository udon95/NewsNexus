import React, { useState, useEffect, useRef } from "react";
// import "../index.css";
import AdminSidebar from "./adminSideBar.jsx";
import Navbar from "../navBar.jsx";
import { useNavigate  } from "react-router-dom";

const AdminUsers = () => {

    const navigate = useNavigate();
    

    const handleClick = () => {
        navigate("/AdminUserDetails")
    }; 


    return (
        <div className="min-h-screen w-screen bg-white">
            {/* Navbar */}
            <Navbar />
            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />
                <div className="flex-1">
                <div className="text-2xl sm:text-3xl text-left mt-8 ml-10  font-bold">
                        Search users:
                    </div>
                    <div className="flex">
                    <input placeholder="Search user"
                    className="ml-10 mt-5 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                    </input>
                    <button
                    type="button"
                    className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                    onClick={handleClick}>
                    Search
                </button>
                </div>

                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
                    Users:
                    </div>
                        <div onClick={handleClick}
                        className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Users 1
                        </div>
                        <div onClick={handleClick}
                        className="ml-10 mt-7 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Users 2
                        </div>
                        <div onClick={handleClick}
                        className="ml-10 mt-7 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Users 3
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AdminUsers;