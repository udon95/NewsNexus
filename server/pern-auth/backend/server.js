require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes"); // Import articles routes

const app = express();

app.use(express.json()); // Allows JSON request bodies
app.use(cors());
app.use(helmet());
app.use("/api/articles", articleRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Ensure routes are correctly mounted
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
