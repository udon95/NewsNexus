import React, { useEffect, useState } from "react";
import AdminSidebar from "./adminSideBar.jsx";
import supabase from "../../api/supabaseClient";

const AdminSubscription = () => {
  const [freeDescription, setFreeDescription] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("5");
  const [promotionActive, setPromotionActive] = useState(false);
  const [promotionEndDate, setPromotionEndDate] = useState("");
  const [premiumDescription, setPremiumDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("subscriptions").select();
      if (!error && data) {
        const free = data.find((item) => item.tier === "Free");
        const premium = data.find((item) => item.tier === "Premium");

        if (free) setFreeDescription(free.description);
        if (premium) {
          setOriginalPrice(premium.default_price || "5");
          setPremiumDescription(premium.description);

          const today = new Date().toISOString().split("T")[0];
          const isPromoActive =
            premium.promotion_active && premium.promotion_end_date >= today;

          setPromotionActive(isPromoActive);
          setPromotionPrice(isPromoActive ? premium.promotion_price : "");
          setPromotionEndDate(isPromoActive ? premium.promotion_end_date : "");
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
      const updateData = {
        default_price: originalPrice,
        description: premiumDescription,
        promotion_active: promotionActive,
        promotion_price: promotionActive ? promotionPrice : null,
        promotion_end_date: promotionActive ? promotionEndDate : null,
        effective_price: promotionActive ? promotionPrice : originalPrice,
      };
      await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("tier", "Premium");
    }
    alert("Updated successfully");
  };

  const togglePromotion = async () => {
    const isActivating = !promotionActive;
    setPromotionActive(isActivating);

    if (!isActivating) {
      setPromotionPrice("");
      setPromotionEndDate("");
    }

    const updateData = {
      promotion_active: isActivating,
      promotion_price: isActivating ? promotionPrice : null,
      promotion_end_date: isActivating ? promotionEndDate : null,
      togglePromotion: isActivating ? promotionPrice : originalPrice,
    };
    await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("tier", "Premium");
  };

  const displayBullets = (text) => {
    return text
      .split(",")
      .map((item) => `• ${item.trim()}`)
      .join("\n");
  };

  const stripBullets = (text) => {
    const lines = text.split("\n");
    const cleaned = lines
      .map((line) => line.replace(/^\s*•\s*/, "").trim())
      .filter((line) => line !== "") // this removes empty bullet lines
      .join(", ");
    return cleaned;
  };

  return (
    <div className="min-h-screen w-screen bg-[#EEF4FF] flex flex-col">
      <div className="flex flex-1 min-h-screen">
        {/* <AdminSidebar /> */}

        <div className="flex-1 px-32 py-14 font-grotesk">
          <div className="text-2xl sm:text-3xl font-bold mb-3">
            Free Subscription :
          </div>
          <div className="relative w-full max-w-[1180px]">
            <textarea
              placeholder="Description"
              value={displayBullets(freeDescription)}
              onChange={(e) => setFreeDescription(stripBullets(e.target.value))}
              className="w-full h-[180px] bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300 mb-4"
            ></textarea>
            <button
              type="button"
              className="absolute right-[-5px] bottom-[-40px] px-5 py-3 bg-[#3F414C] text-white text-sm rounded-xl hover:bg-opacity-90"
              onClick={() => handleUpdate("Free")}
            >
              Update
            </button>
          </div>

          <div className="text-2xl sm:text-3xl font-bold mt-20 mb-3">
            Premium Subscription :
          </div>
          <div className="relative w-full max-w-[1180px]">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-base text-gray-800 font-semibold whitespace-nowrap">
                Default Price :
              </label>
              <div className="w-full h-[48px] flex items-center justify-center bg-white rounded-xl shadow-md text-gray-800 font-semibold text-lg">
                ${originalPrice}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-end mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-gray-700 mb-1">
                  Promotion Price:
                </label>
                <input
                  type="text"
                  placeholder="$..."
                  value={promotionPrice}
                  onChange={(e) => setPromotionPrice(e.target.value)}
                  className="h-[48px] w-full bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-gray-700 mb-1">
                  Promotion End Date:
                </label>
                <input
                  type="date"
                  value={promotionEndDate}
                  onChange={(e) => setPromotionEndDate(e.target.value)}
                  className="h-[48px] w-full bg-white rounded-xl p-3 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="h-[48px]">
                <button
                  onClick={togglePromotion}
                  className="h-full px-5 bg-[#3F414C] text-white text-sm rounded-full hover:bg-opacity-90"
                >
                  {promotionActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>

            <textarea
              placeholder="Description"
              value={displayBullets(premiumDescription)}
              onChange={(e) =>
                setPremiumDescription(stripBullets(e.target.value))
              }
              className="w-full h-[200px] bg-white rounded-xl p-4 text-gray-800 shadow-md outline-none focus:ring-2 focus:ring-gray-300 mb-4"
            ></textarea>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-5 py-3 bg-[#3F414C] text-white text-sm rounded-xl hover:bg-opacity-90"
                onClick={() => handleUpdate("Premium")}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscription;
