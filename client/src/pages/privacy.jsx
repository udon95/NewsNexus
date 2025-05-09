import React, { useState, useEffect } from "react";
import "../index.css";
import Navbar from "../components/navbar.jsx";
import supabase from "../api/supabaseClient";

function PrivacyPolicy() {
  const [policy, setPolicy] = useState("");

  useEffect(() => {
    const fetchPrivacy = async () => {
      const { data, error } = await supabase
        .from("privacy")
        .select("text")
        .eq("displayed", true)
        .maybeSingle();

      if (data?.text) {
        setPolicy(data.text);
      }

      if (error) console.error("Error fetching privacy policy:", error);
    };

    fetchPrivacy();
  }, []);

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col items-start w-full px-4 sm:px-8 py-10 mx-auto max-w-5xl">
        {/* Title */}
        <h1 className="font-grotesk text-4xl sm:text-5xl font-semibold text-black text-left">
          NewsNexus Privacy Policy
        </h1>

        {/* Policy Content */}
        <div
  className="whitespace-pre-wrap text-base sm:text-lg text-gray-800 leading-relaxed w-full"
  dangerouslySetInnerHTML={{ __html: policy }}
></div>

      </main>
    </div>
  );
}

export default PrivacyPolicy;
