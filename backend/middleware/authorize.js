// middleware/authorize.js

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is populated by the authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please authenticate first.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Unauthorized role: '${req.user.role}'. Required: one of [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
