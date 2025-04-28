require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const subscriptionRoutes = require("./routes/subscriptionRoute");
const aiRoute = require("./routes/aiRoute");
const translateRoute = require("./routes/translateRoute");
const roomRoute = require("./routes/roomRoute");
const { createClient } = require("@supabase/supabase-js");

// Use fetch correctly depending on Node.js version
let fetch;
if (typeof globalThis.fetch !== "function") {
  fetch = require("node-fetch"); // Required for Node.js 16 or below
} else {
  fetch = globalThis.fetch; // Use built-in fetch for Node.js 18+
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://van.dpyq2cohucoc7.amplifyapp.com", //For Hosted 
    // origin: "http://localhost:5173", // localhost frontend 
    credentials: true, // Allow cookies & authentication headers
  })
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use("/auth", authRoute);
app.use("/subscription", subscriptionRoutes);
app.use("/api", aiRoute);
app.use("/translate", translateRoute);
app.use("/rooms", roomRoute);

app.use("/test", require("./routes/testaai"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);
