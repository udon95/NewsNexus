import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle menu

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="md:hidden absolute top-4 left-3 bg-blue-600 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Sidebar (Hidden by Default, Slides in on Mobile) */}
      <nav
        className={`fixed md:relative md:top-0 top-18 left-0 h-full bg-blue-200 text-blue-900 shadow-xl p-6
        transform transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 
        w-full max-w-[210px] md:max-w-[290px]`}
      >
        {/* Close Button */}
        <button
          className="md:hidden absolute top-4 right-4 text-blue-900"
          onClick={() => setIsOpen(false)}
        ></button>

        {/* Sidebar Links */}
        <div className="flex flex-col gap-4 mt-2 text-lg font-grotesk">
          <a href="/adminDashboard/AdminGuidelines" className="tracking-wide">
            Guidelines &gt;
          </a>
          <a href="/adminDashboard/AdminPrivacy" className="tracking-wide">
            Privacy Policy &gt;
          </a>
          <a href="/adminDashboard/AdminCategories" className="tracking-wide">
            Categories &gt;
          </a>
          <a href="/adminDashboard/AdminProfile" className="tracking-wide">
            Profile &gt;
          </a>
          <a href="/adminDashboard/AdminSubscription" className="tracking-wide">
            Subscription &gt;
          </a>
          <a href="/adminDashboard/AdminFeatures" className="tracking-wide">
            Feature display &gt;
          </a>
          <a href="/adminDashboard/AdminUsers" className="tracking-wide">
            Users &gt;
          </a>
          <a href="/adminDashboard/AdminTestimonials" className="tracking-wide">
            Testimonial &gt;
          </a>
          <a href="/adminDashboard/AdminExperts" className="tracking-wide">
            Expert Applications &gt;
          </a>
          <a href="/adminDashboard/AdminCommunityNotes" className="tracking-wide" >
            Community Notes &gt;
          </a>
          <a
            href="/adminDashboard/AdminCommentReports"
            className="tracking-wide"
          >
            Comment Reports &gt;
          </a>
          <a
            href="/adminDashboard/AdminArticleReports"
            className="tracking-wide"
          >
            Article Reports &gt;
          </a>
          <a href="/adminDashboard/AdminRoomArticleReports" className="tracking-wide" >
            Room Article Reports &gt;
          </a>
          <a href="/adminDashboard/AdminRoomCommentReports" className="tracking-wide" >
            Room Comment Reports &gt;
          </a>
        </div>
      </nav>
    </>
  );
};

export default AdminSidebar;
