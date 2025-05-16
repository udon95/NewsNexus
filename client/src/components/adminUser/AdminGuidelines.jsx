import React, { useState, useEffect } from "react";
import supabase from "../../api/supabaseClient";

const AdminGuidelines = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchGuidelines = async () => {
      const { data, error } = await supabase
        .from("guideline")
        .select("text")
        .eq("displayed", true)
        .maybeSingle();

      if (data) setText(data.text);
      if (error) console.error("Error loading guidelines:", error);
    };

    fetchGuidelines();
  }, []);

  const handleClick = async () => {
    // Set all previous guidelines to not displayed
    await supabase
      .from("guideline")
      .update({ displayed: false })
      .eq("displayed", true);

    // Get any existing guideline to preserve effective_date
    const { data: existing } = await supabase
      .from("guideline")
      .select("effective_date")
      .is("displayed", true)
      .maybeSingle();

    const now = new Date().toISOString();

    const { error } = await supabase.from("guideline").upsert([
      {
        guidelineid: crypto.randomUUID(),
        text: text,
        displayed: true,
        last_updated: now,
        effective_date: existing?.effective_date || now,
      },
    ]);

    if (error) {
      alert("Error updating guidelines.");
      console.error(error);
    } else {
      alert("Guidelines updated successfully!");
    }
  };

  return (
    // <div className="w-full h-full p-10 font-grotesk">
    <div className="w-full min-h-screen py-10 px-4 font-grotesk bg-indigo-50 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold mb-4">Manage Guidelines:</h1>

        <div className="relative w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[550px] p-4 rounded-lg shadow bg-white border border-gray-300 text-base whitespace-pre-wrap resize-none"
            placeholder="Paste your formatted guidelines here..."
          />
          {/* Add padding-bottom here if needed to give spacing below textarea */}
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={handleClick}
            className="bg-[#3F414C] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGuidelines;
