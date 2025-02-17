const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to log in an existing user
router.post("/login", loginUser);

// Secure Route: Get User Profile (Protected)
router.get("/profile", verifyToken, async (req, res) => {
    res.json({ message: "Profile data", user: req.user });
  });

// Secure route: Admin feature
router.get("/admin-dashboard", verifyToken, adminOnly, (req, res) => {
    res.json({ message: "Welcome, Admin!", user: req.user });
  });

module.exports = router;
