// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  // Token is usually sent as: "Bearer <token>", so split and get token part
  const token = req.headers.authorization?.split(' ')[1];


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded = { id: user._id, iat: ..., exp: ... }
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
