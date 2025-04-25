import { useEffect, useState } from "react";
import supabase from "../../api/supabaseClient";
import useAuthHook from "../../hooks/useAuth";

const PremiumApplyExpert = () => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [cv, setCv] = useState(""); // ✅ NEW
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useAuthHook();

  const staticRequirements = `Applicants must have:
- At least 10 published articles in the selected category
- An average accuracy score of 75% or above`;

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");
      if (!error) setTopics(data);
    };
    fetchTopics();
  }, []);

  const handleApply = async () => {
    setErrorMessage("");

    if (!selectedTopicId || !user || !position) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("userid")
      .eq("username", user.username)
      .single();

    if (userError || !userRow) {
      setErrorMessage("User not found in users table.");
      return;
    }

    const { data: existing } = await supabase
      .from("expert_application")
      .select("username")
      .eq("username", user.username)
      .eq("topicid", selectedTopicId)
      .single();

    if (existing) {
      setErrorMessage("You’ve already submitted an application for this topic.");
      return;
    }

    const { data: articles, error: articleError } = await supabase
      .from("articles")
      .select("accuracy_score")
      .eq("userid", userRow.userid)
      .eq("topicid", selectedTopicId)
      .eq("status", "Published");

    if (articleError) {
      setErrorMessage("Error checking your article history.");
      return;
    }

    const totalArticles = articles.length;
    const avgAccuracy =
      totalArticles > 0
        ? articles.reduce((sum, a) => sum + (a.accuracy_score || 0), 0) /
          totalArticles
        : 0;

    if (totalArticles < 10 || avgAccuracy < 75) {
      setErrorMessage(
        `You need at least 10 published articles in this category with ≥75% accuracy. You have ${totalArticles}, avg ${avgAccuracy.toFixed(2)}%.`
      );
      return;
    }

    const { error } = await supabase.from("expert_application").insert({
      username: user.username,
      userid: userRow.userid,
      topicid: selectedTopicId,
      description: position,
      cv: cv, // ✅ NEW
      requirements: staticRequirements,
      status: "Pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      setErrorMessage("Failed to submit application: " + error.message);
    } else {
      alert("Application submitted successfully!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-grotesk p-10">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Expert User Application</h2>

        <label className="block text-lg font-semibold">Full Name:</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        <label className="block mt-4 text-lg font-semibold">Professional Position:</label>
        <input
          type="text"
          placeholder="Your professional position (Industry)"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        <label className="block mt-4 text-lg font-semibold">Which Category:</label>
        <select
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
          className="w-full p-4 mt-2 text-lg bg-gray-200 rounded-xl outline-none focus:bg-white"
        >
          <option value="" disabled>Select a category</option>
          {topics.map((topic) => (
            <option key={topic.topicid} value={topic.topicid}>
              {topic.name}
            </option>
          ))}
        </select>

        {/* ✅ NEW CV FIELD */}
        <label className="block mt-4 text-lg font-semibold">CV / Experience Summary:</label>
        <textarea
          placeholder="Briefly describe your qualifications or experience"
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          className="w-full h-40 p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white resize-none"
        />

        <label className="block mt-6 text-lg font-semibold">Requirements:</label>
        <div className="w-full mt-2 text-gray-800 text-base p-4 bg-gray-100 rounded-xl border whitespace-pre-wrap">
          {staticRequirements}
        </div>

        {errorMessage && (
          <div className="mt-4 text-red-600 text-sm font-semibold">{errorMessage}</div>
        )}

        <button
          onClick={handleApply}
          className="w-full mt-6 py-4 text-lg text-white bg-gray-700 rounded-xl hover:bg-gray-900"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default PremiumApplyExpert;
