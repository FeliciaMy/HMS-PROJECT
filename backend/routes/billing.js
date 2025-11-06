const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');

// Create new bill
router.post('/',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  async (req, res) => {
    try {
      const {
        patientId,
        appointmentId,
        medicalRecordId,
        services,
        tax,
        discount,
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

      const bill = new Bill({
        patientId,
        appointmentId,
        medicalRecordId,
        services,
        tax,
        discount,
        notes,
        generatedBy: req.user._id
      });

      await bill.save();

      res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        bill
      });
    } catch (error) {
      console.error('Bill creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bill',
        error: error.message
      });
    }
  }
);

// Get all bills with filtering
router.get('/',
  authenticate,
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        patientId
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      let query = {};

      if (status) {
        query['payment.status'] = status;
      }

      if (patientId) {
        query.patientId = patientId;
      }

      if (startDate || endDate) {
        query.billDate = {};
        if (startDate) query.billDate.$gte = new Date(startDate);
        if (endDate) query.billDate.$lte = new Date(endDate);
      }

      const bills = await Bill.find(query)
        .populate('patientId', 'personalInfo patientId')
        .populate('generatedBy', 'username role')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ billDate: -1 });

      const total = await Bill.countDocuments(query);

      // Calculate financial summary
      const summary = await Bill.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$total' },
            totalPaid: { $sum: '$payment.paidAmount' },
            totalBalance: { $sum: '$payment.balance' }
          }
        }
      ]);

      res.json({
        success: true,
        bills,
        summary: summary[0] || { totalBilled: 0, totalPaid: 0, totalBalance: 0 },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching bills:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bills'
      });
    }
  }
);

// Get bill by ID
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const bill = await Bill.findById(req.params.id)
        .populate('patientId', 'personalInfo patientId')
        .populate('appointmentId')
        .populate('generatedBy', 'username');

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      res.json({
        success: true,
        bill
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching bill'
      });
    }
  }
);

// Record payment
router.post('/:id/payment',
  authenticate,
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const { amount, method, reference } = req.body;
      const bill = await Bill.findById(req.params.id);

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment amount'
        });
      }

      if (bill.payment.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount exceeds balance'
        });
      }

      // Add transaction
      bill.payment.transactions.push({
        transactionId: 'TXN' + Date.now(),
        date: new Date(),
        amount,
        method,
        reference
      });

      // Update paid amount
      bill.payment.paidAmount += amount;
      bill.payment.method = method;
      bill.updatedAt = new Date();

      await bill.save();

      res.json({
        success: true,
        message: 'Payment recorded successfully',
        bill
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording payment'
      });
    }
  }
);

// Get pending bills
router.get('/status/pending',
  authenticate,
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const pendingBills = await Bill.find({
        'payment.status': { $in: ['pending', 'partial'] }
      })
        .populate('patientId', 'personalInfo patientId')
        .sort({ dueDate: 1 });

      const totalPending = pendingBills.reduce((sum, bill) => sum + bill.payment.balance, 0);

      res.json({
        success: true,
        count: pendingBills.length,
        totalPending,
        bills: pendingBills
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching pending bills'
      });
    }
  }
);

// Get overdue bills
router.get('/status/overdue',
  authenticate,
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const overdueBills = await Bill.find({
        'payment.status': { $in: ['pending', 'partial'] },
        dueDate: { $lt: new Date() }
      })
        .populate('patientId', 'personalInfo patientId')
        .sort({ dueDate: 1 });

      res.json({
        success: true,
        count: overdueBills.length,
        bills: overdueBills
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching overdue bills'
      });
    }
  }
);

module.exports = router;