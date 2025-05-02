import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

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

import FloatingWriteButton from "./components/writeButton.jsx";
import supabase from "./api/supabaseClient.js";
import "./index.css";

function RequireAuth({ children }) {
  const session = supabase.auth.getSession(); // if you're using async method, convert this to a hook or use useEffect + useState
  const isLoggedIn = !!session?.data?.session;

  return isLoggedIn ? children : <Navigate to="/" />;
}

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

            <Route
              path="/freeDashboard/*"
              element={
                <RequireAuth>
                  <FreeDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/premiumDashboard/*"
              element={
                <RequireAuth>
                  <PremiumDashboard />
                </RequireAuth>
              }
            />
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
