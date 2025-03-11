import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("success")) {
      setIsSuccess(true);
      setShowPopup(true);
    } else if (location.pathname.includes("cancel")) {
      setIsSuccess(false);
      setShowPopup(true);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setShowPopup(false); // Hide the popup
    navigate("/subscription", { replace: true }); // Redirect to subscription page
  };

  if (!showPopup) return null; // Don't render anything if no status

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blur bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-[90%] max-w-md text-center">
        <h1 className={`text-2xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
          {isSuccess ? "🎉 Subscription Successful!" : "😔 Subscription Canceled"}
        </h1>
        <p className="mt-4 text-lg">
          {isSuccess
            ? "Thank you for subscribing! Enjoy your premium features."
            : "No worries! You can upgrade anytime from the subscription page."}
        </p>
        <button
          onClick={handleClose} // Hide modal and redirect
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentStatus;
