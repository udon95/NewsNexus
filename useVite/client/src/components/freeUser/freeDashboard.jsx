import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FreeSidebar from "./freeSideBar";
import FreeManageArticle from "./freeManageArticle";
import FreeManageProfile from "./freeManageProfile";
import FreeWriteArticle from "./freeWriteArticle";
import FreeSubmitTest from "./freeSubmitTest";

function FreeDashboard() {
  return (
    <div className="w-full min-w-screen max-h-screen flex flex-col overflow-hidden">
      <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[250px] md:flex-none">
          <FreeSidebar />
        </aside>
        <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full w-full max-w-screen px-1 md:px-6">
          <Routes>
            {/* Default Route: Redirect to Manage Articles */}
            <Route index element={<Navigate to="manageArticles" />} />

            {/* Manage My Articles (Default View) */}
            <Route
              path="manageArticles"
              element={<FreeManageArticle />}
            />

            {/* Other Sidebar Pages */}
            <Route
              path="writeArticle"
              element={<FreeWriteArticle />}
            />
            <Route
              path="manageProfile"
              element={<FreeManageProfile />}
            />
            <Route
              path="submitTest"
              element={<FreeSubmitTest />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default FreeDashboard;
