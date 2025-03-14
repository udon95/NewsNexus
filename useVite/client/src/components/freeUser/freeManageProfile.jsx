import { useEffect, useState } from "react";
import useAuthHook from "../../hooks/useAuth";
import TopicList from "../../components/topicList";
import axios from "axios";
import PasswordInput from "../showPW";

const FreeManageProfile = () => {
  // const { interests } = useAuth(); //  Get interests from AuthContext
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  // const [profile, setProfile] = useState(null);
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
        }
      } catch (err) {
        console.error("Profile fetch error:", err.message);
        setError(err.message);
      }
    };

    fetchUserProfile();
  }, []);

  //  Handle topic selection (toggle selection)
  const handleTopicSelection = (topic) => {
    setSelectedTopics(
      (prevTopics) =>
        prevTopics.includes(topic)
          ? prevTopics.filter((t) => t !== topic) // Remove if already selected
          : [...prevTopics, topic] // Add if not selected
    );
  };

  useEffect(() => {
    if (editDate) {
      const dobDate = new Date(editDate);
      const today = new Date();
      if (dobDate > today) {
        setDobError("Date of Birth cannot be later than today.");
      } else {
        setDobError("");
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
      alert("Date of Birth cannot be later than today.");
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

      const response = await axios.post(
        "http://localhost:5000/auth/update-profile",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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

      const response = await axios.post(
        "http://localhost:5000/auth/update-password",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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
      const response = await axios.post(
        "http://localhost:5000/auth/update-interests",
        {
          userId: userDetails.userid,
          interests: selectedTopics.join(", "),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (error) throw error;
      alert("Interests updated successfully!");

      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      if (storedUser) {
        storedUser.interests = selectedTopics.join(", ");
        localStorage.setItem("userProfile", JSON.stringify(storedUser));
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
      axios
        .post("http://localhost:5000/auth/verify-old-password", {
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
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="DOB"
                />
                {dobError && (
                  <p className="text-red-600 text-sm mt-2">{dobError}</p>
                )}
                <div>
                  <label className="block font-bold">Gender:</label>
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
                <TopicList
                  allTopics={[
                    "Finance",
                    "Politics",
                    "Entertainment",
                    "Sports",
                    "Weather",
                    "Lifestyle",
                    "Beauty",
                    "Hollywood",
                    "China",
                    "Horticulture",
                    "Culinary",
                    "LGBTQ++",
                    "Singapore",
                    "Environment",
                    "Investment",
                    "USA",
                    "Luxury",
                    "Korea",
                  ]}
                  selectedTopics={selectedTopics} //  Pass selected topics
                  setSelectedTopics={setSelectedTopics} //  Allow updates
                  handleTopicSelection={handleTopicSelection}
                />
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
