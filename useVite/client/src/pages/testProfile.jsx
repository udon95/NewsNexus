import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");

      // Step 1: Get logged-in user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      setUser(user);

      // Step 2: Fetch user details from `users` table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id) // Match auth ID to fetch user details
        .single();

      if (userError) {
        setError("Failed to fetch user details.");
        setLoading(false);
        return;
      }

      setUserDetails(userData); // Store user details in state

      // Step 3: Fetch profile details from `profile` table
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("uuserid", userData.userid) // Match foreign key to fetch profile
        .single();

      if (profileError) {
        setError("Failed to fetch profile details.");
      }

      setProfile(profileData);
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">User Profile</h2>
      
      {userDetails && (
        <div className="p-4 bg-white shadow-md rounded-lg">
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Username:</strong> {userDetails.username || "N/A"}</p>
          <p><strong>Status:</strong> {userDetails.status || "N/A"}</p>
        </div>
      )}

      {profile && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
          <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
          <p><strong>Date of Birth:</strong> {profile.dob || "N/A"}</p>
        </div>
      )}
      
    </div>
  );
};

export default Profile;
