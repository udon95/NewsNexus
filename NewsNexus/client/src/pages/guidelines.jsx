import React, { useState, useEffect } from "react";
import "../index.css";
import Navbar from "../components/navBar.jsx";
import supabase from "../api/supabaseClient";

function Guidelines() {
  const [guidelines, setGuidelines] = useState("");
  const [dates, setDates] = useState({ effective: "", updated: "" });

  useEffect(() => {
    const fetchGuidelines = async () => {
      const { data, error } = await supabase
        .from("guideline")
        .select("text, effective_date, last_updated")
        .eq("displayed", true)
        .maybeSingle();

      if (data?.text) {
        setGuidelines(data.text);
        setDates({
          effective: new Date(data.effective_date).toLocaleDateString(),
          updated: new Date(data.last_updated).toLocaleDateString(),
        });
      }

      if (error) console.error("Error fetching guidelines:", error);
    };

    fetchGuidelines();
  }, []);

  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col items-start w-full px-4 sm:px-8 py-10 mx-auto max-w-5xl">
        <h1 className="font-grotesk text-4xl sm:text-5xl font-semibold text-black text-left">
          NewsNexus Platform Guidelines:
        </h1>

        <p className="mt-3 text-base text-gray-700">
          <strong>Effective Date:</strong> {dates.effective || "-"} <br />
          <strong>Last Updated:</strong> {dates.updated || "-"}
        </p>

        <div
          className="mt-6 text-base sm:text-lg text-gray-800 leading-relaxed w-full whitespace-pre-wrap"
        >
          {guidelines}
        </div>
      </main>
    </div>
  );
}

export default Guidelines;
