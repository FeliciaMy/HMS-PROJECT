const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Create new patient
router.post('/', 
  authenticate, 
  authorize('admin', 'doctor', 'nurse'),
  async (req, res) => {
    try {
      const { username, email, password, personalInfo, emergencyContact, allergies } = req.body;

      // Create user account
      const user = new User({
        username,
        email,
        password,
        role: 'patient'
      });
      await user.save();

      // Create patient profile
      const patient = new Patient({
        userId: user._id,
        personalInfo,
        emergencyContact,
        allergies: allergies || []
      });
      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        patient
      });
    } catch (error) {
      console.error('Patient creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating patient',
        error: error.message
      });
    }
  }
);

// Get all patients (with pagination)
router.get('/', 
  authenticate, 
  authorize('admin', 'doctor', 'nurse'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const patients = await Patient.find()
        .populate('userId', 'username email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Patient.countDocuments();

      res.json({
        success: true,
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patients'
      });
    }
  }
);

// Get patient by ID
router.get('/:id', 
  authenticate,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id)
        .populate('userId', 'username email');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching patient'
      });
    }
  }
);

// Update patient
router.put('/:id', 
  authenticate, 
  authorize('admin', 'doctor', 'nurse'),
  async (req, res) => {
    try {
      const updates = req.body;
      updates.updatedAt = new Date();

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient updated successfully',
        patient
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating patient'
      });
    }
  }
);

// Search patients
router.get('/search/query', 
  authenticate,
  async (req, res) => {
    try {
      const { name, patientId, phone } = req.query;
      let query = {};

      if (name) {
        query.$or = [
          { 'personalInfo.firstName': new RegExp(name, 'i') },
          { 'personalInfo.lastName': new RegExp(name, 'i') }
        ];
      }

      if (patientId) {
        query.patientId = new RegExp(patientId, 'i');
      }

      if (phone) {
        query['personalInfo.phone'] = new RegExp(phone, 'i');
      }

      const patients = await Patient.find(query)
        .populate('userId', 'username email')
        .limit(20);

      res.json({
        success: true,
        count: patients.length,
        patients
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching patients'
      });
    }
  }
);

module.exports = router;