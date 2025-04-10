import React from "react";
import { useNavigate } from "react-router-dom";
// import "../index.css";
import AdminSidebar from "./adminSideBar.jsx";
// import Navbar from "../navbar.jsx";

const AdminProfile = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/AdminUserDetails");
    };

    return (
        <div className="w-screen min-h-screen flex flex-col overflow-auto">
            {/* Navbar */}
            {/* <Navbar /> */}
            <div className="flex">
                {/* Sidebar */}
                <div className="flex-1 font-grotesk">
                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                        Profile particulars:
                    </div>

                    {/* Administrator Name */}
                    <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Administrator1
                    </div>

                    {/* Email Input */}
                    <div className="flex">
                        <input
                            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
                            value="Administrator1@email.com"
                            readOnly
                        />
                        <button
                            type="button"
                            className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-8 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                            onClick={handleClick}>
                            Update
                        </button>
                    </div>

                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                        Manage password:
                    </div>
                    <div className="flex">
                    <input
                            className="ml-10 mt-8 min-w-[300px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
                            placeholder="Old password"
                        />                        
                    <input
                        className="ml-10 mt-8 min-w-[300px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
                        placeholder="New password"
                    />
                    <button
                        type="button"
                        className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-8 text-white rounded-lg hover:bg-opacity-90 cursor-pointer">
                        Update
                    </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminProfile;