import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  income: { type: Number, required: true },
  production: { type: Number, required: true },
  sales: { type: Number, required: true },
  efficiency: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now }
});

export default mongoose.model('Metrics', metricSchema);
