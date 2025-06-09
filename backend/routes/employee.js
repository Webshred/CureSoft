// backend/routes/employee.js
import express from 'express';
import Employee from '../models/employee.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const { name, position, workHours } = req.body;
    const employee = new Employee({ name, position, workHours });
    await employee.save();
    res.status(201).json(employee);
  }catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single employee by ID
router.get('/:id', getEmployee, (req, res) => {
  res.json(res.employee);
});

// Update an employee
router.put('/:id', getEmployee, async (req, res) => {
  Object.assign(res.employee, req.body);
  try {
    const updatedEmployee = await res.employee.save();
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error while deleting employee' });
  }
});

// Middleware to get employee by ID
async function getEmployee(req, res, next) {
  let employee;
  try {
    employee = await Employee.findById(req.params.id);
    if (employee == null) {
      return res.status(404).json({ message: 'Cannot find employee' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.employee = employee;
  next();
}

export default router;

