import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubscriptionCard from "../components/SubscriptionCard";
import "../styles/Subscription.css"; // Import CSS properly

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="subscription-container">
      <Header />

      <main className="subscription-content">
        <h1 className="subscription-title">Monthly Subscription</h1>

        {loading && <p>⏳ Loading subscriptions...</p>}
        {error && <p className="error">{error}</p>}

        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              title={sub.tier === "Free" ? "Free" : `$${sub.price}`}
              content={
                <ul className="subscription-details">
                  {sub.description
                    ? sub.description.split(",").map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))
                    : <li>No description available</li>}
                </ul>
              }
            />
          ))
        ) : (
          <p>No subscriptions available.</p>
        )}

        <button className="upgrade-button">Upgrade</button>
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionPage;
