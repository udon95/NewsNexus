import React from "react";
import Navbar from "../components/navBar";
import SubscriptionCard from "../components/subscriptionCard";

const SubscriptionPage = () => {
  return (
    <div className="flex flex-col items-center w-full min-w-screen min-h-screen bg-white">
      <Navbar />

      <main className="w-full max-w-4xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-semibold mb-8 font-grotesk text-left">Monthly Subscription</h1>

        {/* Subscription Cards */}
        <div className="flex flex-col w-full items-center space-y-10">
          <SubscriptionCard
            title="Free"
            content={
              <ul className="list-disc pl-6 text-lg">
                <li>Aut consequatur maxime aut harum repudiandae aut</li>
                <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
                <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
              </ul>
            }
          />

          <SubscriptionCard
            title="$5"
            content={
              <ul className="list-disc pl-6 text-lg">
                <li>Aut consequatur maxime aut harum repudiandae aut</li>
                <li>Est magnam vitae qui reiciendis nihil qui saepe nisi et soluta adipisci qui autem aperiam et reprehenderit</li>
                <li>Et consequuntur aspernatur et eius ipsam et harum.</li>
              </ul>
            }
          />

          {/* Upgrade Button */}
          <button className="bg-[#3F414C] text-white p-3 rounded-lg cursor-pointer text-sm self-end">
            Upgrade
          </button>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
