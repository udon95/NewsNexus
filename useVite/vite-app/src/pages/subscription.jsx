// import React from "react";
// import Navbar from "../components/navBar";
// import SubscriptionCard from "../components/subscriptionCard";

// const SubscriptionPage = () => {
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
//     <div className="flex flex-col w-full min-h-screen min-w-screen bg-white">
//       <Navbar />

//       <main className="w-full max-w-4xl mx-auto text-center mt-10 flex-grow pb-6">
//         <h1 className="text-4xl font-semibold mb-8 font-grotesk text-left">
//           Monthly Subscription
//         </h1>

//         {/* Subscription Cards */}
//         <div className="flex flex-col w-full items-center space-y-10">
//           <SubscriptionCard
//             title="Free"
//             content={
//               <ul className="list-disc pl-6 text-lg">
//                 <li>Aut consequatur maxime aut harum repudiandae aut</li>
//                 <li>
//                   Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta
//                   adipisci qui autem aperiam et reprehenderit
//                 </li>
//                 <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//               </ul>
//             }
//           />

//           <SubscriptionCard
//             title="$5"
//             content={
//               <ul className="list-disc pl-6 text-lg">
//                 <li>Aut consequatur maxime aut harum repudiandae aut</li>
//                 <li>
//                   Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta
//                   adipisci qui autem aperiam et reprehenderit
//                 </li>
//                 <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//               </ul>
//             }
//           />

//           {/* Upgrade Button */}
//           <button
//             className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm self-end"
//             onClick={handleUpgrade}
//           >
//             {" "}
//             Upgrade
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SubscriptionPage;


import React from "react";
import Navbar from "../components/navBar";
import SubscriptionCard from "../components/subscriptionCard";

const SubscriptionPage = () => {
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
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex flex-col flex-grow items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl p-6">
          <h1 className="text-4xl font-  mb-8 font-grotesk text-left">
            Monthly Subscription
          </h1>

          {/* Subscription Cards */}
          <div className="flex flex-col w-full items-center space-y-10 font-grotesk">
            <SubscriptionCard
              title="Free"
              content={
                <ul className="list-disc pl-6 font-medium text-lg">
                  <li>Aut consequatur maxime aut harum repudiandae aut</li>
                  <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
                  <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
                </ul>
              }
            />

            <SubscriptionCard
              title="$5"
              content={
                <ul className="list-disc pl-6 font-medium text-lg">
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
