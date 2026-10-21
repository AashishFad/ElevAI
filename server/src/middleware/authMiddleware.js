const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is missing.',
    });
  }

  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }

  // Attach safe user payload to request
  req.user = {
    userId: decoded.userId,
    id: decoded.userId,
    role: decoded.role || 'USER',
    email: decoded.email,
  };

  next();
}

module.exports = authMiddleware;
