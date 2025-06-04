// backend/models/employee.js
import mongoose from 'mongoose';


const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String }, // <-- add this
  workHours: {
    start: { type: String },
    end: { type: String }
  }
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);