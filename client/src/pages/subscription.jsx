// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import Navbar from "../components/navBar";
// import SubscriptionCard from "../components/subscriptionCard";
// import Status from "../components/payment";

// const SubscriptionPage = () => {
//   const location = useLocation();
//   const [showStatus, setShowStatus] = useState(false);

//   useEffect(() => {
//     if (
//       location.pathname.includes("success") ||
//       location.pathname.includes("cancel")
//     ) {
//       setShowStatus(true);
//     }
//   }, [location.pathname]);

//   const handleUpgrade = async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:5000/create-checkout-session",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       const data = await response.json();
//       if (data.url) {
//         window.location.href = data.url; // Redirect to Stripe Checkout
//       }
//     } catch (error) {
//       console.error("Error creating checkout session:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen w-screen flex flex-col bg-white">
//       <Navbar />

//       {showStatus && <Status onClose={() => setShowStatus(false)} />}
//       <main className={`flex flex-col flex-grow items-center justify-center w-full px-4 ${showStatus ? "blur-sm" : ""}`}>
//         <div className="w-full max-w-3xl p-6 font-grotesk">
//           <h1 className="text-4xl mb-8 font-grotesk text-left">
//             Monthly Subscription
//           </h1>

//           {/* Subscription Cards */}
//           <div className="flex flex-col w-full items-center space-y-10 font-grotesk">
//             <SubscriptionCard
//               title="Free"
//               content={
//                 <ul className="list-disc pl-3 font-medium text-lg">
//                   <li>Aut consequatur maxime aut harum repudiandae aut</li>
//                   <li>
//                     Est magnam vitae qui reiciendis nihil qui saepe nisi et
//                     soluta adipisci qui autem aperiam et reprehenderit
//                   </li>
//                   <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//                 </ul>
//               }
//             />

//             <SubscriptionCard
//               title="$5"
//               content={
//                 <ul className="list-disc pl-3 font-medium text-lg">
//                   <li>Aut consequatur maxime aut harum repudiandae aut</li>
//                   <li>
//                     Est magnam vitae qui reiciendis nihil qui saepe nisi et
//                     soluta adipisci qui autem aperiam et reprehenderit
//                   </li>
//                   <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//                 </ul>
//               }
//             />

//             {/* Upgrade Button */}
//             <div className="w-full flex justify-end">
//               <button
//                 className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm"
//                 onClick={handleUpgrade}
//               >
//                 Upgrade
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SubscriptionPage;
import React, { useState, useEffect } from "react";
import Navbar from "../components/navBar";
import SubscriptionCard from "../components/subscriptionCard";
import PaymentStatus from "../components/payment"; // Import the popup from payment.jsx
import { useLocation } from "react-router-dom";

const SubscriptionPage = () => {
  const location = useLocation();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("success") || location.pathname.includes("cancel")) {
      setShowStatus(true);
    }
  }, [location.pathname]);

  const handleUpgrade = async () => {
    try {
      const response = await fetch("http://localhost:5000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      {/* Show PaymentStatus Popup if Stripe Redirects Here */}
      {showStatus && <PaymentStatus />}

      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6 font-grotesk">
          <h1 className="text-4xl mb-8 font-grotesk text-left">Monthly Subscription</h1>

          {/* Subscription Cards */}
          <div className="flex flex-col w-full items-center space-y-10 font-grotesk">
            <SubscriptionCard
              title="Free"
              content={
                <ul className="list-disc pl-3 font-medium text-lg">
                  <li>Aut consequatur maxime aut harum repudiandae aut</li>
                  <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
                  <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
                </ul>
              }
            />

            <SubscriptionCard
              title="$5"
              content={
                <ul className="list-disc pl-3 font-medium text-lg">
                  <li>Aut consequatur maxime aut harum repudiandae aut</li>
                  <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
                  <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
                </ul>
              }
            />

            {/* Upgrade Button */}
            <div className="w-full flex justify-end">
              <button
                className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm"
                onClick={handleUpgrade}
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;


