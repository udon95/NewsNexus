import { useEffect, useState } from "react";
import supabase from "../../api/supabaseClient";
import useAuthHook from "../hooks/useAuth";

const PremiumApplyExpert = () => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [requirements, setRequirements] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useAuthHook();

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("topicid, name");
      if (!error) setTopics(data);
    };
    fetchTopics();
  }, []);

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (type === "cv") {
      if (file.type === "application/pdf") {
        setCvFile(file);
      } else {
        alert("Please upload a PDF file for your CV.");
      }
    } else {
      setDocFile(file);
    }
  };

  const handleApply = async () => {
    setErrorMessage("");

    if (!selectedTopicId || !cvFile || !user) {
      setErrorMessage("Please complete all required fields and upload a CV.");
      return;
    }

    const { data: articles, error: articleError } = await supabase
      .from("articles")
      .select("accuracy_score")
      .eq("userid", user.userid)
      .eq("topicid", selectedTopicId)
      .eq("status", "Posted");

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
        `You need at least 10 posted articles in this category with ≥75% accuracy. You have ${totalArticles} articles, average ${avgAccuracy.toFixed(
          2
        )}%.`
      );
      return;
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("expert-cvs")
      .upload(`user-${user.userid}/${cvFile.name}`, cvFile, {
        cacheControl: "3600",
        upsert: false,
      });

    const cvUrl = uploadData
      ? supabase.storage.from("expert-cvs").getPublicUrl(uploadData.path).publicUrl
      : "";

    const { error } = await supabase.from("expert_application").insert({
      username: user.username,
      userid: user.userid,
      topicid: selectedTopicId,
      description: requirements,
      cv: cvUrl,
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

        <label className="block mt-4 text-lg font-semibold">LinkedIn Profile:</label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        <label className="block mt-6 text-lg font-semibold">Requirements:</label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows="6"
          className="w-full p-4 mt-2 text-lg border rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-500"
          placeholder={"1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n6. ..."}
        ></textarea>

        <label className="block mt-6 text-lg font-semibold">Upload CV (PDF only):</label>
        <div className="w-full mt-2 p-6 border rounded-xl bg-gray-100 flex items-center justify-center relative cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, "cv")}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <span className="text-lg text-gray-500">
            {cvFile ? cvFile.name : "↑ Upload CV (PDF)"}
          </span>
        </div>

        <label className="block mt-6 text-lg font-semibold">Additional Document Upload:</label>
        <div className="w-full mt-2 p-6 border rounded-xl bg-gray-100 flex items-center justify-center relative cursor-pointer">
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, "doc")}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <span className="text-lg text-gray-500">
            {docFile ? docFile.name : "↑ Upload File"}
          </span>
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
