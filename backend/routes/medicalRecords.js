const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

// Create new medical record
router.post('/',
  authenticate,
  authorize('doctor'),
  async (req, res) => {
    try {
      const {
        patientId,
        visitType,
        chiefComplaint,
        symptoms,
        diagnosis,
        physicalExamination,
        labTests,
        prescriptions,
        treatmentPlan,
        procedures,
        followUp,
        notes
      } = req.body;

      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const medicalRecord = new MedicalRecord({
        patientId,
        doctorId: req.user._id, // Assuming doctor is creating the record
        visitType,
        chiefComplaint,
        symptoms,
        diagnosis,
        physicalExamination,
        labTests,
        prescriptions,
        treatmentPlan,
        procedures,
        followUp,
        notes
      });

      await medicalRecord.save();

      res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        record: medicalRecord
      });
    } catch (error) {
      console.error('Medical record creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating medical record',
        error: error.message
      });
    }
  }
);

// Get medical records by patient ID
router.get('/patient/:patientId',
  authenticate,
  authorize('doctor', 'nurse', 'admin'),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const records = await MedicalRecord.find({ patientId })
        .populate('doctorId', 'personalInfo.firstName personalInfo.lastName professional.specialization')
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await MedicalRecord.countDocuments({ patientId });

      res.json({
        success: true,
        records,
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
        message: 'Error fetching medical records'
      });
    }
  }
);

// Get single medical record
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id)
        .populate('patientId', 'personalInfo')
        .populate('doctorId', 'personalInfo professional');

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      res.json({
        success: true,
        record
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching medical record'
      });
    }
  }
);

// Update medical record
router.put('/:id',
  authenticate,
  authorize('doctor'),
  async (req, res) => {
    try {
      const updates = req.body;
      updates.updatedAt = new Date();

      const record = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Medical record not found'
        });
      }

      res.json({
        success: true,
        message: 'Medical record updated successfully',
        record
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating medical record'
      });
    }
  }
);

// Get patient medical history summary
router.get('/patient/:patientId/summary',
  authenticate,
  async (req, res) => {
    try {
      const { patientId } = req.params;

      // Get all records for the patient
      const records = await MedicalRecord.find({ patientId })
        .sort({ visitDate: -1 });

      // Compile summary
      const summary = {
        totalVisits: records.length,
        lastVisit: records[0]?.visitDate,
        chronicConditions: [],
        allergies: [],
        currentMedications: [],
        recentDiagnoses: records.slice(0, 5).map(r => ({
          date: r.visitDate,
          diagnosis: r.diagnosis.primary,
          doctor: r.doctorId
        }))
      };

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating medical summary'
      });
    }
  }
);

module.exports = router;