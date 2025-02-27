import React from "react";
import AdminSidebar from "./adminSideBar.jsx";

function AdminDashboard() {
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden">
          <main className="flex-grow w-full flex min-h-full overflow-hidden">
          <aside className="md:w-[250px] md:flex-none">
              <AdminSidebar />
            </aside>
            <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full w-full max-w-screen px-1 md:px-6">
              </div>
          </main>
        </div>
  );
}

export default AdminDashboard;
