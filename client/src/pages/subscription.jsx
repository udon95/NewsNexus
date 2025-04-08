import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
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
          `${import.meta.env.VITE_API_BASE_URL}/subscription/unsubscribe`, // Replace with your backend unsubscribe endpoint
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
          `${import.meta.env.VITE_API_BASE_URL}/subscription/create-checkout-session`,
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

  const calculateDiscount = (original, promo) => {
    if (!original || !promo) return null;
    return Math.round(((original - promo) / original) * 100);
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
          {loading && <p>Loading subscriptions...</p>}
          {error && <p className="error">{error}</p>}

          {subscriptions.length > 0 ? (
            <div className="space-y-6">
              {subscriptions.map((sub) => {
                const isPromo = sub.promotion_active && sub.promotion_price && sub.promotion_end_date;
                const discount = calculateDiscount(sub.default_price, sub.promotion_price);

                return (
                  <SubscriptionCard
                    key={sub.id}                    
                    title={
                      sub.tier === "Free"
                        ? "Free"
                        : isPromo
                        ? (
                            <div className="relative w-[80px] flex flex-col items-center">
                              {/* $4 with badge floated top-right of it */}
                              <div className="relative">
                                <span className="text-green-600 font-bold text-4xl ml-8.5">
                                  ${sub.promotion_price}
                                </span>
                    
                                {/* Perfectly positioned badge */}
                                <span className="absolute -top-4.5 right-[-60px] bg-red-100 text-red-600 border border-red-400 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {discount}% OFF
                                </span>
                              </div>
                    
                              {/* $5 slashed price aligned under $4 --> To Be Considered Whether to Include or Not
                              <div className="text-sm text-gray-500 line-through mt-1 self-start">
                                ${sub.default_price}
                              </div> */}
                            </div>
                          )
                        : `$${sub.default_price}`
                    }                    

                    content={
                      <ul className="list-disc list-inside space-y-1">
                        {sub.description
                          ? sub.description.split(",").map((item, index) => (
                              <li key={index}>{item.trim()}</li>
                            ))
                          : <li>No description available</li>}
                      </ul>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <p>No subscriptions available.</p>
          )}

          {/* Upgrade Button - Added Extra Spacing Above */}
          <div className="w-full flex justify-end mt-6">
            <button
              className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm"
              onClick={handleUpgrade}
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
