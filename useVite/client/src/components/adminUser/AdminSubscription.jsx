import React, { useEffect, useState } from "react";
import AdminSidebar from "./adminSideBar.jsx";
import supabase from "../../api/supabaseClient";

const AdminSubscription = () => {
  const [freeDescription, setFreeDescription] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [premiumDescription, setPremiumDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("subscriptions").select();
      if (!error && data) {
        const free = data.find((item) => item.tier === "Free");
        const premium = data.find((item) => item.tier === "Premium");

        if (free) setFreeDescription(free.description);
        if (premium) {
          setPremiumPrice(premium.price);
          setPremiumDescription(premium.description);
        }
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (tier) => {
    if (tier === "Free") {
      await supabase
        .from("subscriptions")
        .update({ description: freeDescription })
        .eq("tier", "Free");
    } else if (tier === "Premium") {
      await supabase
        .from("subscriptions")
        .update({ price: premiumPrice, description: premiumDescription })
        .eq("tier", "Premium");
    }
    alert("Updated successfully");
  };

  const displayBullets = (text) => {
    return text
      .split(',')
      .map((item) => `\u2022 ${item.trim()}`)
      .join("\n");
  };

  const stripBullets = (text) => {
    return text
      .split("\n")
      .map((line) => line.replace(/^\s*\u2022\s*/, ""))
      .join(", ");
  };

  return (
    <div className="flex min-h-screen w-screen bg-[#EEF4FF]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 px-32 py-14 font-grotesk">
        {/* Free Subscription Section */}
        <div className="text-2xl sm:text-3xl font-bold mb-3">Free Subscription :</div>
        <div className="relative w-full max-w-[1180px]">
          <textarea
            placeholder="Description"
            value={displayBullets(freeDescription)}
            onChange={(e) => setFreeDescription(stripBullets(e.target.value))}
            className="w-full h-[150px] bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300"
          ></textarea>
          <button
            type="button"
            className="absolute right-[-5px] bottom-[-40px] px-5 py-1.5 bg-[#3F414C] text-white text-sm rounded-md hover:bg-opacity-90"
            onClick={() => handleUpdate("Free")}
          >
            Update
          </button>
        </div>

        {/* Premium Subscription Section */}
        <div className="text-2xl sm:text-3xl font-bold mt-20 mb-3">Premium Subscription :</div>
        <div className="relative w-full max-w-[1180px]">
          <input
            placeholder="Price"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            className="w-full h-[48px] bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300 mb-4"
          />
          <textarea
            placeholder="Description"
            value={displayBullets(premiumDescription)}
            onChange={(e) => setPremiumDescription(stripBullets(e.target.value))}
            className="w-full h-[150px] bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300"
          ></textarea>
          <button
            type="button"
            className="absolute right-[-5px] bottom-[-40px] px-5 py-1.5 bg-[#3F414C] text-white text-sm rounded-md hover:bg-opacity-90"
            onClick={() => handleUpdate("Premium")}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscription;
