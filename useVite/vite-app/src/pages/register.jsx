import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import Topic from "./topic.jsx"; 
import supabase from "../api/supabaseClient.js";
import "../index.css";

function Register() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isValid, setIsValid] = useState(false); // Track form validation state
  const navigate = useNavigate();

  // Fix: Validate dynamically whenever user types
  useEffect(() => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = "Name is required.";
    if (!userData.email.trim() || !/\S+@\S+\.\S+/.test(userData.email))
      newErrors.email = "Valid email is required.";
    if (!userData.password.trim() || userData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0); // If no errors, form is valid
  }, [userData]); // Runs every time `userData` changes

  const handleInputChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = () => {
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <div className="w-full min-h-screen min-w-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4 sm:px-6">
        {step === 1 ? (
          <div className="flex flex-col p-4 max-w-xl w-full">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-10 font-grotesk">
              Register
            </h2>

            {/* Step 1: User Information */}
            <div className="space-y-4">
              <div>
                <label className="text-xl font-normal text-black">
                  Username:
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xl font-normal text-black">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xl font-normal text-black">
                  Password:
                </label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-opacity-90"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className={`px-6 py-2 rounded-lg text-white transition ${
                    isValid
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isValid}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Topic
            selectedInterests={selectedInterests}
            handleInterestSelect={(interest) =>
              setSelectedInterests((prev) =>
                prev.includes(interest)
                  ? prev.filter((i) => i !== interest)
                  : [...prev, interest]
              )
            }
            handleSubmit={() => {
              console.log("User Data:", userData);
              console.log("Selected Interests:", selectedInterests);
              alert("A verification email has been sent to your email.");
              navigate("/");
            }}
          />
        )}
      </main>
    </div>
  );
}

export default Register;
