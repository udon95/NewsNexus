import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

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
import SubscriptionStatus from "./components/payment.jsx";
import PublicProfile from "./components/publicProfile.jsx";
import ViewRooms from "./components/premiumUser/viewRooms.jsx";
import RoomPage from "./components/premiumUser/roomPage.jsx";
import FloatingWriteButton from "./components/writeButton.jsx";
import supabase from "./api/supabaseClient.js";
import "./index.css";

function RequireAuth({ children, requirePremium = false, onlyFree = false }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const localProfile = localStorage.getItem("userProfile");

    const validateRole = (role) => {
      if (onlyFree) return role === "Free";
      if (requirePremium) return role === "Premium";
      return !!role; // any logged-in user
    };

    if (localProfile) {
      const parsed = JSON.parse(localProfile);
      const role = parsed?.role;
      if (validateRole(role)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data?.session?.user;
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("usertype")
        .select("usertype")
        .eq("userid", user.id)
        .single();

      const role = userData?.usertype;

      if (validateRole(role)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }

      setLoading(false);
    });
  }, [requirePremium]);

  if (loading) return null;

  if (isAuthorized === false) {
    alert("You are not authorized to access this page.");
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          const userId = session.user.id;

          //  Update user status to "Free" after email verification
          await supabase
            .from("usertype")
            .update({ usertype: "Free" })
            .eq("userid", userId);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <router>
      <div className="relative min-h-screen">
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
            <Route path="/article/:articleName" element={<Article />} />
            <Route
              path="/public-profile/:username"
              element={<PublicProfile />}
            />
            <Route path="/rooms" element={<ViewRooms />} />

            <Route
              path="/freeDashboard/*"
              element={
                <RequireAuth onlyFree={true}>
                  <FreeDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/premiumDashboard/*"
              element={
                <RequireAuth requirePremium={true}>
                  <PremiumDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/room/:id"
              element={
                <RequireAuth allowedUserType="Premium">
                  <PremiumDashboard /> {/* acts as layout */}
                </RequireAuth>
              }
            >
              <Route index element={<RoomPage />} />
            </Route>

            <Route
              path="/adminDashboard/*"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
        <FloatingWriteButton />
      </div>
    </router>
  );
}

export default App;
