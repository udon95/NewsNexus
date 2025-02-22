import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from  "./Layout.jsx";
import supabase from "./api/supabaseClient.js";
import FreeUserProfileManageMyArticles from "./pages/FreeUserProfileManageMyArticles";
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
      <Route path="/" element={<FreeUserProfileManageMyArticles/>}/>
    </Route>
    </Routes>
  );
}

export default App
