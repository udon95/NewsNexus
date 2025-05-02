import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../api/supabaseClient";
// import axios from "axios";
import api from "../api/axios";
// use axios.get for localhost, use api for hosted

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [color, setColor] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setLoading(true);
      try {
        const storedUser =
          sessionStorage.getItem("userProfile") ||
          localStorage.getItem("userProfile");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser.user);
          setUserType(parsedUser.role);
          setColor(parsedUser.color);
          setInterests(parsedUser.interests || []); //  Load interests correctly
          setProfile(parsedUser.profile || null);
          // console.log(" Loaded user from localStorage:", parsedUser);
        }
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (sessionData?.session?.user) {
          // console.log(" Supabase session found:", sessionData.session.user);
          fetchUserRole(sessionData.session.user.id); // Ensure user role is set
          fetchUserInterest(sessionData.session.user.id); //  Fetch interests on startup
        } else {
          console.warn(" No active session found.");
        }
      } catch (error) {
        console.error("Error loading user from storage:", error.message);
      }

      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser =
        localStorage.getItem("userProfile") ||
        sessionStorage.getItem("userProfile");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.user);
        setUserType(parsedUser.role);
        setColor(parsedUser.color);
        setProfile(parsedUser.profile || {});
        setInterests(parsedUser.interests || []);
      }
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const response = await api.get(`/auth/user-role/${userId}`);
      setUserType(response.data.role);
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      setUserType("Unknown");
    }
  };

  const fetchUserInterest = async (userId) => {
    try {
      // console.log("🔄 Fetching interests for user:", userId);

      const response = await api.get(`/auth/user-interest/${userId}`);
      // console.log(" API Response:", response.data); //  Debugging: Ensure API response is received

      if (response.data.interests) {
        const formattedInterests = response.data.interests
          .split(", ")
          .map((topic) => topic.trim());
        setInterests(formattedInterests);

        //  Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("userProfile"));
        if (storedUser) {
          storedUser.interests = formattedInterests;
          localStorage.setItem("userProfile", JSON.stringify(storedUser));
        }
        console.log(
          " Interests updated in state and localStorage:",
          formattedInterests
        );
      } else {
        console.warn(" No interests found in API response.");
      }
    } catch (error) {
      console.error("Failed to fetch user interests:", error);
    }
  };

  const signInWithPass = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const { user, role, interests, profile, color } = response.data;
      setUser(user);
      setUserType(role);
      setProfile(profile);
      setColor(color);
      setInterests(
        interests ? interests.split(", ").map((topic) => topic.trim()) : []
      );

      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          user,
          role,
          color,
          interests: interests
            ? interests.split(", ").map((topic) => topic.trim())
            : [],
          profile,
        })
      );

      return { user, userType: role, color, interests, profile };
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const refreshUserProfile = async () => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (!storedUser || !storedUser.user || !storedUser.user.userid) return;

    const { data, error } = await supabase
      .from("usertype")
      .select("usertype, color")
      .eq("userid", storedUser.user.userid)
      .single();

    if (error) {
      console.error("❌ Error fetching updated role:", error);
      return;
    }

    // console.log(" Fetched updated role:", data.usertype);

    storedUser.role = data.usertype;
    localStorage.setItem("userProfile", JSON.stringify(storedUser));
    sessionStorage.setItem("userProfile", JSON.stringify(storedUser));

    setUserType(data.usertype);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setInterests([]);
    setProfile(null);
    setColor(null);

    localStorage.removeItem("userProfile");
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        color,
        profile,
        signInWithPass,
        signOut,
        loading,
        fetchUserInterest,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within the AuthProvider");
  }
  return context;
};
