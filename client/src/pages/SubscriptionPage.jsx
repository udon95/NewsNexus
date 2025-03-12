// import React from "react";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import "../index.css"; // Ensure styles are applied

// const SubscriptionPage = () => {
//   return (
//     <div className="subscription-container">
//       <Header />

//       {/* Page Title */}
//       <main className="subscription-content">
//         <h1 className="subscription-title">Monthly Subscription</h1>

//         {/* Free Subscription Card */}
//         <div className="subscription-card">
//           <div className="subscription-label">Free</div>
//           <ul className="subscription-details">
//             <li>Aut consequatur maxime aut harum repudiandae aut</li>
//             <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
//             <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//           </ul>
//         </div>

//         {/* Paid Subscription Card */}
//         <div className="subscription-card">
//           <div className="subscription-label">$ 5</div>
//           <ul className="subscription-details">
//             <li>Aut consequatur maxime aut harum repudiandae aut</li>
//             <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
//             <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
//           </ul>
//         </div>

//         {/* Upgrade Button */}
//         <button className="upgrade-button">Upgrade</button>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default SubscriptionPage;

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubscriptionCard from "../components/SubscriptionCard";
import "../styles/Subscription.css"; // Import CSS properly

const SubscriptionPage = () => {
  return (
    <div className="subscription-container">
      {/* Ensure Header Renders */}
      <Header />

      <main className="subscription-content">
        <h1 className="subscription-title">Monthly Subscription</h1>

        {/* Ensure Subscription Cards Render */}
        <SubscriptionCard
          title="Free"
          content={
            <ul className="subscription-details">
              <li>Aut consequatur maxime aut harum repudiandae aut</li>
              <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
              <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
            </ul>
          }
        />

        <SubscriptionCard
          title="$5"
          content={
            <ul className="subscription-details">
              <li>Aut consequatur maxime aut harum repudiandae aut</li>
              <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
              <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
            </ul>
          }
        />

        {/* 🏆 Ensure Upgrade Button Renders */}
        <button className="upgrade-button">Upgrade</button>
      </main>

      {/* 🏆 Ensure Footer Renders */}
      <Footer />
    </div>
  );
};

export default SubscriptionPage;

