import express from 'express';
import InventoryItem from '../models/Inventory.js'; // <-- important
const router = express.Router();

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new item
router.post('/', async (req, res) => {
  try {
    const newItem = new InventoryItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
