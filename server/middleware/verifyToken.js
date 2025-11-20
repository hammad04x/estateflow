const jwt = require('jsonwebtoken');
const connection = require('../connection/connection');
const { ACCESS_TOKEN_SECRET } = require('../utils/jwtUtils');

// ALWAYS returns array
function safeRoleParse(role) {
  try {
    const parsed = JSON.parse(role);       // "[\"admin\"]" → ["admin"]
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [role];                         // "admin" → ["admin"]
  }
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { jti, id: userId, role } = decoded;

    connection.query(
      "SELECT * FROM active_tokens WHERE token_id = ? AND user_id = ? AND is_blacklisted = 0",
      [jti, userId],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0)
          return res.status(401).json({ error: "Token invalidated" });

        req.user = {
          id: userId,
          jti,
          role: safeRoleParse(role),   // ALWAYS REAL ARRAY
        };

        next();
      }
    );
  });
};

module.exports = verifyToken;
