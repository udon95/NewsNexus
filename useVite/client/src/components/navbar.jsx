import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
   
    <nav className="w-full bg-[#BFD8FF] py-3 font-grotesk shadow-md overflow-x-auto">
      
      <div className="flex items-center justify-between sm:px-48 px-20 gap-4 text-blue-900 text-lg whitespace-nowrap ">

        <div className="border-l border-blue-900 h-6"></div> 
        <a href="/" className="hover:underline px-4 sm:px-6 font-bold">
          Home
        </a>
        <div className="border-l border-blue-900 h-6"></div> 
        <a href="/explore" className="hover:underline px-4 sm:px-6 font-bold">
          Explore
        </a>
        <div className="border-l border-blue-900 h-6"></div> 
        <a
          href="/subscription"
          className="hover:underline px-4 sm:px-6 font-bold"
        >
          Subscription
        </a>
        <div className="border-l border-blue-900 h-6"></div> 
        <a
          href="/guidelines"
          className="hover:underline px-4 sm:px-6 font-bold"
        >
          Platform Guidelines
        </a>
        <div className="border-l border-blue-900 h-6"></div> 
      </div>
    </nav>
  );
};
export default Navbar;
