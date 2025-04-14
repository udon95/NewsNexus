import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PremSidebar from "./premSideBar.jsx";
import PremiumApplyExpert from "./premiumApplyExpert.jsx";
import PremManageArticle from "./premiumManageArticle.jsx";
import PremiumSubmitTest from "./premiumSubmitTest.jsx";
import PremiumWriteArticle from "./premiumWriteArticle.jsx";
import PremiumManageProfile from "./premiumManageProfile.jsx";
import PremiumManageRooms from "./premiumManageRooms.jsx";
import PremiumEditPosted from "./premiumEditPosted";

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
            <Route index element={<Navigate to="manageProfile" />} />

            {/* Manage My Articles (Default View) */}
            {/* <Route path="manageArticles" element={<PremManageArticle />} /> */}

            {/* Other Sidebar Pages */}
            <Route path="manageArticles" element={<PremManageArticle />} />
            <Route path="writeArticle" element={<PremiumWriteArticle />} />
            <Route path="writeArticle/:id" element={<PremiumWriteArticle />} />
            <Route path="editPosted/:postType/:articletitle" element={<PremiumEditPosted />} />
            <Route path="manageProfile" element={<PremiumManageProfile />} />
            <Route path="submitTestimonial" element={<PremiumSubmitTest />} />
            <Route path="manageRooms" element={<PremiumManageRooms />} />
            <Route path="applyExpert" element={<PremiumApplyExpert />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default PremiumDashboard;