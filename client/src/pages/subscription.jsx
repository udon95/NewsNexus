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
      if (!storedUser?.user?.userid) {
        alert("Please Sign In");
        return navigate("/login");
      }
      const userId = storedUser.user.userid;
      const userRole = storedUser.role;

      // Handle Unsubscribe logic for Premium users
      // You might call an API to update the user's subscription status in your backend
      if (userRole === "Premium") {
        const response = await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/subscription/unsubscribe", // Hosted not tested
          // "http://localhost:5000/subscription/unsubscribe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const data = await response.json();
        if (data.success) {
          setRole("Free"); // Update user type to Free

          const updatedUserProfile = { ...storedUser, role: "Free" };
          localStorage.setItem(
            "userProfile",
            JSON.stringify(updatedUserProfile)
          );
          sessionStorage.setItem(
            "userProfile",
            JSON.stringify(updatedUserProfile)
          );
          alert("You have successfully unsubscribed.");
        } else {
          console.error("Error unsubscribing", data);
        }
      } else {
        const premiumPlan = subscriptions.find((sub) => sub.tier === "Premium");
        const response = await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/subscription/create-checkout-session", //hosted not tested
          // "http://localhost:5000/subscription/create-checkout-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              subscriptionId: premiumPlan.id,
            }),
          }
        );

        const { url, error } = await response.json();
        if (error) {
          console.error("Error processing payment:", error);
        } else if (url) {
          window.location.href = url; // Redirect to Stripe Checkout
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
                const isPromo =
                  sub.promotion_active &&
                  sub.promotion_price &&
                  sub.promotion_end_date;
                const discount = calculateDiscount(
                  sub.default_price,
                  sub.promotion_price
                );

                return (
                  <SubscriptionCard
                    key={sub.id}
                    title={
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="font-bold text-xl">{sub.tier}</span>

                        {sub.tier !== "Free" && isPromo ? (
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
                        ) : sub.tier !== "Free" ? (
                          <span className="text-black text-lg font-medium">
                            ${sub.default_price}
                          </span>
                        ) : (
                          <span className="text-black text-lg font-medium">
                            $0
                          </span>
                        )}
                      </div>
                    }
                    content={
                      <ul className="list-disc list-inside space-y-1">
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
              {role === "Premium" ? "Unsubscribe" : "Upgrade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
