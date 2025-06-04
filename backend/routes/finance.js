// backend/routes/finance.js
import express from 'express';
const router = express.Router();
import Finance from '../models/Finance.js';

// GET all finance records
router.get('/', async (req, res) => {
  const records = await Finance.find().sort({ date: -1 });
  res.json(records);
});

// POST new transaction
router.post('/', async (req, res) => {
  try {
    const newEntry = new Finance(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Error saving finance entry:', err.message);
    res.status(500).json({ message: 'Save failed', error: err.message });
  }
});

export default router;
