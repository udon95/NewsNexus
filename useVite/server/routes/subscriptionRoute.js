const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../supabaseClient"); // Import Supabase client

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.PRICE_ID, // Uses .env variable
          quantity: 1,
        },
      ],
      success_url:
        "http://localhost:5173/subscription-status/success?userId=${userId}",
      cancel_url: "http://localhost:5173/subscription-status/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-subscription", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    //  Update the user type to "Premium" in Supabase
    const { error } = await supabase
      .from("usertype")
      .update({ usertype: "Premium" })
      .eq("userid", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Subscription upgraded successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
