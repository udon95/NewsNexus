
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TopicList from "../../components/topicList";

const FreeManageProfile = () => {
  const { interests } = useAuth(); //  Get interests from AuthContext
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError, showError] = useState("");

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editGender, setEditGender] = useState("");

  const [editOldPassword, setEditOldPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const data = JSON.parse(storedUser);

          // console.log(" Loaded user profile:", data);

          setUserDetails(data.user);
          setProfile(data.profile);

          //  Ensure interests are always an array before setting state
          const formattedInterests = Array.isArray(data.interests)
            ? data.interests
            : data.interests.split(", ").map((topic) => topic.trim());

          setSelectedTopics(formattedInterests); //  Pre-select topics from stored interests
          // console.log(" Auto-selected topics:", formattedInterests);
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

      //Update password if old password matches
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: editNewPassword }) // Update password field
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
      setEditDate(userDetails.dob || "");
      setEditGender(userDetails.gender || "");

    }
  }, [userDetails]);

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex-grow w-full flex min-h-full overflow-auto">
        <div className="flex flex-grow max-md:flex-col min-h-full w-full">
          <div className="flex-1 min-h-full bg-indigo-50 max-md:w-full">
            <div className="flex flex-col flex-grow min-h-full md:px-5 pt-8 w-full text-2xl font-grotesk font-medium text-black max-md:px-4 max-md:pb-24">
              {/* Profile Details */}
              <h3 className="text-2xl font-grotesk font-bold mb-1">Profile Particulars:</h3>
              <div className="p-4 bg-white shadow-md rounded-lg w-3/3 md:w-2/3">
                Name:
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Username"
                />Email:

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
                Gender:
                <input
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="Gender"
                />
                <button
                  onClick={updateProfile}
                  className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg mt-2 "
                >
                  Update
                </button>
              </div>

              {/* Password Change */}
              <h3 className="text-2xl font-bold  font-grotesk mb-1 mt-6">Manage Password:</h3>
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
                    "Korea"
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
