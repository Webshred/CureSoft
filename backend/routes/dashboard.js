import express from 'express';
import Metrics from '../models/Metrics.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is invalid or expired' });
    req.user = user;
    next();
  });
}

// GET /api/dashboard/metrics - returns all metrics sorted by date ascending
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await Metrics.find().sort({ date: 1 });
    res.json(metrics);
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
});

export default router;
