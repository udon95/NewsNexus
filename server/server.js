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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ include PUT here
    allowedHeaders: ["Content-Type", "Authorization"],     // add other headers if needed
    // origin: "http://localhost:5173", // localhost frontend
    credentials: true, // Allow cookies & authentication headers
  })
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const fs = require("fs");
const visionKey = process.env.GOOGLE_VISION_KEY_JSON;
const keyPath = "/tmp/google-vision-key.json";

if (visionKey) {
  fs.writeFileSync(keyPath, visionKey);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

  // Debug logs (remove after testing)
  console.log("[Google Vision] Key file written to:", keyPath);
  console.log("[Google Vision] ENV matches:", process.env.GOOGLE_APPLICATION_CREDENTIALS === keyPath);
} else {
  console.error("[Google Vision] ❌ GOOGLE_VISION_KEY_JS not found in environment.");
}


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoute);
app.use("/subscription", subscriptionRoutes);
app.use("/api", aiRoute);
app.use("/translate", translateRoute);
app.use("/rooms", roomRoute);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
