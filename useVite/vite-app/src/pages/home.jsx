import React from "react";
import {useNavigate} from "react-router-dom";
import "../index.css";
import Navbar from "../components/navbar.jsx";

function Home() {
  const navigate = useNavigate();

  return (

    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
    <Navbar/>
    <main className="flex flex-col flex-grow items-center justify-center w-full px-4 sm:px-6">

    <div className="flex justify-end gap-3 mt-4 sm:mt-4">

    <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto"
    onClick={() => navigate("/register")}>
      Register
    </button>
    <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto"
    onClick={() => navigate("/login")}>
      Login
    </button>
    {/* <button className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 w-auto"
    onClick={() => navigate("/test")}>
      Test
    </button> */}
    </div>
    </main>
    </div>
);
}

export default Home;