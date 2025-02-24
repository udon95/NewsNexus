import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import Layout from  "./Layout.jsx";
import Test from "./pages/testregister.jsx"
import Subscription from "./pages/subscription.jsx"
import Explore from "./pages/explore.jsx"
import Guidelines from "./pages/guidelines.jsx"
import Privacy from "./pages/privacy.jsx"
import Latest from "./components/latestNews.jsx";
import Article from "./pages/article.jsx";
import FreeUser from "./components/freeUser/freeManageArticle.jsx";
import ViewRooms from "./components/premiumUser/viewRooms.jsx";
import RoomPage from "./components/premiumUser/roomPage.jsx";
import SubscriptionStatus from "./components/payment.jsx";

import TestLogin from "./pages/testlogin.jsx";
import Profile from "./pages/testProfile.jsx";
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
      <Route path="/" element={<Layout/>}>
      <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/subscription-status/:status" element={<SubscriptionStatus />} />

        <Route path="/explore" element={<Explore />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/latest" element={<Latest />} />
        <Route path="/article/:title" element={<Article />} />
        <Route path="/freeUser" element={<FreeUser />} />
        <Route path="/rooms" element={<ViewRooms />} />
        <Route path="/room/:id" element={<RoomPage />} />


        <Route path="/test" element={<Test />} />
        <Route path="/testlogin" element={<TestLogin />} />

    </Route>
    </Routes>
  );
}

export default App
