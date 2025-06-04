// models/Inventory.js
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  quantity: { type: Number, required: true, min: 0 },
  unit: String,
  minQuantity: { type: Number, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  location: String,
  notes: String
}, { timestamps: true }); // adds createdAt and updatedAt automatically

export default mongoose.model('InventoryItem', inventorySchema);
