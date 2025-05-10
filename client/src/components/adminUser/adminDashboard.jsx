import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "./adminSideBar.jsx";
import AdminExperts from "./AdminExperts.jsx";
import AdminProfile from "./AdminProfile.jsx";
import AdminTestimonials from "./AdminTestimonials.jsx";
import AdminCategories from "./AdminCategories.jsx";
import AdminUserDetails from "./AdminUserDetails.jsx";
import AdminGuidelines from "./AdminGuidelines.jsx";
import AdminPrivacy from "./AdminPrivacy.jsx";
import AdminSubscription from "./AdminSubscription.jsx";
import AdminFeatures from "./AdminFeatures.jsx";
import AdminCommentReports from "./AdminCommentReports.jsx";
import AdminArticleReports from "./AdminArticleReports.jsx";
import AdminUsers from "./AdminUsers.jsx";
import AdminHome from "./AdminHome.jsx";
import AdminCommunityNotes from "./AdminCommunityNotes.jsx";
import AdminRoomArticleReports from "./AdminRoomArticleReports.jsx";
import AdminRoomCommentReports from "./AdminRoomCommentReports.jsx";

function AdminDashboard() {
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col overflow-hidden">
      <main className="flex-grow w-full flex min-h-full overflow-hidden">
        <aside className="md:w-[290px] md:flex-none">
          <AdminSidebar />
        </aside>
        <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full w-full max-w-screen px-1 md:px-6">
          <Routes>
            <Route index element={<AdminHome />} />

            <Route path="AdminExperts/*" element={<AdminExperts />} />
            <Route path="AdminProfile/*" element={<AdminProfile />} />
            <Route path="AdminTestimonials/*" element={<AdminTestimonials />} />
            <Route path="AdminCategories/*" element={<AdminCategories />} />
            <Route path="AdminUserDetails/*" element={<AdminUserDetails />} />
            <Route path="AdminGuidelines/*" element={<AdminGuidelines />} />
            <Route path="AdminPrivacy/*" element={<AdminPrivacy />} />
            <Route path="AdminSubscription/*" element={<AdminSubscription />} />
            <Route path="AdminFeatures/*" element={<AdminFeatures />} />
            <Route
              path="AdminCommentReports/*"
              element={<AdminCommentReports />}
            />
            <Route
              path="AdminArticleReports/*"
              element={<AdminArticleReports />}
            />
            <Route path="AdminUsers/*" element={<AdminUsers />} />
            <Route
              path="AdminCommunityNotes/*"
              element={<AdminCommunityNotes />}
            />
            <Route
              path="AdminRoomArticleReports/*"
              element={<AdminRoomArticleReports />}
            />
            <Route
              path="AdminRoomCommentReports/*"
              element={<AdminRoomCommentReports />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
