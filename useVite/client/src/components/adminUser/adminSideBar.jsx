import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden absolute top-4 left-3 bg-blue-600 text-white p-2 rounded-md shadow-lg z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`
          bg-[#BFD8FF] text-blue-900 p-6 shadow-xl
          md:relative md:translate-x-0 md:w-[280px] w-full
          flex flex-col gap-3 text-[15px] font-grotesk
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transform transition-transform duration-300 ease-in-out
          md:min-h-screen min-h-full
        `}
      >
        <Link to="/admin-guidelines">Update Guidelines &gt;</Link>
        <Link to="/admin-categories">Manage Categories &gt;</Link>
        <Link to="/admin-profile">Manage Profile &gt;</Link>
        <Link to="/admin-subscriptions">Manage Subscriptions &gt;</Link>
        <Link to="/admin-features">Manage Feature Display &gt;</Link>
        <Link to="/admin-users">Manage Users &gt;</Link>
        <Link to="/admin-testimonials">Manage Testimonials &gt;</Link>
        <Link to="/admin-applications">Manage Applications &gt;</Link>
        <Link to="/admin-comment-reports">Comment Reports &gt;</Link>
        <Link to="/admin-article-reports">Article Reports &gt;</Link>
        <Link to="/admin-ratings">Ratings Report &gt;</Link>
      </nav>
    </>
  );
};

export default AdminSidebar;
