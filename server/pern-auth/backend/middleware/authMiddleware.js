const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  console.log("🔍 Received Token:", token);  // ✅ Debugging Log

  try {
    token = token.replace("Bearer ", ""); // ✅ Remove "Bearer "
    console.log("🔍 Cleaned Token:", token);  // ✅ Debugging Log

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded); // ✅ Debugging Log

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token Verification Error:", error.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;
