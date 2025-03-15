import React, { useState, useEffect } from "react";
import Navbar from "../components/navBar";
import SubscriptionCard from "../components/subscriptionCard";
import PaymentStatus from "../components/payment"; // Import the popup from payment.jsx
import { useLocation } from "react-router-dom";
import supabase from "../api/supabaseClient";

const SubscriptionPage = () => {
  const location = useLocation();
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        console.error("User not found");
        return;
      }

      const userId = storedUser.user.userid;

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
          {loading && <p>Loading subscriptions...</p>}
          {error && <p className="error">{error}</p>}

          {subscriptions.length > 0 ? (
            <div className="space-y-6">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  title={sub.tier === "Free" ? "Free" : `$${sub.price}`}
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
              ))}
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
