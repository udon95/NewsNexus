import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navBar.jsx";
import Topic from "./topic.jsx";
import supabase from "../api/supabaseClient.js";

import "../index.css";

function Register() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isValid, setIsValid] = useState(false); // Track form validation state
  const navigate = useNavigate();

  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      if (!userData.username.trim()) newErrors.username = "Name is required.";
      if (!userData.email.trim() || !/\S+@\S+\.\S+/.test(userData.email))
        newErrors.email = "Valid email is required.";
      if (!userData.password.trim() || userData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters.";
      if (userData.password !== userData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
      if (!userData.dob) newErrors.dob = "Date of birth is required.";
      if (new Date(userData.dob) > new Date())
        newErrors.dob = "DOB cannot be in the future.";
      if (!userData.gender) newErrors.gender = "Please select a gender.";

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0); // If no errors, form is valid
    };

    validateForm();
  }, [userData]);

  const handleInputChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTopicsSelect = (topics) => {
    setSelectedTopics(
      (prevTopics) =>
        prevTopics.includes(topics)
          ? prevTopics.filter((item) => item !== topics) // Remove if already selected
          : [...prevTopics, topics] // Add if not selected
    );
  };

  const handleNext = () => {
    if (isValid) {
      setStep(2);
    }
  };

  const handleFinalSubmit = async (selectedTopics) => {
    // Check if userData & topics are valid
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    try {
      // Send everything (personal info + topics) to the server
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          topics: selectedTopics,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert("Registration complete! Check your email for verification.");
      navigate("/login");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="w-full min-h-screen min-w-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4 sm:px-6">
        {step === 1 ? (
          <div className="flex flex-col p-4 max-w-xl w-full">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-10 mt-0 font-grotesk">
              Register
            </h2>

            {/* Step 1: User Information */}
            <form className="space-y-6 sm:space-y-5">
              <div>
                <div className="flex items-center mb-6 relative group">
                  <label
                    htmlFor="username"
                    className="text-2xl sm:text-2xl font-normal text-black w-30"
                  >
                    Username:
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Password:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="Enter a password"
                  />
                  {errors.password && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.password}
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Re-enter password:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="Re-Enter password"
                  />
                  {errors.confirmPassword && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={userData.dob}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="dd-mm-yyyy"
                  />
                  {errors.dob && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.dob}
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Gender:
                  </label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>

                  {errors.gender && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.gender}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg text-white transition ${
                      isValid
                        ? "bg-[#3F414C] hover:bg-[#3F414C]"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isValid}
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <Topic
            selectedTopics={selectedTopics}
            handleTopicSelect={handleTopicsSelect} //  Pass function
            handleSubmit={handleFinalSubmit}

            // handleInterestSelect={(interest) =>
            //   setSelectedInterests((prev) =>
            //     prev.includes(interest)
            //       ? prev.filter((i) => i !== interest)
            //       : [...prev, interest]
            //   )
            // }
            // handleSubmit={() => {
            //   console.log("User Data:", userData);
            //   console.log("Selected Interests:", selectedInterests);
            //   alert("A verification email has been sent to your email.");
            //   navigate("/");
            // }}
          />
        )}
      </main>
    </div>
  );
}

export default Register;
