import { Outlet } from "react-router-dom";
import Header from "./components/header";

const Layout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center w-full px-4 sm:px-6">
        <Outlet />
      </main>

      <footer className="w-full h-16 bg-[#7FB0FE] text-sm sm:text-base text-[#00317F] font-bold flex items-center justify-left px-20">
        <p>&copy; 2025 NewsNexus. All Rights Reserved. &nbsp; &nbsp; &nbsp;</p>
        <a href="/privacy" className="underline">
          {" "}
          Privacy Policy
        </a>
      </footer>
    </div>
  );
};

export default Layout;
