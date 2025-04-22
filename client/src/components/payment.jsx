import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { refreshUserProfile } = useAuth(); //  Fetch updated user role


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userProfile"));
    const userId = storedUser?.user?.userid;

    if (location.pathname.includes("success")) {
      setIsSuccess(true);
      setShowPopup(true);
      if (userId) {
        // fetch(`${import.meta.env.VITE_API_BASE_URL}/subscription/update-subscription`, { //hosted not tested
        fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/subscription/update-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(" Subscription updated:", data);
            storedUser.role = "Premium"; //  Update role in local storage
            localStorage.setItem("userProfile", JSON.stringify(storedUser));
          })
          .catch((error) =>
            console.error("❌ Error updating subscription:", error)
          );
          refreshUserProfile(); //  Ensure frontend gets the updated role

      }
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
        <h1
          className={`text-2xl font-bold ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {isSuccess
            ? "🎉 Subscription Successful!"
            : "😔 Subscription Canceled"}
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
