const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../supabaseClient"); // Import Supabase client

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, subscriptionId } = req.body;

    // 1) fetch the subscription row
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select(
        "tier, default_price, promotion_price, promotion_active, promotion_end_date, effective_price"
      )
      .eq("id", subscriptionId)
      .single();
  
    if (subErr) throw subErr;
  
    // 2) decide which price to charge
    const now = new Date();
    const promoStillValid =
      sub.promotion_active &&
      sub.promotion_price != null &&
      new Date(sub.promotion_end_date) >= now;
  
    
    const priceToUse =
      sub.effective_price ??
      (promoStillValid ? sub.promotion_price : sub.default_price);
  
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "sgd", // Make sure this matches the currency you're using
            product_data: {
              name: "Premium Subscription", // You can customize this to your needs
            },
            unit_amount: priceToUse * 100, // Stripe expects the price in cents, so multiply by 100
            recurring: {interval: "month"},
          },
          quantity: 1,
        },
      ],
      success_url:
        `https://van.dpyq2cohucoc7.amplifyapp.com/subscription-status/success?userId=${userId}`,
      cancel_url: "https://van.dpyq2cohucoc7.amplifyapp.com/subscription-status/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error); // Log any server error

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

router.post("/unsubscribe", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Unsubscribe logic - Update the user's subscription status in Supabase
    const { error } = await supabase
      .from("usertype")
      .update({ usertype: "Free" })
      .eq("userid", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: "Successfully unsubscribed." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
