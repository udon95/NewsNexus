import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../api/supabaseClient"; // Ensure this is added

const Navbar = () => {
  const [isPromoActive, setIsPromoActive] = useState(false);

  useEffect(() => {
    const checkPromotion = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("promotion_active, promotion_end_date")
        .eq("tier", "Premium")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // safer than single()

      console.log("PROMO CHECK:", data); // for debugging

      if (data?.promotion_active && new Date(data.promotion_end_date) > new Date()) {
        setIsPromoActive(true);
      } else {
        setIsPromoActive(false);
      }
    };

    checkPromotion();
  }, []);

  return (
    <nav className="w-full bg-[#BFD8FF] py-3 font-grotesk shadow-md overflow-x-auto">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-14 sm:px-6 md:px-8 lg:px-12 gap-2 sm:gap-4 text-blue-900 text-lg whitespace-nowrap">
        <div className="border-l border-blue-900 h-6"></div>
        <Link to="/" className="hover:underline px-4 sm:px-6 font-bold">Home</Link>
        <div className="border-l border-blue-900 h-6"></div>
        <Link to="/explore" className="hover:underline px-4 sm:px-6 font-bold">Explore</Link>
        <div className="border-l border-blue-900 h-6"></div>

        {/* Subscription link with red dot if promo active */}
        <Link to="/subscription" className="relative hover:underline px-4 sm:px-6 font-bold">
          Subscription
          {isPromoActive && (
            <span className="absolute -top-0.2 -right-0.48 w-2.5 h-2.5 rounded-full bg-red-600"></span>
          )}
        </Link>

        <div className="border-l border-blue-900 h-6"></div>
        <Link to="/guidelines" className="hover:underline px-4 sm:px-6 font-bold">Platform Guidelines</Link>
        <div className="border-l border-blue-900 h-6"></div>
      </div>
    </nav>
  );
};

export default Navbar;
