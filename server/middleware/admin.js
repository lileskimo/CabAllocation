// admin.js - ensures only admins can access certain routes
module.exports = function (req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Admin access required' });
};
