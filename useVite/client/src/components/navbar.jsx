import React from "react";
import { Link } from "react-router-dom";
import useAuthHook from "../hooks/useAuth";

const Navbar = () => {
  const { user, userType } = useAuthHook(); // Get user and userType

  return (
    <nav className="w-full bg-[#BFD8FF] py-3 font-grotesk shadow-md overflow-x-auto">
      <div
        className="
       max-w-screen-xl
      mx-auto
      flex items-center
      justify-between
      px-14      /* Matches header’s base padding */
      sm:px-6   /* Matches header’s sm breakpoint */
      md:px-8   /* Matches header’s md breakpoint */
      lg:px-12  /* Matches header’s lg breakpoint */
      gap-2 sm:gap-4
      text-blue-900 text-lg
      whitespace-nowrap
    "
      >
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
        {userType === "Premium" && (
          <>
            <a
              href="/rooms"
              className="hover:underline px-4 sm:px-6 font-bold"
            >
              Rooms
            </a>
            <div className="border-l border-blue-900 h-6"></div>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
