import React, { useState, useEffect } from "react";
import supabase from "../../api/supabaseClient";
import useAuthHook from "../../hooks/useAuth";
import api from "../../api/axios";


const AdminProfile = () => {
  const { user } = useAuthHook();
  const [newEmail, setNewEmail] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [admin, setAdmin] = useState({});
  const [userDetails, setUserDetails] = useState(null);


  // const updateUserEmail = async () => {
  //   if (!newEmail) {
  //     alert("Please enter a new email address.");
  //     return;
  //   }
  //   const { error } = await supabase.auth.updateUser({ email: newEmail });
  //   if (error) {
  //     console.error("Error updating email:", error.message);
  //     alert("Failed to update email.");
  //   } else {
  //     alert(
  //       "Email update initiated. Please check your new email to confirm the change."
  //     );
  //   }
  // };


  const updateUserEmail = async () => {
    if (!newEmail) {
      alert("Please enter a new email address.");
      return;
    }

    try {
      const payload = {
        userId: userDetails.userid,
        email: newEmail,
      };

      const response = await api.put("/auth/update-admin-email", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.message) {
        alert("Profile updated successfully!");
        const storedUser = JSON.parse(localStorage.getItem("userProfile"));
        if (storedUser) {
          storedUser.user.email = newEmail;
          localStorage.setItem("userProfile", JSON.stringify(storedUser));
          sessionStorage.setItem("userProfile", JSON.stringify(storedUser));
        }
        window.location.reload();
      }
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data?.error || error.message
      );
    }
  };

  // const updatePassword = async () => {
  //   if (!oldPass || !newPass) {
  //     alert("Please enter both current and new passwords.");
  //     return;
  //   }

  //   if (!user?.email) {
  //     alert("No authenticated user found.");
  //     return;
  //   }
  //   const { error: signInError } = await supabase.auth.signInWithPassword({
  //     email: user.email,
  //     password: oldPass,
  //   });
  //   if (signInError) {
  //     console.error("Authentication error:", signInError.message);
  //     alert("Current password is incorrect.");
  //     return;
  //   }
  //   const { error: updateError } = await supabase.auth.updateUser({
  //     password: newPass,
  //   });

  //   if (updateError) {
  //     console.error("Error updating password:", updateError.message);
  //     alert("Failed to update password.");
  //   } else {
  //     alert("Password updated successfully.");
  //   }
  // };

  const updatePassword = async () => {
    if (!oldPass || !newPass) {
      alert("Please fill in all password fields.");
      return;
    }

    try {
      const payload = {
        userId: userDetails.userid,
        oldPassword: oldPass,
        newPassword: newPass,
      };

      const response = await api.put("/auth/update-admin-password", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.message) {
        alert("Password updated successfully!");

        const updatedUser = response.data.updatedUser;
        if (updatedUser) {
          const storedUser = JSON.parse(localStorage.getItem("userProfile"));
          if (storedUser) {
            storedUser.user.password = updatedUser.password;
            localStorage.setItem("userProfile", JSON.stringify(storedUser));
            sessionStorage.setItem("userProfile", JSON.stringify(storedUser));
          }
        }
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("An error occurred while updating the password.");
    }
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      const { data, error } = await supabase.from("admin").select("*").single();
      if (error) {
        console.error("Error fetching admin data:", error);
      } else {
        setAdmin(data);
      }
    };
    if (user) {
      fetchAdmin();
    }
  }, [user]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
          const data = JSON.parse(storedUser);

          setUserDetails(data.user);

        }
      } catch (err) {
        console.error("Profile fetch error:", err.message);
      }
    };

    fetchUserProfile();
  }, []);

  if (!user)
    return (
      <p className="ml-10 mt-10 text-lg">Loading or not authenticated...</p>
    );

  return (
    <div className="w-screen min-h-screen flex-col overflow-auto">
      <div className="flex-1 font-grotesk">
        <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
          Profile particulars:
        </div>
        <div className="ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg">
          {admin.username}
        </div>
        <input
          className="ml-10 mt-8 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
          placeholder={user.email}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button
          type="button"
          className="px-6 py-3 bg-[#3F414C] flex ml-10 mt-8 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
          onClick={updateUserEmail}
        >
          Update
        </button>
        <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 mb-5 font-bold">
          Manage password:
        </div>
        <div className="flex flex-col">
          <input
            className="flex-1 ml-10 mt-5 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Old password"
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            className="ml-10 mt-8 max-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="New password"
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button
            type="button"
            className="max-w-[105px] px-6 py-3 bg-[#3F414C] flex ml-10 mt-8 text-white rounded-lg hover:bg-opacity-90 cursor-pointer"
            onClick={updatePassword}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
