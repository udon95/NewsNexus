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
        alert("Email updated successfully!\nPlease acknowledge the confirmation emails sent to the old and new email address to effect the change.");
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
        "Error updating Email:",
        error.response?.data?.error || error.message
      );
    }
  };


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
      const { data, error } = await supabase.from("admin").select("*").eq("username", user.username).single();
      if (error) {
        console.error("Error fetching admin data:", error);
      } else {
        setAdmin(data);
      }
    };
    if (user) {
      fetchAdmin();
      console.log(user);
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

    
// return (
//   <div className="w-screen min-h-screen flex py-10 overflow-auto font-grotesk">
//     <div className="w-full max-w-5xl px-6">
//       {/* Profile Section */}
//       <section className="mb-12">
//         <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Profile Particulars</h2>

//         <div className="bg-white p-4 rounded-xl shadow mb-6">
//           <label className="block text-gray-600 mb-2 text-sm">Username</label>
//           <div className="bg-gray-100 rounded-xl p-3 text-lg">{admin.username}</div>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow mb-6">
//           <label className="block text-gray-600 mb-2 text-sm">Update Email</label>
//           <input
//             type="email"
//             className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300"
//             placeholder={user.email}
//             onChange={(e) => setNewEmail(e.target.value)}
//           />
//           <button
//             type="button"
//             className="mt-4 px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
//             onClick={updateUserEmail}
//           >
//             Update Email
//           </button>
//         </div>
//       </section>

//       <section>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Manage Password</h2>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <label className="block text-gray-600 mb-2 text-sm">Old Password</label>
//           <input
//             type="password"
//             className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300 mb-4"
//             placeholder="Old password"
//             onChange={(e) => setOldPass(e.target.value)}
//           />

//           <label className="block text-gray-600 mb-2 text-sm">New Password</label>
//           <input
//             type="password"
//             className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300 mb-4"
//             placeholder="New password"
//             onChange={(e) => setNewPass(e.target.value)}
//           />

//           <button
//             type="button"
//             className="px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
//             onClick={updatePassword}
//           >
//             Update Password
//           </button>
//         </div>
//       </section>
//     </div>
//   </div>
// );

// return (
//   // <div className="w-screen min-h-screen flex justify-center py-10 overflow-auto font-grotesk bg-gray-50">
// <div className="w-full px-4 py-10 space-y-12">
//     <div className="w-full max-w-3xl px-6 space-y-12">
//       {/* Profile & Email Update */}
//       <section>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
//           Admin Profile
//         </h2>

//         <div className="bg-white p-6 rounded-2xl shadow space-y-6 border border-gray-200">
//           {/* Username (read-only) */}
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Username</label>
//             <div className="bg-gray-100 rounded-xl p-3 text-lg">
//               {admin.username}
//             </div>
//           </div>

//           {/* Update Email */}
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Update Email</label>
//             <input
//               type="email"
//               className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300"
//               placeholder={user.email}
//               onChange={(e) => setNewEmail(e.target.value)}
//             />
//           </div>

//           <div className="pt-2">
//             <button
//               type="button"
//               className="px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
//               onClick={updateUserEmail}
//             >
//               Update Email
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Password Management */}
//       <section>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
//           Manage Password
//         </h2>

//         <div className="bg-white p-6 rounded-2xl shadow space-y-4 border border-gray-200">
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Old Password</label>
//             <input
//               type="password"
//               className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300"
//               placeholder="Old password"
//               onChange={(e) => setOldPass(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">New Password</label>
//             <input
//               type="password"
//               className="w-full bg-gray-100 rounded-xl p-3 text-lg outline-none focus:ring-2 focus:ring-gray-300"
//               placeholder="New password"
//               onChange={(e) => setNewPass(e.target.value)}
//             />
//           </div>

//           <div className="pt-2">
//             <button
//               type="button"
//               className="px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
//               onClick={updatePassword}
//             >
//               Update Password
//             </button>
//           </div>
//         </div>
//       </section>
//     </div>
//   </div>
// );

return (
  <div className="w-full min-h-screen py-10 px-4 font-grotesk bg-indigo-50 flex justify-center">
    <div className="w-full max-w-4xl space-y-10 px-2">
    {/* Admin Profile */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold mb-5 text-gray-800">Hello, {admin.username} !!</h2>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <div className="bg-gray-100 rounded-lg p-3 text-base">{admin.username}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Update Email</label>
            <input
              type="email"
              className="w-full bg-gray-100 rounded-lg p-3 text-base outline-none focus:ring-2 focus:ring-gray-300"
              placeholder={user.email}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              className="px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
              onClick={updateUserEmail}
            >
              Update Email
            </button>
          </div>
        </div>
      </section>

      {/* Manage Password */}
      <section>
        <h2 className="text-2xl font-bold mb-5 text-gray-800">Manage Password</h2>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Old Password</label>
            <input
              type="password"
              className="w-full bg-gray-100 rounded-lg p-3 text-base outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Old password"
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              className="w-full bg-gray-100 rounded-lg p-3 text-base outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="New password"
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              className="px-5 py-2 bg-[#3F414C] text-white rounded-lg hover:bg-opacity-90"
              onClick={updatePassword}
            >
              Update Password
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
);


};

export default AdminProfile;
