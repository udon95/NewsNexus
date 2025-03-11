import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topic from "./topic.jsx";
import supabase from "../api/supabaseClient.js";

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
  const [selectedInterests, setSelectedInterests] = useState([]); // ✅ Store selected topics
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  // ✅ Validate user input
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};

      if (!userData.username.trim())
        newErrors.username = "Username is required.";
      
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
      setIsValid(Object.keys(newErrors).length === 0);
    };

    validateForm();
  }, [userData]);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle selecting/deselecting interests
  const handleInterestSelect = (interest) => {
    setSelectedInterests(
      (prevInterests) =>
        prevInterests.includes(interest)
          ? prevInterests.filter((item) => item !== interest) // Remove if already selected
          : [...prevInterests, interest] // Add if not selected
    );
  };

  // ✅ Proceed to Step 2 (Topics Selection)
  const handleNext = () => {
    if (isValid) {
      setStep(2);
    }
  };

  // ✅ Submit Data to Supabase
  const handleSubmit = async () => {
    try {
      // ✅ Step 1: Register User in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        setErrors({ form: error.message });
        return;
      }

      if (!data?.user) {
        setErrors({ form: "Error creating user. Please try again." });
        return;
      }

      const user = data.user;
      const authId = user.id;

      // ✅ Step 2: Insert into `users` table
      const { data: userInsert, error: userError } = await supabase
        .from("users")
        .insert([
          {
            auth_id: authId, // ✅ Correctly link to Supabase Auth
            email: userData.email,
            username: userData.username,
            password: userData.password, // This should be hashed before storing
            status: "Pending",
          },
        ])
        .select("userid")
        .single();

      if (userError) {
        setErrors({ form: `Users Table Error: ${userError.message}` });
        return;
      }
      const newUserId = userInsert.userid; // ✅ Get generated `userid`

      // ✅ Step 3: Insert into `profile` table
      const { error: profileError } = await supabase.from("profile").insert([
        {
          uuserid: newUserId,
          dob: userData.dob,
          gender: userData.gender,
        },
      ]);

      if (profileError) {
        setErrors({ form: `Profile Table Error: ${profileError.message}` });
        return;
      }

      // ✅ Step 4: Insert into `usertype` table
      const { error: userTypeError } = await supabase
        .from("usertype")
        .insert([{ userid: newUserId, usertype: "Free" }]);

      if (userTypeError) {
        setErrors({ form: `UserType Table Error: ${userTypeError.message}` });
        return;
      }

      // ✅ Step 5: Insert Interests into `topicinterest` table
      for (const interest of selectedInterests) {
        await supabase
          .from("topicinterest")
          .insert([{ userid: newUserId, interesttype: interest }]);
      }

      alert("Registration complete! Check your email for verification.");
      navigate("/");
    } catch (err) {
      setErrors({ form: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <main className="flex flex-col flex-grow items-center justify-center w-full px-4 sm:px-6">
        {step === 1 ? (
          <div className="flex flex-col p-4 max-w-xl w-full">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-10">
              Register
            </h2>

            {/* Step 1: User Information */}
            <div className="space-y-4">
              <div>
                <label className="text-xl font-normal">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="text-xl font-normal">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xl font-normal">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xl font-normal">Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="text-xl font-normal">Date of Birth:</label>
                <input
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                />
                {errors.dob && <p className="text-red-500">{errors.dob}</p>}
              </div>

              <div>
                <label className="text-xl font-normal">Gender:</label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-100"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer Not to Say">Prefer Not to Say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500">{errors.gender}</p>
                )}
              </div>

              <button
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
        ) : (
          <Topic
            selectedInterests={selectedInterests}
            handleInterestSelect={handleInterestSelect} // ✅ Pass function
            handleSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default Register;
