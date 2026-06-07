const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload (id, email, role) to the request object
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = {
  authenticateToken
};
