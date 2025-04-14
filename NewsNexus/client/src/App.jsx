import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import Layout from "./Layout.jsx";
import Subscription from "./pages/subscription.jsx";
import Explore from "./pages/explore.jsx";
import Guidelines from "./pages/guidelines.jsx";
import Privacy from "./pages/privacy.jsx";
import Latest from "./components/latestNews.jsx";
import Article from "./pages/article.jsx";
import FreeDashboard from "./components/freeUser/freeDashboard.jsx";
import PremiumDashboard from "./components/premiumUser/premiumDashboard.jsx";
import AdminDashboard from "./components/adminUser/adminDashboard.jsx";
import ForgotPassword from "./pages/forgetPW";
import ResetPassword from "./pages/resetPW.jsx";
import ViewRooms from "./components/premiumUser/viewRooms.jsx";
import RoomPage from "./components/premiumUser/roomPage.jsx";
import SubscriptionStatus from "./components/payment.jsx";
import PublicProfile from "./components/publicProfile.jsx";
import FactCheck from "./components/factCheck.jsx";


import AdminExperts from "./components/adminUser/AdminExperts.jsx";
import AdminProfile from "./components/adminUser/AdminProfile.jsx";
import AdminTestimonials from "./components/adminUser/AdminTestimonials.jsx";
import AdminCategories from "./components/adminUser/AdminCategories.jsx";
import AdminUserDetails from "./components/adminUser/AdminUserDetails.jsx";
import AdminGuidelines from "./components/adminUser/AdminGuidelines.jsx";
import AdminSubscription from "./components/adminUser/AdminSubscription.jsx";
import AdminFeatures from "./components/adminUser/AdminFeatures.jsx";
import AdminCommentReports from "./components/adminUser/AdminCommentReports.jsx";
import AdminArticleReports from "./components/adminUser/AdminArticleReports.jsx";
import AdminUsers from "./components/adminUser/AdminUsers.jsx";
import AdminHome from "./components/adminUser/AdminHome.jsx";


import supabase from "./api/supabaseClient.js";
import "./index.css";

function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          const userId = session.user.id;

          //  Update user status to "Free" after email verification
          await supabase
            .from("users")
            .update({ status: "Free" })
            .eq("auth_id", userId);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route
            path="/subscription-status/:status"
            element={<SubscriptionStatus />}
          />

          <Route path="/explore" element={<Explore />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/latest" element={<Latest />} />
          <Route path="/article/:title" element={<Article />} />
          <Route path="/public-profile/:userid" element={<PublicProfile />} />

          <Route path="/freeDashboard/*" element={<FreeDashboard />} />
          <Route path="/premiumDashboard/*" element={<PremiumDashboard />} />
          <Route path="/adminDashboard/*" element={<AdminDashboard />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/AdminExperts/*" element={<AdminExperts />} />
          <Route path="/AdminProfile/*" element={<AdminProfile />} />
          <Route path="/AdminTestimonials/*" element={<AdminTestimonials />} />
          <Route path="/AdminCategories/*" element={<AdminCategories />} />
          <Route path="/AdminUserDetails/*" element={<AdminUserDetails />} />
          <Route path="/AdminGuidelines/*" element={<AdminGuidelines />} />
          <Route path="/AdminSubscription/*" element={<AdminSubscription />} />
          <Route path="/AdminFeatures/*" element={<AdminFeatures />} />
          <Route path="/AdminCommentReports/*" element={<AdminCommentReports />} />
          <Route path="/AdminArticleReports/*" element={<AdminArticleReports />} />
          <Route path="/AdminUsers/*" element={<AdminUsers />} />
          <Route path="/AdminHome/*" element={<AdminHome />} />

          
          <Route path="/rooms" element={<ViewRooms />} />
          <Route path="/room/:id" element={<RoomPage />} />
          
          <Route path="/factcheck" element={<FactCheck/>}/>
        </Route>
      </Routes>
  );
}

export default App;
