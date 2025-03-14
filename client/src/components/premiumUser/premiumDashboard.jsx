import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PremSidebar from "./premSideBar.jsx";
import PremApplyExpert from "./premiumApplyExpert.jsx";

function PremiumDashboard() {
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden">
      <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[250px] md:flex-none">
          <PremSidebar />
        </aside>
        <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full w-full max-w-screen px-1 md:px-6">
          <Routes>
            {/* Default Route: Redirect to Manage Articles */}
            <Route index element={<Navigate to="expertApp" />} />

            {/* Manage My Articles (Default View) */}
            {/* <Route path="manageArticles" element={<FreeManageArticle />} /> */}

            {/* Other Sidebar Pages */}
            <Route path="expertApp" element={<PremApplyExpert />} />
            {/* <Route path="manageProfile" element={<PremManageProfile />} /> */}
            {/* <Route path="submitTest" element={<PremSubmitTest />} /> */}
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default PremiumDashboard;
