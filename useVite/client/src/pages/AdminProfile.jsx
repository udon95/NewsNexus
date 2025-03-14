import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import AdminSidebar from "../components/adminUser/adminSideBar.jsx";
import Navbar from "../components/navBar.jsx";

const AdminProfile = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/AdminUserDetails");
    };

    return (
        <div className="min-h-screen w-screen bg-white">
            {/* Navbar */}
            <Navbar />
            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />
                <div className="flex-1">
                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                        Profile particulars:
                    </div>

                    {/* Administrator Name */}
                    <div className="ml-10 mt-5 max-w-[180px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Administrator1
                    </div>

                    {/* Email Input */}
                    <div className="flex">
                        <input
                            className="ml-10 mt-8 min-w-[150px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
                            value="Administrator1@email.com"
                            readOnly
                        />
                        <button
                            type="button"
                            className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                            onClick={handleClick}>
                            Update
                        </button>
                    </div>

                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
                        User 1 Articles:
                    </div>

                    {/* Clickable Articles */}
                    <button
                        className="ml-10 mt-5 max-w-[180px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
                        onClick={handleClick}>
                        User 1 Article 1
                    </button>

                    <button
                        className="ml-10 mt-5 max-w-[180px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
                        onClick={handleClick}>
                        User 1 Article 2
                    </button>

                    <button
                        className="ml-10 mt-5 max-w-[180px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
                        onClick={handleClick}>
                        User 1 Article 3
                    </button>

                    {/* Suspend Button */}
                    <button
                        type="button"
                        className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer">
                        Suspend
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
