import React from "react";
import {Link} from "react-router-dom";

const Navbar=()=>{
    return (
      <><nav className="w-full bg-blue-200 py-3 shadow-md overflow-x-auto ">
            <div className="max-w-screen-lg mx-auto flex flex-nowrap justify-center items-center text-sm sm:text-lg text-blue-900 whitespace-nowrap gap-6 px-4">
                <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
                <a href="/" className="hover:underline px-4 sm:px-6 font-bold">
                    Home
                </a>
                <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
                <a href="/explore" className="hover:underline px-4 sm:px-6 font-bold">
                    Explore
                </a>
                <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
                <a
                    href="/subscription"
                    className="hover:underline px-4 sm:px-6 font-bold"
                >
                    Subscription
                </a>
                <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
                <a
                    href="/guidelines"
                    className="hover:underline px-4 sm:px-6 font-bold"
                >
                    Platform Guidelines
                </a>
                <div className="w-px h-5 bg-blue-900"></div> {/* Divider */}
            </div>
        </nav></>
 );
};
export default Navbar;