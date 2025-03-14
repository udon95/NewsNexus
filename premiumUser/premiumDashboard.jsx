import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PremSidebar from "./premSideBar";
import PremManageArticle from "./premManageArticle.jsx";
import PremiumManageProfile from "./premiumManageProfile.jsx";
import PremiumWriteArticle from "./premiumWriteArticle.jsx";
import PremiumSubmitTest from "./premiumSubmitTest.jsx";
import PremiumApplyExpert from "./premiumApplyExpert.jsx"; 


function PremDashboard() {
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden">
      <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[250px] md:flex-none">
          <PremSidebar />
        </aside>
        <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full w-full max-w-screen px-1 md:px-6">
          <Routes>
            {/* Default Route: Redirect to Manage Articles */}
            <Route index element={<Navigate to="manageArticles" />} />

            {/* Manage My Articles (Default View) */}
            <Route path="manageArticles" element={<PremManageArticle />} />

            {/* Other Sidebar Pages */}
            <Route path="writeArticle" element={<PremiumWriteArticle />} />
            <Route path="manageProfile" element={<PremiumManageProfile />} />
            <Route path="submitTest" element={<PremiumSubmitTest />} />
            <Route path="applyexpert" element={<PremiumApplyExpert />} /> {/* ✅ FIXED */}
            
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default PremDashboard;