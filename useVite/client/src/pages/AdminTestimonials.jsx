import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import AdminSidebar from "../components/adminUser/adminSideBar.jsx";
import Navbar from "../components/navBar.jsx";

const AdminTestimonials = () => {

    const [selectedButton, setSelectedButton] = useState(null); // Track selected button

    const handleClick = (id) => {
        setSelectedButton(id); // Set clicked button as selected
    };

    useEffect(() => {
        setSelectedButton(1);
      }, []);

    return (
        <div className="min-h-screen w-screen bg-white">
            {/* Navbar */}
            <Navbar />
            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />
                <div className="flex-1">
                    <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
                    Testimonials:
                    </div>
                    <div className="flex">
                        <div className="ml-10 mt-8 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Testimonial 1
                        </div>
                        <button
                        type="submit"
                        className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                        onClick={() => handleClick(1)}>
                            View
                        </button>
                    </div>
                    <div className="flex">
                        <div className="ml-10 mt-7 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Testimonial 2
                        </div>
                        <button
                        type="submit"
                        className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                        onClick={() => handleClick(2)}>
                            View
                        </button>
                    </div>
                    <div className="flex">
                        <div className="ml-10 mt-7 min-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300">
                        Testimonial 3
                        </div>
                        <button
                        type="submit"
                        className="px-6 py-3 bg-[#3F414C] flex ml-5 mt-7 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                        onClick={() => handleClick(3)}>
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AdminTestimonials;