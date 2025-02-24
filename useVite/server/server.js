require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Use fetch correctly depending on Node.js version
let fetch;
if (typeof globalThis.fetch !== "function") {
  fetch = require("node-fetch"); // Required for Node.js 16 or below
} else {
  fetch = globalThis.fetch; // Use built-in fetch for Node.js 18+
}

const app = express();
app.use(express.json());
app.use(cors());

const OXFORD_API_URL = "https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/";
const OXFORD_APP_ID = process.env.OXFORD_APP_ID;
const OXFORD_APP_KEY = process.env.OXFORD_APP_KEY;

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

// 🔹 Oxford Dictionary API Proxy (Fix CORS Issue)
app.get("api/define/:word", async (req, res) => {
  const word = req.params.word.toLowerCase();

  console.log(`Fetching definition for: ${word}`); // Debugging log

  try {
    const response = await fetch(`${OXFORD_API_URL}${word}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "app_id": OXFORD_APP_ID,
        "app_key": OXFORD_APP_KEY,
      },
    });

    console.log(`Oxford API Response Status: ${response.status}`); // Debugging log

    if (!response.ok) {
      return res.status(404).json({ error: `Oxford Dictionary could not find "${word}".` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Oxford API Error:", error);
    res.status(500).json({ error: "Server error while fetching word definition." });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
