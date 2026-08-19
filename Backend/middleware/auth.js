const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["x-access-token"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  // Handle both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const secret = process.env.JWT_SECRET || "inventory_secret_jwt_key_2026_super_secure";
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = { verifyToken };
