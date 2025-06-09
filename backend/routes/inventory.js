import express from 'express';
import InventoryItem from '../models/Inventory.js';
import authMiddleware from '../middleware/authMiddleware.js';

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

// DELETE an item by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store'); // ← Add this line
    
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted', deletedItem });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

// PATCH a field of an item
router.patch('/:id', authMiddleware, async (req, res) => {
  const updates = req.body; // Accept multiple fields at once
  

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id, 
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated', item });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ 
      message: 'Failed to update item',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


export default router;
