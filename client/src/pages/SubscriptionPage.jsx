import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubscriptionCard from "../components/SubscriptionCard";
import "../styles/Subscription.css"; // Import CSS properly

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]); // State for subscriptions
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
  
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("price", { ascending: true });
  
    if (error) {
      console.error("Supabase Error:", error); // Log full error
      setError(`Supabase Error: ${error.message}`);
    } else {
      console.log("Fetched Subscriptions:", data); // Log response
      setSubscriptions(data);
    }
  
    setLoading(false);
  };   

  return (
    <div className="subscription-container">
      <Header />
  
      <main className="subscription-content">
        <h1 className="subscription-title">Monthly Subscription</h1>
  
        {subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            title={sub.tier === "Free" ? "Free" : `$${sub.price}`}
            content={
              <ul className="subscription-details">
                {sub.description.split(",").map((item, index) => (
                  <li key={index}>{item.trim()}</li> // Trim removes extra spaces
                ))}
              </ul>
            }
          />
        ))}
  
        <button className="upgrade-button">Upgrade</button>
      </main>
  
      <Footer />
    </div>
  );
  
};

export default SubscriptionPage;
