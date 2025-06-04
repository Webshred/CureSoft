// routes/billing.js
import express from 'express';
import InventoryItem from '../models/Inventory.js';
import Finance from '../models/Finance.js';
import Metrics from '../models/Metrics.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();


router.get('/suggestions', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const items = await Inventory.find({
      name: { $regex: query, $options: 'i' },
    }).limit(10);

    res.json(items);
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});



// GET /api/billing/suggestions?query=parac
router.get('/suggestions', async (req, res) => {
  const query = req.query.query || '';
  const items = await InventoryItem.find({
    name: { $regex: query, $options: 'i' }
  }).limit(10);
  res.json(items);
});

// POST /api/billing/checkout
router.post('/checkout', async (req, res) => {
  try {
    const { billItems, totalAmount } = req.body;

    if (!billItems || billItems.length === 0) {
      return res.status(400).json({ message: 'No bill items provided' });
    }

    // Deduct inventory stock
    for (const item of billItems) {
      const dbItem = await InventoryItem.findOne({ name: item.name });
      if (!dbItem) continue;

      dbItem.quantity = Math.max(dbItem.quantity - item.quantity, 0);
      await dbItem.save();
    }

    // Add to Finance
    await Finance.create({
      type: 'income',
      amount: totalAmount,
      category: 'Billing',
      description: `Income from billing`,
      date: new Date()
    });

    // Update Dashboard Metrics
    const latestMetrics = await Metrics.findOne().sort({ createdAt: -1 });

    const newMetrics = new Metrics({
      date: new Date(),
      income: (latestMetrics?.income || 0) + totalAmount,
      production: latestMetrics?.production || 0,
      sales: (latestMetrics?.sales || 0) + totalAmount,
      efficiency: latestMetrics?.efficiency || 100
    });

    await newMetrics.save();

    res.status(200).json({ message: 'Billing completed successfully' });
  } catch (err) {
    console.error('Billing error:', err.message);
    res.status(500).json({ message: 'Billing failed', error: err.message });
  }
});

export default router;
