import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import Topic from "./topic.jsx";
import supabase from "../api/supabaseClient.js";
import PasswordInput from "../components/showPW.jsx";

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

  const [categories, setCategories] = useState([]);
  const [dropdownValues, setDropdownValues] = useState(Array(6).fill(""));

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
      if (!userData.dob) {
        newErrors.dob = "Date of birth is required.";
      } else {
        // Check that DOB is not in the future
        if (new Date(userData.dob) > new Date()) {
          newErrors.dob = "DOB cannot be in the future.";
        } else {
          // Calculate age from dob
          const birthDate = new Date(userData.dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          // Check if age is less than 16
          if (age < 16) {
            newErrors.dob = "You must be at least 16 years old to register.";
          }
        }
      }
      if (!userData.gender) newErrors.gender = "Please select a gender.";

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0); // If no errors, form is valid
    };

    validateForm();
  }, [userData]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const selected = dropdownValues.filter((val) => val !== "");
    setSelectedTopics(selected);
  }, [dropdownValues]);

  const handleInputChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDropdownChange = (index, e) => {
    const newValues = [...dropdownValues];
    newValues[index] = e.target.value;
    setDropdownValues(newValues);
  };

  // const handleTopicsSelect = (topics) => {
  //   setSelectedTopics(
  //     (prevTopics) =>
  //       prevTopics.includes(topics)
  //         ? prevTopics.filter((item) => item !== topics) // Remove if already selected
  //         : [...prevTopics, topics] // Add if not selected
  //   );
  // };

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
      const response = await fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/ /auth/register", {
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
                    value={userData.username}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg"
                    placeholder="Enter your name"
                  />
                  {errors.username && (
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {errors.username}
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
                  <PasswordInput
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
                  <PasswordInput
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
                    className="px-6 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg text-white transition ${
                      isValid
                        ? "bg-[#3F414C] hover:bg-[#3F414C] cursor-pointer"
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
          // <Topic
          //   selectedTopics={selectedTopics}
          //   handleTopicSelect={handleTopicsSelect} //  Pass function
          //   handleSubmit={handleFinalSubmit}
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Select Your Interests</h2>
            <h2 className="text-xl mb-4">
              (At least 1, max. 6. Starting from Most Interested)
            </h2>
            {/* <div className="grid grid-cols-1 gap-4"> */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-row mb-4">
                  <label className="mt-1 mr-2 font-grotesk text-2xl">
                    {index + 1}.{" "}
                  </label>
                  <select
                    value={dropdownValues[index]}
                    onChange={(e) => handleDropdownChange(index, e)}
                    className="p-2 border rounded-lg"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            {/* </div> */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(selectedTopics)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Submit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Register;
