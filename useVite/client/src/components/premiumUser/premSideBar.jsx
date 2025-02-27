import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export const PremSidebar = () => {
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
        w-full max-w-[210px] md:max-w-[280px]`}
      >
        {/* Close Button */}
        <button
          className="md:hidden absolute top-4 right-4 text-blue-900"
          onClick={() => setIsOpen(false)}
        >
          
        </button>

        {/* Sidebar Links */}
        <div className="flex flex-col gap-4 mt-2 text-lg font-grotesk">
          <a href="#" className="font-bold">
            Manage My Articles &gt;
          </a>
          <a href="#" className="tracking-wide">
            Write Articles &gt;
          </a>
          <a href="#" className="tracking-wide">
            Manage Profile &gt;
          </a>
          <a href="#" className="tracking-wide">
            Submit Testimonial &gt;
          </a>
          <a href="/" className="tracking-wide">
            Homepage &gt;
          </a>
        </div>
      </nav>
    </>
  );
};

export default PremSidebar;
