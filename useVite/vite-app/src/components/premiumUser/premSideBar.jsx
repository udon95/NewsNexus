import React from "react";
import { Link } from "react-router-dom";

export const PremSidebar = () => {
  return (
    <nav className="flex flex-col h-full px-6 py-8 w-full text-lg font-groteskfont-medium text-blue-900 bg-blue-200 max-md:px-5">
      <a href="#" className="font-bold tracking-wide ">
        Manage My Articles &gt;
      </a>
      <a href="#" className="mt-6 tracking-wide ">
        Write Articles &gt;
      </a>
      <a href="#" className="mt-6 tracking-wide ">
        Manage Profile &gt;
      </a>
      <a href="#" className="mt-6 tracking-wide ">
        Submit Testimonial &gt;
      </a>
    </nav>
  );
};

export default PremSidebar;