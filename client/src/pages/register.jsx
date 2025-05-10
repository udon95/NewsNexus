import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import supabase from "../api/supabaseClient.js";
import PasswordInput from "../components/showPW.jsx";
import "../index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Guidelines from "./guidelines.jsx";
import Privacy from "./privacy.jsx";

function Register() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: null,
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isValid, setIsValid] = useState(false); // Track form validation state
  const navigate = useNavigate();
  const [maxDate, setMaxDate] = useState("");

  const [categories, setCategories] = useState([]);
  const [dropdownValues, setDropdownValues] = useState(Array(6).fill(""));

  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

      if (!userData.dob) {
        newErrors.dob = "Date of birth is required.";
      } else {
        const today = new Date();
        const birthDate = new Date(userData.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (
          age < 16 ||
          (age === 16 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
        ) {
          newErrors.dob = "You must be at least 16 years old to register.";
        }
      }

      if (!userData.gender) newErrors.gender = "Please select a gender.";

      if (!acceptedGuidelines)
        newErrors.acceptedGuidelines =
          "You must agree to the platform guidelines.";
      if (!acceptedPrivacy)
        newErrors.acceptedPrivacy = "You must agree to the privacy policy.";

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0); // If no errors, form is valid
    };

    validateForm();
  }, [userData, acceptedGuidelines, acceptedPrivacy]);

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

  useEffect(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 16); // subtract 16 years

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${yyyy}-${mm}-${dd}`);
  }, []);

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
    if (selectedTopics.length !== 6) {
      alert("Please select at 6 topic.");
      return;
    }

    try {
      // Send everything (personal info + topics) to the server
      const response = await fetch(
        "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            topics: selectedTopics,
          }),
        }
      );

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
            <p className="text-sm text-gray-600 mb-4">
              You are registering as a <strong>Free User</strong>.
            </p>

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
                    name="password"
                    value={userData.password}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
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
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
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
                  <div className="flex-grow relative group">
                    <DatePicker
                      selected={userData.dob}
                      onChange={(date) =>
                        setUserData((prev) => ({ ...prev, dob: date }))
                      }
                      dateFormat="dd-MM-yyyy"
                      maxDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 16)
                        )
                      }
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      placeholderText="Select your date of birth (Above 16 years old)"
                      className="w-full p-3 rounded-lg bg-[#F3F3F3] focus:ring-2 focus:ring-blue-500 shadow-lg font-grotesk"
                      wrapperClassName="w-full"
                    />
                    {errors.dob && (
                      <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {errors.dob}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center mb-6 relative group">
                  <label className="text-2xl sm:text-2xl font-normal text-black w-30">
                    Gender:
                  </label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-lg bg-[#F3F3F3] focus:ring-2  shadow-lg font-grotesk"
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
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="guidelines"
                      checked={acceptedGuidelines}
                      onChange={() => setAcceptedGuidelines((v) => !v)}
                      className="mr-2"
                    />
                    <label htmlFor="guidelines" className="text-base">
                      I agree to the&nbsp;
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowGuidelinesModal(true)}
                      className="underline text-blue-500"
                    >
                      Platform Guidelines
                    </button>
                    .
                  </div>
                  {errors.acceptedGuidelines && (
                    <p className="text-red-500 text-sm">
                      {errors.acceptedGuidelines}
                    </p>
                  )}

                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={acceptedPrivacy}
                      onChange={() => setAcceptedPrivacy((v) => !v)}
                      className="mr-2"
                    />
                    <label htmlFor="privacy" className="text-base">
                      I agree to the&nbsp;
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="underline text-blue-500"
                    >
                      Privacy Policy
                    </button>
                    .
                  </div>
                  {errors.acceptedPrivacy && (
                    <p className="text-red-500 text-sm">
                      {errors.acceptedPrivacy}
                    </p>
                  )}
                </div>

                {showGuidelinesModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white w-11/12 max-w-2xl p-6 rounded-lg relative overflow-y-auto max-h-[90vh]">
                      <button
                        onClick={() => setShowGuidelinesModal(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        aria-label="Close guidelines"
                      >
                        ✕
                      </button>
                      <h3 className="text-xl font-semibold mb-4">
                        Platform Guidelines
                      </h3>
                      <Guidelines />
                    </div>
                  </div>
                )}

                {showPrivacyModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white w-11/12 max-w-2xl p-6 rounded-lg relative overflow-y-auto max-h-[90vh]">
                      <button
                        onClick={() => setShowPrivacyModal(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        aria-label="Close privacy policy"
                      >
                        ✕
                      </button>
                      <h3 className="text-xl font-semibold mb-4">
                        Privacy Policy
                      </h3>
                      <PrivacyPolicy />
                    </div>
                  </div>
                )}

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
          <div className="flex flex-col items-center font-grotesk">
            <h2 className="text-2xl font-bold mb-4">Select Your Interests</h2>
            <h2 className="text-xl mb-4">
              (Choose 6. Starting from Most Interested)
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
                  {categories
                    .filter(
                      (cat) =>
                        !dropdownValues.includes(cat.name) ||
                        cat.name === dropdownValues[index]
                    )
                    .map((cat) => (
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
              className="mt-4 px-4 py-2 bg-[#3F414C] hover:bg-[#3F414C] cursor-pointer text-white rounded-lg"
            >
              Submit
            </button>
          </div>
        )}

        {showGuidelinesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white w-11/12 max-w-2xl p-6 rounded-lg relative">
              <button
                onClick={() => setShowGuidelinesModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold mb-4">
                Platform Guidelines
              </h3>
              <div className="overflow-y-auto max-h-[70vh]">
                {/* TODO: paste or fetch your guidelines HTML/text here */}
                <p>Your full platform guidelines content…</p>
              </div>
            </div>
          </div>
        )}

        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white w-11/12 max-w-2xl p-6 rounded-lg relative">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold mb-4">Privacy Policy</h3>
              <div className="overflow-y-auto max-h-[70vh]">
                {/* TODO: paste or fetch your privacy policy HTML/text here */}
                <p>Your full privacy policy content…</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Register;
