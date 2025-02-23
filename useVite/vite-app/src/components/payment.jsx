import React from "react";
import { useLocation } from "react-router-dom";

const SubscriptionStatus = () => {
  const location = useLocation();

  // Check if the URL contains "success"
  const isSuccess = location.pathname.includes("success");

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        {isSuccess ? (
          <h1 className="text-3xl font-bold text-green-600">
            Subscription Successful! 🎉
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-red-600">
            Subscription Canceled. 😔
          </h1>
        )}
        <p className="mt-4 text-lg">
          {isSuccess
            ? "Thank you for subscribing! Enjoy your premium features."
            : "No worries! You can upgrade anytime from the subscription page."}
        </p>
        <a
          href="/subscription"
          className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Subscription Page
        </a>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
