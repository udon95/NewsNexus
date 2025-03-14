import React, { useState, useEffect } from "react";
import Navbar from "../components/navBar";
import SubscriptionCard from "../components/subscriptionCard";
import PaymentStatus from "../components/payment"; // Import the popup from payment.jsx
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

const SubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(""); 

  useEffect(() => {
    const storedUserProfile = localStorage.getItem("userProfile");
    if (storedUserProfile) {
      const userProfile = JSON.parse(storedUserProfile);
      setRole(userProfile.role || "Free"); // Default to "Free" if no userType
    }
    if (
      location.pathname.includes("success") ||
      location.pathname.includes("cancel")
    ) {
      setShowStatus(true);
    }
  }, [location.pathname]);

  const handleUpgrade = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userProfile"));
      if (!storedUser || !storedUser.user || !storedUser.user.userid) {
        // console.error("User not found");
        alert("Please Sign In");
        navigate("/login");
        return;
      }

      const userId = storedUser.user.userid;
      if (role === "Premium") {
        // Handle Unsubscribe logic for Premium users
        // You might call an API to update the user's subscription status in your backend
        const response = await fetch(
          "http://localhost:5000/subscription/unsubscribe", // Replace with your backend unsubscribe endpoint
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const data = await response.json();
        if (data.success) {
          alert("You have successfully unsubscribed.");
          setRole("Free"); // Update user type to Free
        } else {
          console.error("Error unsubscribing");
        }
      } else {
        const response = await fetch(
          "http://localhost:5000/subscription/create-checkout-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url; // Redirect to Stripe Checkout
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();

    const subscription = supabase
      .channel("subscriptions_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        async () => {
          await fetchSubscriptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(`Supabase Error: ${error.message}`);
      } else {
        setSubscriptions(data);
      }
    } catch {
      setError("Network Error: Please check your connection.");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      {/* Show PaymentStatus Popup if Stripe Redirects Here */}
      {showStatus && <PaymentStatus />}

      <div className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6 font-grotesk">
          <h1 className="text-4xl mb-8 font-grotesk text-left">
            Monthly Subscription
          </h1>

          {/* Subscription Cards */}
          {loading && <p>⏳ Loading subscriptions...</p>}
          {error && <p className="error">{error}</p>}

          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                title={sub.tier === "Free" ? "Free" : `$${sub.price}`}
                content={
                  <ul className="subscription-details">
                    {sub.description ? (
                      sub.description
                        .split(",")
                        .map((item, index) => (
                          <li key={index}>{item.trim()}</li>
                        ))
                    ) : (
                      <li>No description available</li>
                    )}
                  </ul>
                }
              />
            ))
          ) : (
            <p>No subscriptions available.</p>
          )}

          {/* Upgrade Button */}
          <div className="w-full flex justify-end">
            <button
              className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm"
              onClick={handleUpgrade}
            >
              {role === "Premium" ? "Unsubscribe" : "Upgrade"}
            </button>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default SubscriptionPage;
