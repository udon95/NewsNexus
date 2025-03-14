import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../api/supabaseClient";
import axios from "axios";

const AuthContext = createContext(undefined);

// export const AuthProvider = ({ children }) => {
// 	const [auth, setAuth] = useState(() => {
// 		// Retrieve the auth data from localStorage
// 		const savedAuth = sessionStorage.getItem("auth");
// 		return savedAuth ? JSON.parse(savedAuth) : {};
// 	});

// 	useEffect(() => {
// 		// Persist auth state to localStorage whenever it changes
// 		sessionStorage.setItem("auth", JSON.stringify(auth));
// 	}, [auth]);

// 	return (
// 		<AuthContext.Provider value={{ auth, setAuth }}>
// 			{children}
// 		</AuthContext.Provider>
// 	);
// };

// export default AuthContext;

// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabase-client";

// const AuthContext = createContext(undefined);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkSession = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       // supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     };
//     checkSession();

//     const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const signInWithPass = async (email, password) => {
//     if (!email || !password) {
//       console.error("Email and password required");
//       return;
//     }
//     const { data, error } = supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
// 	if (error) {
// 		console.error("Sign-in error:", error.message);
// 	  } else {
// 		console.log("User signed in:", data);
// 		setUser(data.user);
// 	  }
//   };

//   const signOut = () => {
//     supabase.auth.signOut();
//   };

//   return (
//     <AuthContext.Provider value={{ user, signInWithPass, signOut }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within the AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
// 	const [user, setUser] = useState(null);
// 	const [userType, setUserType] = useState(null);
// 	const [loading, setLoading] = useState(true);

// 	useEffect(() => {
// 	  const fetchUser = async () => {
// 		const { data: { user } } = await supabase.auth.getUser();
// 		setUser(user);

// 		if (user) {
// 			// Fetch user type from Supabase table
// 			const { data, error } = await supabase
// 			  .from("usertype")
// 			  .select("usertype")
// 			  .eq("userid", user.id)
// 			  .single();

// 			if (!error && data) {
// 			  setUserType(data.usertype);
// 			}
// 		  }

// 		setLoading(false);
// 	  };

// 	  fetchUser();

// 	  // Listen for authentication state changes
// 	  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
// 		setUser(session?.user ?? null);
// 	  });

// 	  return () => {
// 		authListener.subscription.unsubscribe();
// 	  };
// 	}, []);

// 	const signInWithPass = async (email, password) => {
// 	  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// 	  if (error) {
// 		throw new Error(error.message);
// 	  }

// 	  if (!data.user.email_confirmed_at) {
// 		throw new Error("Please verify your email before logging in.");
// 	  }

// 	  setUser(data.user);
// 	  const { data: userTypeData, error: roleError } = await supabase
//       .from("usertype")
//       .select("usertype")
//       .eq("userid", data.user.id)
//       .single();

//     if (!roleError && userTypeData) {
//       setUserType(userTypeData.usertype);
//     }
// 	//   return data.user;
// 	return { user: data.user, userType: userTypeData?.usertype };

// 	};

// 	const signOut = async () => {
// 	  await supabase.auth.signOut();
// 	  setUser(null);
// 	  setUserType(null);
// 	};

// 	return (
// 	  <AuthContext.Provider value={{ user, signInWithPass, signOut, loading }}>
// 		{children}
// 	  </AuthContext.Provider>
// 	);
//   };

//   export const useAuth = () => {
// 	const context = useContext(AuthContext);
// 	if (!context) {
// 	  throw new Error("useAuth must be used within the AuthProvider");
// 	}
// 	return context;
//   };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setInterests(parsedUser.interests || []); // ✅ Load interests correctly

          // console.log(" Loaded user from localStorage:", parsedUser);
        }
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (sessionData?.session?.user) {
          // console.log("✅ Supabase session found:", sessionData.session.user);
          fetchUserRole(sessionData.session.user.id); // Ensure user role is set
          fetchUserInterest(sessionData.session.user.id); // ✅ Fetch interests on startup
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

  const fetchUserRole = async (userId) => {
    try {
      const response = await axios.get(`/auth/user-role/${userId}`);
      setUserType(response.data.role);
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      setUserType("Unknown");
    }
  };

  const fetchUserInterest = async (userId) => {
    try {
      // console.log("🔄 Fetching interests for user:", userId);

      const response = await axios.get(`/auth/user-interest/${userId}`);
      // console.log("✅ API Response:", response.data); // ✅ Debugging: Ensure API response is received

      if (response.data.interests) {
        const formattedInterests = response.data.interests
          .split(", ")
          .map((topic) => topic.trim());
        setInterests(formattedInterests);

        // ✅ Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("userProfile"));
        if (storedUser) {
          storedUser.interests = formattedInterests;
          localStorage.setItem("userProfile", JSON.stringify(storedUser));
        }
        console.log(
          "✅ Interests updated in state and localStorage:",
          formattedInterests
        );
      } else {
        console.warn("⚠️ No interests found in API response.");
      }
    } catch (error) {
      console.error("Failed to fetch user interests:", error);
    }
  };

  const signInWithPass = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });
      const { user, role, interests } = response.data;
      setUser(user);
      setUserType(role);
      setInterests(
        interests ? interests.split(", ").map((topic) => topic.trim()) : []
      ); // ✅ Convert to an array

      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          user,
          role,
          interests: interests
            ? interests.split(", ").map((topic) => topic.trim())
            : [],
        })
      );
      return { user, userType: role, interests };
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const refreshUserProfile = async () => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    if (!storedUser || !storedUser.user || !storedUser.user.userid) return;

    const { data, error } = await supabase
      .from("usertype")
      .select("usertype")
      .eq("userid", storedUser.user.userid)
      .single();

    if (error) {
      console.error("❌ Error fetching updated role:", error);
      return;
    }

    console.log("✅ Fetched updated role:", data.usertype);

    storedUser.role = data.usertype;
    localStorage.setItem("userProfile", JSON.stringify(storedUser));
    sessionStorage.setItem("userProfile", JSON.stringify(storedUser)); // ✅ Update session storage too

    setUserType(data.usertype);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setInterests([]); // ✅ Reset interests on logout

    localStorage.removeItem("userProfile");
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
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
