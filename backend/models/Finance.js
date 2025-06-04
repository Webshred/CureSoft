import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense', 'payment'], required: true },
  amount: { type: Number, required: true },
  source: { type: String }, // e.g. "Billing", "Manual"
  note: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Finance', financeSchema);
