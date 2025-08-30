const jwt = require('jsonwebtoken');
const { query } = require('../db');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    
    // Log token validation for debugging (remove in production)
    console.log(`🔍 Token validated for user ID: ${decoded.id}, Role: ${decoded.role}`);
    
    // Get user from database to ensure they still exist
    const user = await query('SELECT id, email, role, name FROM users WHERE id = $1', [decoded.id]);
    
    if (user.rows.length === 0) {
      console.log(`❌ User not found in database: ${decoded.id}`);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user has required role
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
}; 