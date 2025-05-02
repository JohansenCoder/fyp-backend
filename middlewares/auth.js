const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    // Check if token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token.' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach the user data to the request
      req.user = decoded; // { id, role }
  
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
  };


// Only allow certain roles to proceed
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};
