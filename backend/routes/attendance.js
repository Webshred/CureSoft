// backend/routes/attendance.js
import express from 'express';
import Attendance from '../models/attendance.js';
import Employee from '../models/employee.js';

const router = express.Router();

// POST attendance
router.post('/', async (req, res) => {
  const { employeeId, activityType } = req.body;
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hourNow = now.getHours();
    const startHour = parseInt(employee.workHours?.start?.split(':')[0] || '8');

    let status = 'present';
    if (activityType === 'leave') {
      status = 'leave';
    } else if (activityType === 'check-in' && hourNow > startHour) {
      status = 'late';
    }

    const newAttendance = new Attendance({
      employeeId,
      name: employee.name,
      activityType,
      status,
      timestamp: now,
      date
    });

    await newAttendance.save();
    res.status(201).json(newAttendance);
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all attendance
router.get('/', async (req, res) => {
  try {
    const data = await Attendance.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

export default router;
