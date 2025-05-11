import { useEffect, useState } from "react";
import useAuthHook from "../../hooks/useAuth";
import api from "../../api/axios";
import PasswordInput from "../showPW";
import { HexColorPicker } from "react-colorful";
import supabase from "../../api/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PremManageProfile = () => {
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

  const [profileColor, setProfileColor] = useState("#ffffff");
  const [hexCode, setHexCode] = useState("#ffffff");

  const [categories, setCategories] = useState([]);
  const [dropdownValues, setDropdownValues] = useState(Array(6).fill(""));
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const fetchUserType = async () => {
      const { data: exp, error: expError } = await supabase
        .from("expert_application")
        .select("status")
        .eq("userid", userDetails?.userid)
        .single();

      if (expError) {
        console.error("Error fetching expert status", expError);
        return;
      }

      if (exp && exp.status === "approved") {
        setUserType("Premium Expert");
      } else {
        setUserType(userDetails?.usertype?.usertype || "Free");
      }
    };

    if (userDetails) {
      fetchUserType();
    }
  }, [userDetails]);

  //load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const data = JSON.parse(storedUser);

          setUserDetails(data.user);

          if (data.color) {
            setProfileColor(data.color);
            setHexCode(data.color);
          }

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

    const selectedCount = dropdownValues.filter((val) => val !== "").length;
    if (selectedCount >= 6 && newValue !== "" && !dropdownValues.includes("")) {
      alert("You can only select up to 6 interests.");
      return;
    }

    if (newValue && alreadySelected) {
      alert("You’ve already selected this topic.");
      return;
    }

    const newValues = [...dropdownValues];
    newValues[index] = newValue;
    setDropdownValues(newValues);
  };

  // check birthdate valid
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
    if (dobDate > today) return false;

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    return age >= 16;
  };

  // update profile
  const updateProfile = async () => {
    if (!isValidDOB(editDate)) {
      alert("Must be at least 16 years old", dobError);
      return;
    }

    try {
      const payload = {
        userId: userDetails.userid,
        username: editUsername,
        email: editEmail,
        dob: editDate,
        gender: editGender,
        color: profileColor,
      };

      const response = await api.put("/auth/update-profile", payload, {
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

          storedUser.color = profileColor; // save at top-level only

          localStorage.setItem("userProfile", JSON.stringify(storedUser));
          sessionStorage.setItem("userProfile", JSON.stringify(storedUser));

          const event = new Event("userProfileUpdated");
          window.dispatchEvent(event);
        }
        window.location.reload();
      }
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data?.error || error.message
      );
      setError(error.response?.data?.error || error.message);
    }
  };

  // update password
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

      const response = await api.put("/auth/update-password", payload, {
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

  // update interests
  const updateInterests = async () => {
    if (selectedTopics.length > 6) {
      alert("You can only select up to 6 interests.");
      return;
    }
    try {
      const response = await api.put(
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

  // check passwords
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

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const storedColor = parsed.color;
      if (storedColor) {
        setProfileColor(storedColor);
        setHexCode(storedColor);
      }
    }
  }, []);

  const handleColorChange = (color) => {
    setProfileColor(color);
    setHexCode(color);
  };

  const handleHexChange = (event) => {
    const value = event.target.value;
    setHexCode(value);
    if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
      // Basic hex validation (e.g., #ffffff)
      setHexCode(value);
      setProfileColor(value);
    }
  };
  //DEVI ADDED HER UI FIX HERE COMMENTED
//   return (
//   <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-8 text-black font-grotesk text-base">
//     {/* Profile Section */}
//     <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
//   <h3 className="text-xl font-bold mb-4">Profile Particulars</h3>

//   {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"> */}
//   <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
//     {/* Left: Color Picker */}
//     <div className="w-full">
//       <label className="block mb-2 text-sm font-medium">Profile Color</label>
//       <div className="max-w-[300px] w-full rounded-lg overflow-hidden">
//         {/* <HexColorPicker color={profileColor} onChange={handleColorChange} className="w-full" /> */}
//         <HexColorPicker
//           color={profileColor}
//           onChange={handleColorChange}
//           className="w-full rounded-lg"
//           style={{
//             aspectRatio: "auto",
//             height: "200px",
//             width:"100%",
//           }}
//         />

//         </div>
//         <div className="mt-4 max-w-[300px] w-full">
//           <label className="block mb-1 text-sm font-medium">Hex Code</label>
//           <input
//             type="text"
//             value={hexCode}
//             onChange={handleHexChange}
//             placeholder="#FFFFFF"
//             className="w-full p-2 border rounded-lg"
//           />
//         </div>
//       </div>

//     {/* Right: Profile Fields */}
//     <div className="flex-1 flex flex-col justify-between h-full">
//       <div className="grid grid-cols-1 gap-4 w-full">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Username</label>
//           <input
//             type="text"
//             value={editUsername}
//             onChange={(e) => setEditUsername(e.target.value)}
//             className="w-full p-2 border rounded-lg"
//             placeholder="Username"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm font-medium">Email</label>
//           <input
//             type="email"
//             value={editEmail}
//             onChange={(e) => setEditEmail(e.target.value)}
//             className="w-full p-2 border rounded-lg"
//             placeholder="E-mail"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm font-medium">Date of Birth</label>
//           <DatePicker
//             selected={editDate ? new Date(editDate) : null}
//             onChange={(date) => {
//               const isoString = date?.toISOString().split("T")[0];
//               setEditDate(isoString);
//             }}
//             dateFormat="dd-MM-yyyy"
//             maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
//             showMonthDropdown
//             showYearDropdown
//             dropdownMode="select"
//             scrollableYearDropdown
//             yearDropdownItemNumber={100}
//             placeholderText="Select your date of birth (Above 16 years old)"
//             className="w-full p-2 border rounded-lg"
//             wrapperClassName="w-full"
//             popperClassName="z-[50]"
//           />
//           {dobError && <p className="text-red-600 text-sm mt-1">{dobError}</p>}
//         </div>
//         <div>
//           <label className="block mb-1 text-sm font-medium w-full">Gender</label>
//           <select
//             value={editGender}
//             onChange={(e) => setEditGender(e.target.value)}
//             className="w-full p-2 border rounded-lg"
//           >
//             <option value="">Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Other">Prefer Not To Say</option>
//           </select>
//         </div>
//       </div>

//       <button
//         onClick={updateProfile}
//         className="bg-[#3f414c] hover:bg-[#2f313a] text-white text-sm font-medium px-5 py-2.5 rounded-xl mt-6 ml-auto w-fit"
//       >
//         Update Profile
//       </button>
//       </div>
//     </div>
//     </div>

//     {/* Password Section */}
//     <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
//       <h3 className="text-xl font-bold mb-4">Manage Password</h3>
//       <PasswordInput
//         name="password"
//         value={editOldPassword}
//         onChange={(e) => setEditOldPassword(e.target.value)}
//         className="w-full p-2 border rounded-lg mb-2"
//         placeholder="Old Password"
//       />
//       {oldPasswordError && (
//         <p className="text-red-600 text-sm mt-1">{oldPasswordError}</p>
//       )}
//       <PasswordInput
//         name="password"
//         value={editNewPassword}
//         onChange={(e) => setEditNewPassword(e.target.value)}
//         className="w-full p-2 border rounded-lg mb-2"
//         placeholder="New Password"
//       />
//       <PasswordInput
//         name="password"
//         value={editNewPasswordConfirm}
//         onChange={(e) => setEditNewPasswordConfirm(e.target.value)}
//         className="w-full p-2 border rounded-lg mb-2"
//         placeholder="Confirm New Password"
//       />
//       {passwordError && (
//         <p className="text-red-600 text-sm mt-1">{passwordError}</p>
//       )}
//       <button
//         onClick={updatePassword}
//         className="bg-[#3f414c] hover:bg-[#2f313a] text-white text-sm font-medium px-5 py-2.5 rounded-xl mt-4 ml-auto block"
//       >
//         Update Password
//       </button>
//     </div>

//     {/* Interests Section */}
//     <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
//       <h3 className="text-xl font-bold mb-4">Interest Selection (Max 6)</h3>

//       <div className="flex flex-wrap gap-2 mb-4">
//         {selectedTopics.map((topic, i) => (
//           <span key={i} className="bg-gray-200 text-sm px-3 py-1 rounded-full">
//             {topic}
//           </span>
//         ))}
//       </div>

//       {Array.from({ length: 6 }).map((_, index) => (
//         <div key={index} className="flex items-center gap-3 mb-4">
//           <label className="w-6 text-sm font-medium">{index + 1}.</label>
//           <select
//             value={dropdownValues[index]}
//             onChange={(e) => handleDropdownChange(index, e)}
//             className="w-full p-2 border rounded-lg"
//           >
//             <option value="">Select a category</option>
//             {categories
//               .filter(
//                 (cat) =>
//                   !dropdownValues.includes(cat.name) ||
//                   cat.name === dropdownValues[index]
//               )
//               .map((cat) => (
//                 <option key={cat.id} value={cat.name}>
//                   {cat.name}
//                 </option>
//               ))}
//           </select>
//         </div>
//       ))}
//       <button
//         onClick={updateInterests}
//         className="bg-[#3f414c] hover:bg-[#2f313a] text-white text-sm font-medium px-5 py-2.5 rounded-xl mt-4 ml-auto block"
//       >
//         Update Interests
//       </button>
//       {showError && (
//         <p className="text-red-600 text-sm mt-2">
//           You can only select up to 6 topics.
//         </p>
//       )}
//     </div>
//   </div>
// );
  return (
    <div className="flex justify-center w-full px-4 md:px-5 pt-8 text-black text-2xl font-grotesk font-medium">
      <div className="w-full max-w-4xl font-grotesk">
        <h1 className="text-3xl font-bold mb-2">Profile Particulars:</h1>
        <div className="p-4 bg-white shadow-md rounded-lg">
          <div className="mb-1">Name:</div>
          <input
            type="text"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Username"
          />
          <div className="mb-1">Email:</div>
          <input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="E-mail"
          />
          <div className="mb-1">Date:</div>
          <DatePicker
            selected={editDate ? new Date(editDate) : null}
            onChange={(date) => {
              const isoString = date?.toISOString().split("T")[0]; // 'yyyy-mm-dd'
              setEditDate(isoString);
            }}
            dateFormat="dd-MM-yyyy"
            maxDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 16))
            }
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select your date of birth (Above 16 years old)"
            className="w-full p-2 border rounded-lg mb-2"
            wrapperClassName="w-full"
            popperClassName="z-[50]"
          />
          <div className="mb-1">Gender:</div>
          <select
            value={editGender}
            onChange={(e) => setEditGender(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Prefer Not To Say</option>
          </select>
          
          <div className="mb-1">User Type:</div>
          <input
            type="text"
            value={userType} 
            readOnly
            className="w-full p-2 border rounded-lg mb-2 bg-gray-200"
          />

          <div className="mb-1">Choose Profile Color:</div>
          <HexColorPicker
            color={profileColor}
            onChange={handleColorChange}
            className="mb-2"
          />
          <div className="mb-1">Or Enter HexCode:</div>
          <input
            type="text"
            value={hexCode}
            onChange={handleHexChange}
            placeholder="#FFFFFF"
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={updateProfile}
            className="bg-[#3f414c] text-[white] cursor-pointer text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl border-[none] "
          >
            Update
          </button>
        </div>

        {/* Password Change */}
        <h1 className="text-3xl font-bold mb-2 mt-6">Manage Password:</h1>
        <div className="p-4 bg-white shadow-md rounded-lg ">
          <PasswordInput
            name="password"
            value={editOldPassword}
            onChange={(e) => setEditOldPassword(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Old Password"
          />
          {oldPasswordError && (
            <p className="text-red-600 text-sm mt-1">{oldPasswordError}</p>
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
            className="bg-[#3f414c] text-[white] cursor-pointer text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl border-[none]"
          >
            Update
          </button>
        </div>

        {/* Topic Interests */}
        <h1 className="text-3xl font-bold mb-2 mt-6">
          Interest Selection (Max 6):
        </h1>
        <div className="p-4 bg-white shadow-md rounded-lg ">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-row mb-4 items-center">
              <label className="mt-1 mr-2 font-grotesk text-2xl w-6">
                {index + 1}.{" "}
              </label>
              <div className="flex-1">
                <select
                  value={dropdownValues[index]}
                  onChange={(e) => handleDropdownChange(index, e)}
                  className="w-full p-2 border rounded-lg font-grotesk"
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
            </div>
          ))}
          <button
            onClick={updateInterests}
            className="bg-[#3f414c] text-[white] cursor-pointer text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl border-[none]"
          >
            Update
          </button>
        </div>

        {showError && (
          <p className="text-red-600">You can only select up to 6 topics.</p>
        )}
      </div>
    </div>
  );
};

export default PremManageProfile;
