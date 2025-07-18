// Protects routes using JWT.

// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // console.log("hii");
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

//  Middleware for role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

// const authorizeRoles = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles ===(req.user.role)) {
//       return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
//     }
//     next();
//   };
// };

module.exports = {authenticate, authorizeRoles };
