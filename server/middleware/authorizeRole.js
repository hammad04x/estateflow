module.exports = (...allowedRoles) => {
  return (req, res, next) => {

    const roles = req.user?.role;   // already array

    if (!roles || !Array.isArray(roles)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const isAllowed = roles.some((r) => allowedRoles.includes(r));

    if (!isAllowed) {
      return res.status(403).json({ 
        error: "Forbidden — permission denied" 
      });
    }

    next();
  };
};
