import React from "react";
import { useNavigate } from "react-router-dom";
// import "../index.css";
import AdminSidebar from "./adminSideBar.jsx";
import Navbar from "../navBar.jsx";

const AdminUserDetails = () => {
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
        {/* <AdminSidebar /> */}
        <div className="flex-1 font-grotesk">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            User details:
          </div>

          <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value="UserID"
            readOnly
          />
          {/* Email Input */}
          <div className="flex ">
            <input
              className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
              value="User1@email.com"
            />
            <button
              type="button"
              className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-8 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
              onClick={handleClick}
            >
              Update
            </button>
          </div>
          <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value="Username"
            readOnly
          />
          <input
            className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            value="Account Active"
            readOnly
          />
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
            User 1 articles:
          </div>

          {/* Clickable Articles */}
          <div
            className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
            onClick={handleClick}
          >
            User 1 Article 1
          </div>

          <div
            className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
            onClick={handleClick}
          >
            User 1 Article 2
          </div>

          <div
            className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 hover:bg-gray-200"
            onClick={handleClick}
          >
            User 1 Article 3
          </div>

          {/* Suspend Button */}
          <button
            type="button"
            className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
          >
            Suspend user
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
