import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
    try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update user profile
router.patch('/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateFields = req.body;

    if (!userId) return res.status(400).json({ message: 'User ID missing from token' });

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
