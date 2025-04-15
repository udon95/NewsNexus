require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authRoute = require("./routes/authRoute");
const { createClient } = require("@supabase/supabase-js");

// Use fetch correctly depending on Node.js version
let fetch;
if (typeof globalThis.fetch !== "function") {
  fetch = require("node-fetch"); // Required for Node.js 16 or below
} else {
  fetch = globalThis.fetch; // Use built-in fetch for Node.js 18+
}






const roomRoutes = require("./manageroomRoute"); 

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/rooms", roomRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});






const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only frontend requests
    credentials: true, // Allow cookies & authentication headers
  })
);





const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use("/auth", authRoute);

app.post("/create-checkout-session", async (req, res) => {
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
      success_url: "http://localhost:5173/subscription-status/success",
      cancel_url: "http://localhost:5173/subscription-status/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
