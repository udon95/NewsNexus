import { useEffect, useState } from "react";
import useAuthHook from "../../hooks/useAuth";
import PasswordInput from "../showPW";
import api from "../../api/axios";
import supabase from "../../api/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FreeManageProfile = () => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError, showError] = useState("");
  const { interests, profile: authProfile, user } = useAuthHook();
  const [passwordError, setPasswordError] = useState("");
  const [dobError, setDobError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editNewPasswordConfirm, setEditNewPasswordConfirm] = useState("");

  const [categories, setCategories] = useState([]);
  const [dropdownValues, setDropdownValues] = useState(Array(6).fill(""));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const data = JSON.parse(storedUser);

          setUserDetails(data.user);

          //  Ensure interests are always an array before setting state
          const formattedInterests = Array.isArray(data.interests)
            ? data.interests
            : data.interests.split(", ").map((topic) => topic.trim());

          setSelectedTopics(formattedInterests); //  Pre-select topics from stored interests
          setDropdownValues((prev) => {
            const updated = [...prev];
            for (let i = 0; i < formattedInterests.length && i < 6; i++) {
              updated[i] = formattedInterests[i];
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err.message);
        setError(err.message);
      }
    };

    fetchUserProfile();
  }, []);

  // load all categories/topics
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

  // set dropdown selection values
  useEffect(() => {
    const selected = dropdownValues.filter((val) => val !== "");
    setSelectedTopics(selected);
  }, [dropdownValues]);

  // handle dropdown selection
  const handleDropdownChange = (index, e) => {
    const newValue = e.target.value;
    const alreadySelected = dropdownValues.includes(newValue);

    if (newValue && alreadySelected) {
      alert("You’ve already selected this topic.");
      return;
    }

    const newValues = [...dropdownValues];
    newValues[index] = newValue;
    setDropdownValues(newValues);
  };

  useEffect(() => {
    if (editDate) {
      const dobDate = new Date(editDate);
      const today = new Date();
      if (dobDate > today) {
        setDobError("Date of Birth cannot be later than today.");
      } else {
        // Calculate the age
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dobDate.getDate())
        ) {
          age--;
        }
        // Set error if age is less than 16
        if (age < 16) {
          setDobError("You must be at least 16 years old.");
        } else {
          setDobError("");
        }
      }
    } else {
      setDobError("");
    }
  }, [editDate]);

  const isValidDOB = (dob) => {
    const dobDate = new Date(dob);
    const today = new Date();
    return dobDate <= today;
  };

  const updateProfile = async () => {
    if (!isValidDOB(editDate)) {
      alert("Date of Birth cannot be later than today.", dobError);
      return;
    }

    try {
      const payload = {
        userId: userDetails.userid,
        username: editUsername,
        email: editEmail,
        dob: editDate,
        gender: editGender,
      };

      const response = await api.post("/auth/update-profile", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.message) {
        alert("Profile updated successfully!");
        const storedUser = JSON.parse(localStorage.getItem("userProfile"));
        if (storedUser) {
          storedUser.user.username = editUsername;
          storedUser.user.email = editEmail;
          storedUser.profile = {
            ...storedUser.profile,
            dob: editDate,
            gender: editGender,
          };
          localStorage.setItem("userProfile", JSON.stringify(storedUser));
          sessionStorage.setItem("userProfile", JSON.stringify(storedUser));
        }
      }
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data?.error || error.message
      );
      setError(error.response?.data?.error || error.message);
    }
  };

  const updatePassword = async () => {
    if (!editOldPassword || !editNewPassword || !editNewPasswordConfirm) {
      alert("Please fill in all password fields.");
      return;
    }
    if (oldPasswordError) {
      alert(oldPasswordError);
      return;
    }
    if (editNewPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }

    if (editNewPassword !== editNewPasswordConfirm) {
      alert("New password and confirmation do not match.");
      return;
    }
    try {
      const payload = {
        userId: userDetails.userid,
        oldPassword: editOldPassword,
        newPassword: editNewPassword,
        newPasswordConfirm: editNewPasswordConfirm,
      };

      const response = await api.post("/auth/update-password", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.message) {
        alert("Password updated successfully!");
        setEditOldPassword("");
        setEditNewPassword("");
        setEditNewPasswordConfirm("");

        const updatedUser = response.data.updatedUser;
        if (updatedUser) {
          const storedUser = JSON.parse(localStorage.getItem("userProfile"));
          if (storedUser) {
            storedUser.user.password = updatedUser.password;
            localStorage.setItem("userProfile", JSON.stringify(storedUser));
            sessionStorage.setItem("userProfile", JSON.stringify(storedUser));
          }
        }
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("An error occurred while updating the password.");
    }
  };

  const updateInterests = async () => {
    try {
      const response = await api.post(
        "/auth/update-interests",
        {
          userId: userDetails.userid,
          interests: selectedTopics.join(", "),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.data.message) {
        throw new Error("Failed to update interests");
      }
      alert("Interests updated successfully!");

      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      if (storedUser) {
        storedUser.interests = selectedTopics.join(", ");
        localStorage.setItem("userProfile", JSON.stringify(storedUser));
        sessionStorage.setItem("userProfile", JSON.stringify(storedUser));
      }
    } catch (error) {
      console.error("Error updating interests:", error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (editNewPassword && editNewPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
    } else if (editNewPassword !== editNewPasswordConfirm) {
      setPasswordError("New password and confirmation do not match.");
    } else {
      setPasswordError("");
    }
  }, [editNewPassword, editNewPasswordConfirm]);

  useEffect(() => {
    // Only check if there's an input
    if (!editOldPassword || !userDetails) {
      setOldPasswordError("");
      return;
    }

    // Set a timer to debounce the API call (e.g., 500ms)
    const timer = setTimeout(() => {
      api
        .post("/auth/verify-old-password", {
          userId: userDetails.userid,
          oldPassword: editOldPassword,
        })
        .then((res) => {
          if (!res.data.valid) {
            setOldPasswordError("Old password is incorrect.");
          } else {
            setOldPasswordError("");
          }
        })
        .catch((err) => {
          console.error("Error verifying old password:", err.message);
          setOldPasswordError("Error verifying password.");
        });
    }, 500);

    // Cleanup timer on effect cleanup
    return () => clearTimeout(timer);
  }, [editOldPassword, userDetails]);

  useEffect(() => {
    if (userDetails) {
      setEditUsername(userDetails.username || "");
      setEditEmail(userDetails.email || "");
      setEditDate(authProfile?.dob || "");
      setEditGender(authProfile?.gender || "");
    }
  }, [userDetails, authProfile]);

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-hidden">
      <div className="flex-grow w-full flex min-h-full overflow-hidden">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              {/* Profile Details */}
              <h3 className="text-2xl font-grotesk font-bold mb-1">
                Profile Particulars:
              </h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3">
                Name:
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Username"
                />
                Email:
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="E-mail"
                />
                Date:
                <div className="flex-grow relative group">
                  <DatePicker
                    selected={editDate ? new Date(editDate) : null}
                    onChange={(date) => {
                      const isoString = date?.toISOString().split("T")[0]; // 'yyyy-mm-dd'
                      setEditDate(isoString);
                    }}
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
                <div>
                  Gender:
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-2 border rounded-lg mt-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Prefer Not To Say</option>
                  </select>
                </div>
                <button
                  onClick={updateProfile}
                  className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg mt-2 "
                >
                  Update
                </button>
              </div>

              {/* Password Change */}
              <h3 className="text-2xl font-bold  font-grotesk mb-1 mt-6">
                Manage Password:
              </h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3">
                <PasswordInput
                  name="password"
                  value={editOldPassword}
                  onChange={(e) => setEditOldPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Old Password"
                />
                {oldPasswordError && (
                  <p className="text-red-600 text-sm mt-1">
                    {oldPasswordError}
                  </p>
                )}
                <PasswordInput
                  name="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="New Password "
                />
                <PasswordInput
                  name="password"
                  value={editNewPasswordConfirm}
                  onChange={(e) => setEditNewPasswordConfirm(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="Confirm New Password"
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2">{passwordError}</p>
                )}
                <button
                  onClick={updatePassword}
                  className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg mt-2"
                >
                  Update
                </button>
              </div>

              {/* Topic Interests */}
              <h3 className="text-2xl font-bold font-grotesk mb-1 mt-6">
                Interest Selection (Max 6):
              </h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3 mb-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-row mb-4">
                    <label className="mt-1 mr-2 font-grotesk text-2xl">
                      {index + 1}.{" "}
                    </label>
                    <select
                      value={dropdownValues[index]}
                      onChange={(e) => handleDropdownChange(index, e)}
                      className="p-1 border rounded-lg font-grotesk"
                    >
                      <option value="" classname="font-grotesk">
                        Select a category
                      </option>
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
                <button
                  onClick={updateInterests}
                  className="bg-[#3f414c] text-[white] cursor-pointer text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl border-[none]"
                >
                  Update Interests
                </button>
              </div>

              {showError && (
                <p className="text-red-600">
                  You can only select up to 6 topics.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeManageProfile;
