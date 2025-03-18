import { useState } from "react";

const PremiumApplyExpert = () => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [requirements, setRequirements] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-grotesk p-10">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Expert User Application</h2>

        {/* Full Name */}
        <label className="block text-lg font-semibold">Full Name:</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        {/* Position Input */}
        <label className="block mt-4 text-lg font-semibold">Professional Position:</label>
        <input
          type="text"
          placeholder="Your professional position (Industry)"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        {/* Category Selection */}
        <label className="block mt-4 text-lg font-semibold">Which Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-4 mt-2 text-lg bg-gray-200 rounded-xl outline-none focus:bg-white"
        >
          <option value="" disabled>Select a category</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Marketing">Marketing</option>
        </select>

        {/* LinkedIn Profile Link */}
        <label className="block mt-4 text-lg font-semibold">LinkedIn Profile:</label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className="w-full p-4 mt-2 text-lg text-gray-700 bg-gray-200 rounded-xl outline-none focus:bg-white"
        />

        {/* Requirements Section */}
        <label className="block mt-6 text-lg font-semibold">Requirements:</label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows="6"
          className="w-full p-4 mt-2 text-lg border rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-500"
          placeholder={"1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n6. ..."}
        ></textarea>

        {/* CV Upload (PDF only) */}
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

        {/* Document Upload Section */}
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

        {/* Apply Button */}
        <button className="w-full mt-6 py-4 text-lg text-white bg-gray-700 rounded-xl hover:bg-gray-900">
          Apply
        </button>
      </div>
    </div>
  );
};

export default PremiumApplyExpert;