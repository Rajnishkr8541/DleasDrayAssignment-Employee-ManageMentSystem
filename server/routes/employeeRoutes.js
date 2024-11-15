import express from 'express';
import Employee from '../models/Employee.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Add this line

const __filename = fileURLToPath(import.meta.url); // Add this line
const __dirname = path.dirname(__filename); // Add this line

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads'); // Absolute path to uploads directory
    // Ensure the uploads directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // set a unique filename
  },
});

const upload = multer({ storage });

// Toggle active status - Ensure this route is defined before other PUT routes to prevent conflicts
router.put('/:id/active', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Toggling active status for employee ID: ${id}`); // Added logging

    const employee = await Employee.findById(id);

    if (!employee) {
      console.log(`Employee not found with ID: ${id}`); // Added logging
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.active = !employee.active;
    await employee.save();

    res.json({ message: 'Employee status updated', active: employee.active });
  } catch (error) {
    console.error(`Error toggling employee status for ID ${req.params.id}:`, error); // Enhanced error logging
    res.status(500).json({ message: 'Failed to toggle employee status', error: error.message });
  }
});

// Get all employees with search, pagination, and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortField = 'createDate', sortOrder = 'asc' } = req.query;

    let query = {};

    if (search.trim() !== '') {
      const searchWords = search.trim().split(/\s+/);
      query = {
        $or: searchWords.map((word) => ({
          name: { $regex: word, $options: 'i' },
        })),
      };
    }

    const totalEmployees = await Employee.countDocuments(query);
    const totalActiveEmployees = await Employee.countDocuments({ ...query, active: true });

    const employees = await Employee.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ employees, totalEmployees, totalActiveEmployees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
});

// Create a new employee with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, email, mobile, designation, gender, course } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : ''; // Updated image path

    // Create a new Employee instance with the uploaded image path
    const newEmployee = new Employee({
      name,
      email,
      mobile,
      designation,
      gender,
      course: Array.isArray(course) ? course : [course], // Ensure course is an array
      image: imagePath, // store relative image path
    });

    await newEmployee.save();
    res.status(201).json({
      message: 'Employee added successfully',
      employee: newEmployee, // Return the new employee data
    });
  } catch (error) {
    console.error('Error adding employee:', error.message); // Enhanced error logging
    res.status(400).json({ message: 'Failed to add employee', error: error.message });
  }
});

// Get an employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
  }
});

// Update an employee by ID with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    let updatedData = req.body;
    
    if (req.file) {
      updatedData.image = `uploads/${req.file.filename}`; // Correct: relative path
    }

    if (updatedData.course && Array.isArray(updatedData.course)) {
      // Remove duplicate courses
      updatedData.course = [...new Set(updatedData.course)];
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, { new: true });
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
});

// Delete an employee by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
});

export default router;
