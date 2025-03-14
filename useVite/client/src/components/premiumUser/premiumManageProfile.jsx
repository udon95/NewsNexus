import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TopicList from "../../components/topicList";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (Replace with your actual Supabase keys)
const supabase = createClient("https://your-supabase-url", "your-anon-key");

const PremManageProfile = () => {
  const { interests } = useAuth(); // Get interests from AuthContext
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const data2 = JSON.parse(storedUser);

          console.log("Loaded user profile:", data2);

          setUserDetails(data2.user);
          setProfile(data2.profile);

          const formattedInterests = Array.isArray(data2.interests)
            ? data2.interests
            : data2.interests.split(", ").map((topic) => topic.trim());

          setSelectedTopics(formattedInterests);
          console.log("Auto-selected topics:", formattedInterests);
        }
      } catch (err) {
        console.error("Profile fetch error:", err.message);
        setError(err.message);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle topic selection (toggle selection, max 6 topics)
  const handleTopicSelection = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      setShowError(false);
    } else if (selectedTopics.length < 6) {
      setSelectedTopics([...selectedTopics, topic]);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ username: editUsername, email: editEmail })
        .eq("userid", userDetails.userid);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    }
  };

  const updatePassword = async () => {
    try {
      if (!editOldPassword || !editNewPassword) {
        alert("Please fill in both the old and new passwords.");
        return;
      }

      if (userDetails.password !== editOldPassword) {
        alert("Old password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ password: editNewPassword })
        .eq("userid", userDetails.userid);

      if (updateError) {
        alert("Failed to update password.");
        return;
      }

      alert("Password updated successfully!");
      setEditOldPassword("");
      setEditNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("An error occurred while updating the password.");
    }
  };

  const updateInterests = async () => {
    try {
      const { error } = await supabase
        .from("topicinterest")
        .update({ interesttype: selectedTopics.join(", ") })
        .eq("userid", userDetails.userid);

      if (error) throw error;
      alert("Interests updated successfully!");
    } catch (error) {
      console.error("Error updating interests:", error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (userDetails) {
      setEditUsername(userDetails.username || "");
      setEditEmail(userDetails.email || "");
    }
  }, [userDetails]);

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              {/* Profile Details */}
              <h3 className="text-2xl font-bold">Profile Particulars:</h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Username"
                />

                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="E-mail"
                />
                <button
                  onClick={updateProfile}
                  className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg mt-2"
                >
                  Update
                </button>
              </div>

              {/* Password Change */}
              <h3 className="text-2xl font-bold mt-6">Manage Password:</h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3">
                <input
                  type="password"
                  value={editOldPassword}
                  onChange={(e) => setEditOldPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Old Password"
                />
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="New Password"
                />
                <button
                  onClick={updatePassword}
                  className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg mt-2"
                >
                  Update
                </button>
              </div>

              {/* Topic Interests */}
              <h3 className="text-2xl font-bold mt-6">Interest Selection (Max 6):</h3>
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
                ]}
                selectedTopics={selectedTopics}
                handleTopicSelection={handleTopicSelection}
              />
              <button
                onClick={updateInterests}
                className="bg-[#3f414c] text-[white] text-sm flex justify-end self-end w-fit ml-auto mr-0 mt-5 px-5 py-2.5 rounded-xl"
              >
                Update Interests
              </button>

              {showError && <p className="text-red-600">You can only select up to 6 topics.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremManageProfile;