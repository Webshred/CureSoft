// backend/models/attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['present', 'late', 'leave'], required: true },
  activityType: { type: String, enum: ['check-in', 'check-out', 'leave'], required: true },
  timestamp: { type: Date, default: Date.now },
  date: { type: String, required: true }, // formatted as YYYY-MM-DD
}, {
  timestamps: true
});

export default mongoose.model('Attendance', attendanceSchema);
