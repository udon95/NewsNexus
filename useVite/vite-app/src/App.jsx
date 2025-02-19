import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import Layout from  "./Layout.jsx";
import Test from "./pages/test.jsx"
import Subscription from "./pages/subscription.jsx"

import TestLogin from "./pages/testlogin.jsx";
import Profile from "./pages/profile.jsx";
import supabase from "./api/supabaseClient.js";
import "./index.css";

function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          const userId = session.user.id;

          // ✅ Update user status to "Free" after email verification
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

        <Route path="/test" element={<Test />} />
        <Route path="/testlogin" element={<TestLogin />} />
        <Route path="/profile" element={<Profile />} />

    </Route>
    </Routes>
  );
}

export default App
