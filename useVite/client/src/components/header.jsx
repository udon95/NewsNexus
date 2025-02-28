import React, { useEffect, useState } from "react";
import supabase from "../api/supabaseClient.js";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  // Fetch logged-in user from Supabase

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     // console.log("Checking Supabase Auth Session..."); // Debugging log

  //     //  First, check if there is an active session
  //     const { data: session, error: sessionError } =
  //       await supabase.auth.getSession();

  //     if (sessionError || !session || !session.session) {
  //       console.error("Auth session missing or expired!"); // Log session issue
  //       setUser(null);
  //       return;
  //     }

  //     // console.log("Auth session found:", session); // Debugging log

  //     //  Get the authenticated user
  //     const {
  //       data: { user },
  //       error: authError,
  //     } = await supabase.auth.getUser();

  //     if (authError || !user) {
  //       console.error(
  //         "Error fetching auth user:",
  //         authError?.message || "No user found!"
  //       );
  //       setUser(null);
  //       return;
  //     }

  //     console.log("Logged-in User:", user); // Debugging log

  //     setUser(user);

  //     //  Fetch user type from backend
  //     try {
  //       const response = await fetch(
  //         `http://localhost:5000/auth/user-role/${user.id}`
  //       );
  //       const result = await response.json();

  //       if (response.ok) {
  //         console.log("Backend User Role Response:", result); //  Debugging log
  //         setUserType(result.role); //  Use backend response
  //       } else {
  //         console.error("Failed to fetch user role:", result.error);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching user type from backend:", err);
  //     }
  //   };

  //   fetchUser();

  //   //  Listen for auth state changes (login/logout)
  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     (_event, session) => {
  //       if (!session?.session) {
  //         console.log("User session ended, logging out...");
  //         setUser(null);
  //         setUserType(null);
  //       }
  //     }
  //   );

  //   return () => {
  //     listener?.subscription?.unsubscribe();
  //   };
  // }, []);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     console.log("Checking Supabase Auth Session...");

  //     const { data: sessionData, error: sessionError } =
  //       await supabase.auth.getSession();

  //     if (sessionError || !sessionData || !sessionData.session) {
  //       console.error("Auth session missing or expired!");
  //       setUser(null);
  //       return;
  //     }

  //     console.log("Auth session found:", sessionData.session);

  //     const {
  //       data: { user },
  //       error: authError,
  //     } = await supabase.auth.getUser();
  //     if (authError || !user) {
  //       console.error(
  //         "Error fetching auth user:",
  //         authError?.message || "No user found!"
  //       );
  //       setUser(null);
  //       return;
  //     }

  //     console.log("Logged-in User:", user);
  //     setUser(user);

  //     try {
  //       const response = await fetch(
  //         `http://localhost:5000/auth/user-role/${user.id}`
  //       );
  //       const result = await response.json();

  //       if (response.ok) {
  //         console.log("Backend User Role Response:", result);
  //         setUserType(result.role);
  //       } else {
  //         console.error("Failed to fetch user role:", result.error);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching user type from backend:", err);
  //     }
  //   };

  //   fetchUser();

  //   // Fix: Prevents auto-logout if session refreshes
  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       console.log("Auth State Changed:", event, session);
  //       if (event === "SIGNED_IN") {
  //         console.log("User signed in, updating state...");
  //         setUser(session?.user);
  //       } else if (event === "SIGNED_OUT") {
  //         console.log("User signed out, clearing state...");
  //         setUser(null);
  //         setUserType(null);
  //       }
  //     }
  //   );

  //   return () => {
  //     listener?.subscription?.unsubscribe();
  //   };
  // }, []);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     console.log("Checking Supabase Auth Session...");

  //     // Get session from Supabase
  //     const { data: sessionData, error: sessionError } =
  //       await supabase.auth.getSession();

  //     if (sessionError || !sessionData || !sessionData.session) {
  //       console.error("Auth session missing or expired!");
  //       setUser(null);
  //       sessionStorage.removeItem("userProfile"); // Ensure session storage clears
  //       return;
  //     }

  //     console.log("Auth session found:", sessionData.session);

  //     const {
  //       data: { user },
  //       error: authError,
  //     } = await supabase.auth.getUser();

  //     if (authError || !user) {
  //       console.error(
  //         "Error fetching auth user:",
  //         authError?.message || "No user found!"
  //       );
  //       setUser(null);
  //       sessionStorage.removeItem("userProfile"); // Clear stale session data
  //       return;
  //     }

  //     console.log("Logged-in User:", user);
  //     setUser(user);

  //     // Store in sessionStorage to prevent stale session issues
  //     sessionStorage.setItem("userProfile", JSON.stringify(user));

  //     try {
  //       const userId = data.user.id;
  //       if (!userId) throw new Error("User ID is missing.");
  //       const response = await fetch(
  //         `http://localhost:5000/auth/user-role/${userId}`
  //         // ,
  //         // {
  //         //   method: "GET",
  //         //   headers: { "Content-Type": "application/json" },
  //         // }
  //       );
  //       const userData = await response.json();
  
  //       if (!response.ok) throw new Error(userData.error);
  //       console.log("User Role:", userData);
  
  //       // Redirect based on role
  //       if (userData.role === "Free") {
  //         navigate("/freeDashboard");
  //       } else {
  //         navigate("/"); // Redirect Free/Premium users to Home
  //       }
  //     } catch (err) {
  //       console.error("Error fetching user type from backend:", err);
  //     }
  //   };

  //   fetchUser();

  //   // Listen for auth state changes (login/logout)
  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       console.log("Auth State Changed:", event, session);
  //       if (event === "SIGNED_IN") {
  //         setUser(session?.user);
  //         sessionStorage.setItem(
  //           "userProfile",
  //           JSON.stringify({
  //             user: session?.user,
  //             userType: userType,
  //           })
  //         );
  //       } else if (event === "SIGNED_OUT") {
  //         setUser(null);
  //         setUserType(null);
  //         sessionStorage.removeItem("userProfile"); // Ensure session storage clears on logout
  //       }
  //     }
  //   );
  

  //   return () => {
  //     listener?.subscription?.unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    const cachedProfile = sessionStorage.getItem("userProfile") || localStorage.getItem("userProfile");
    if (cachedProfile) {
      console.log("Loading profile from cache...");
      const data = JSON.parse(cachedProfile);
      setUser(data.user);
      setUserType(data.role); //  Ensure userType is set
      return;
    }
  
    const fetchUser = async () => {
      console.log("Checking Supabase Auth Session...");
  
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !sessionData || !sessionData.session) {
        console.error("Auth session missing or expired!");
        setUser(null);
        sessionStorage.removeItem("userProfile"); 
        return;
      }
  
      console.log("Auth session found:", sessionData.session);
  
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error fetching auth user:", authError?.message || "No user found!");
        setUser(null);
        return;
      }
  
      console.log("Logged-in User:", user);
      setUser(user);
  
      // Fetch role from backend
      const response = await fetch(`http://localhost:5000/auth/user-role/${user.id}`);
      const result = await response.json();
  
      if (response.ok) {
        console.log("Backend User Role Response:", result);
        setUserType(result.role);
        sessionStorage.setItem("userProfile", JSON.stringify({ user, userType: result.role }));
      } else {
        console.error("Failed to fetch user role:", result.error);
      }
    };
  
    fetchUser();

     // Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth State Changed:", event, session);
        if (event === "SIGNED_IN") {
          setUser(session?.user);
          sessionStorage.setItem(
            "userProfile",
            JSON.stringify({
              user: session?.user,
              userType: userType,
            })
          );
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setUserType(null);
          setSession(null);
          sessionStorage.removeItem("userProfile");
          localStorage.removeItem("userProfile"); // Ensure session storage clears on logout
        }
      }
    );
  

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);
  

  const userEmail = user?.email || "";
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "P";

  // Logout function
  // const logout = async () => {
  //   if (!supabase) {
  //     alert("Supabase is not initialized!");
  //     return;
  //   }

  //   try {
  //     console.log("Refreshing session before logout...");

  //     // Ensure we have the latest session before logging out
  //     const { data: sessionData, error: sessionError } =
  //       await supabase.auth.getSession();

  //     if (sessionError || !sessionData || !sessionData.session) {
  //       console.warn("Session expired or missing, continuing logout...");
  //     } else {
  //       console.log("Session active, proceeding with logout.");
  //     }

  //     console.log("Attempting to log out...");

  //     // Step 1: Log out from Supabase
  //     const { error } = await supabase.auth.signOut();

  //     if (error) {
  //       console.error("Logout failed:", error.message);
  //       alert("Logout failed: " + error.message);
  //       return;
  //     }

  //     console.log("User logged out successfully");

  //     // Step 2: Remove Supabase session storage safely
  //     localStorage.removeItem("userProfile");

  //     // Step 3: Update React state
  //     setUser(null);
  //     setUserType(null);

  //     // Step 4: Redirect to homepage
  //     navigate("/");
  //     window.location.reload(); // Ensure state is completely refreshed
  //   } catch (error) {
  //     console.error("Unexpected error during logout:", error);
  //     alert("Unexpected error: " + error.message);
  //   }
  // };

  const logout = async () => {
    if (!supabase) {
      alert("Supabase is not initialized!");
      return;
    }
  
    try {
      console.log("Attempting to log out...");
  
      //  Step 1: Force Clear Supabase Session Before Signing Out
      // console.log("Invalidating Supabase session...");
      // await supabase.auth.refreshSession(); // Ensure session is valid
  
      console.log("Manually clearing Supabase authentication state...");
      await supabase.auth.setSession(null); //  Force-clear session before logout
  
      //  Step 2: Attempt Sign Out
      console.log("Signing out from Supabase...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout failed:", error.message);
        alert("Logout failed: " + error.message);
        return;
      }
  
      console.log("User logged out successfully");
  
      //  Step 3: Clear Storage
      sessionStorage.clear();
      localStorage.clear();
      console.log("Storage Cleared Successfully");
  
      //  Step 4: Reset State and Reload
      setUser(null);
      setUserType(null);
      navigate("/");
  
      setTimeout(() => {
        console.log("Forcing full page reload...");
        window.location.href = "/";
      }, 500);
  
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      alert("Unexpected error: " + error.message);
    }
  };
  
  

  const handleProfileClick = () => {
    console.log("Navigating to:", userType); //  Debugging log
    if (!userType) {
      console.warn("UserType is null! Fetching from sessionStorage...");
      const cachedProfile = sessionStorage.getItem("userProfile");
      if (cachedProfile) {
        const data = JSON.parse(cachedProfile);
        setUserType(data.userType || "Unknown");
      }
    }
    if (userType === "Free") {
      navigate("/freeDashboard");
    } else if (userType === "Premium") {
      navigate("/premiumDashboard");
    } else if (userType === "Admin") {
      navigate("/adminDashboard");
    } else {
      navigate("/login"); // Default route if type is unknown
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-[60px] py-4">
        <Link to="/">
          <img
            loading="lazy"
            src={logo}
            className="h-10 sm:h-12 w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
        </Link>

        <nav className="nav-items flex items-center gap-6">
          {/* Show Profile Button if User is Logged In */}
          {
            user && (
              <button
                className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
                onClick={handleProfileClick}
                title="Profile"
              >
                {userInitial}
              </button>
            )
            // : (
            //   <button
            //     className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            //     onClick={() => navigate("/login")}
            //   >
            //     Login
            //   </button>
            // )
          }

          {/* Show Logout if Logged In */}

          {user !== null && (
            <button
              onClick={logout}
              className="text-red-500 font-medium hover:underline"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
