const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');

// Patient statistics report
router.get('/patients/statistics',
  authenticate,
  authorize('admin', 'doctor'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let dateQuery = {};

      if (startDate || endDate) {
        dateQuery.createdAt = {};
        if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
        if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
      }

      // Total patients
      const totalPatients = await Patient.countDocuments();
      const newPatients = await Patient.countDocuments(dateQuery);

      // Gender distribution
      const genderDistribution = await Patient.aggregate([
        {
          $group: {
            _id: '$personalInfo.gender',
            count: { $sum: 1 }
          }
        }
      ]);

      // Age distribution
      const patients = await Patient.find({}, 'personalInfo.dateOfBirth');
      const ageGroups = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
      };

      patients.forEach(patient => {
        const age = calculateAge(patient.personalInfo.dateOfBirth);
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      });

      // Blood type distribution
      const bloodTypeDistribution = await Patient.aggregate([
        {
          $group: {
            _id: '$personalInfo.bloodType',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        report: {
          totalPatients,
          newPatients,
          genderDistribution,
          ageGroups,
          bloodTypeDistribution
        }
      });
    } catch (error) {
      console.error('Error generating patient report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating patient report'
      });
    }
  }
);

// Appointment statistics report
router.get('/appointments/statistics',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let dateQuery = {};

      if (startDate || endDate) {
        dateQuery.appointmentDate = {};
        if (startDate) dateQuery.appointmentDate.$gte = new Date(startDate);
        if (endDate) dateQuery.appointmentDate.$lte = new Date(endDate);
      }

      // Total appointments
      const totalAppointments = await Appointment.countDocuments(dateQuery);

      // Appointments by status
      const statusDistribution = await Appointment.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Appointments by type
      const typeDistribution = await Appointment.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      // Appointments by doctor
      const doctorAppointments = await Appointment.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$doctorId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        { $unwind: '$doctor' },
        {
          $project: {
            doctorName: {
              $concat: ['$doctor.personalInfo.firstName', ' ', '$doctor.personalInfo.lastName']
            },
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Daily appointment trend
      const dailyTrend = await Appointment.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        report: {
          totalAppointments,
          statusDistribution,
          typeDistribution,
          topDoctors: doctorAppointments,
          dailyTrend
        }
      });
    } catch (error) {
      console.error('Error generating appointment report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating appointment report'
      });
    }
  }
);

// Financial report
router.get('/financial',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let dateQuery = {};

      if (startDate || endDate) {
        dateQuery.billDate = {};
        if (startDate) dateQuery.billDate.$gte = new Date(startDate);
        if (endDate) dateQuery.billDate.$lte = new Date(endDate);
      }

      // Revenue summary
      const revenueSummary = await Bill.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$total' },
            totalPaid: { $sum: '$payment.paidAmount' },
            totalPending: { $sum: '$payment.balance' },
            billCount: { $sum: 1 }
          }
        }
      ]);

      // Revenue by payment status
      const paymentStatus = await Bill.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$payment.status',
            count: { $sum: 1 },
            amount: { $sum: '$total' }
          }
        }
      ]);

      // Revenue by service type
      const revenueByService = await Bill.aggregate([
        { $match: dateQuery },
        { $unwind: '$services' },
        {
          $group: {
            _id: '$services.serviceType',
            revenue: { $sum: '$services.totalPrice' },
            count: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      // Daily revenue trend
      const dailyRevenue = await Bill.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$billDate' }
            },
            revenue: { $sum: '$total' },
            paid: { $sum: '$payment.paidAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Payment method distribution
      const paymentMethods = await Bill.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$payment.method',
            count: { $sum: 1 },
            amount: { $sum: '$payment.paidAmount' }
          }
        }
      ]);

      res.json({
        success: true,
        report: {
          summary: revenueSummary[0] || {
            totalBilled: 0,
            totalPaid: 0,
            totalPending: 0,
            billCount: 0
          },
          paymentStatus,
          revenueByService,
          dailyRevenue,
          paymentMethods
        }
      });
    } catch (error) {
      console.error('Error generating financial report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating financial report'
      });
    }
  }
);

// Inventory report
router.get('/inventory',
  authenticate,
  authorize('admin', 'pharmacist'),
  async (req, res) => {
    try {
      // Total medicines
      const totalMedicines = await Medicine.countDocuments({ isActive: true });

      // Stock status distribution
      const lowStock = await Medicine.countDocuments({
        isActive: true,
        $expr: { $lte: ['$stock.quantity', '$stock.reorderLevel'] }
      });

      const outOfStock = await Medicine.countDocuments({
        isActive: true,
        'stock.quantity': 0
      });

      // Total inventory value
      const inventoryValue = await Medicine.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalCostValue: {
              $sum: { $multiply: ['$stock.quantity', '$pricing.costPrice'] }
            },
            totalSellingValue: {
              $sum: { $multiply: ['$stock.quantity', '$pricing.sellingPrice'] }
            }
          }
        }
      ]);

      // Stock by category
      const stockByCategory = await Medicine.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalQuantity: { $sum: '$stock.quantity' },
            totalValue: {
              $sum: { $multiply: ['$stock.quantity', '$pricing.sellingPrice'] }
            },
            itemCount: { $sum: 1 }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      // Expiring soon (within 3 months)
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const expiringSoon = await Medicine.find({
        isActive: true,
        'batchInfo.expiryDate': {
          $lte: threeMonthsFromNow,
          $gte: new Date()
        }
      }).select('name batchInfo stock');

      res.json({
        success: true,
        report: {
          totalMedicines,
          lowStock,
          outOfStock,
          inventoryValue: inventoryValue[0] || {
            totalCostValue: 0,
            totalSellingValue: 0
          },
          stockByCategory,
          expiringSoon: expiringSoon.length
        }
      });
    } catch (error) {
      console.error('Error generating inventory report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating inventory report'
      });
    }
  }
);

// Doctor performance report
router.get('/doctors/performance',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let dateQuery = {};

      if (startDate || endDate) {
        dateQuery.appointmentDate = {};
        if (startDate) dateQuery.appointmentDate.$gte = new Date(startDate);
        if (endDate) dateQuery.appointmentDate.$lte = new Date(endDate);
      }

      const doctorPerformance = await Appointment.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$doctorId',
            totalAppointments: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            noShow: {
              $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        { $unwind: '$doctor' },
        {
          $project: {
            doctorName: {
              $concat: [
                '$doctor.personalInfo.firstName',
                ' ',
                '$doctor.personalInfo.lastName'
              ]
            },
            specialization: '$doctor.professional.specialization',
            totalAppointments: 1,
            completed: 1,
            cancelled: 1,
            noShow: 1,
            completionRate: {
              $cond: [
                { $eq: ['$totalAppointments', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$completed', '$totalAppointments'] },
                    100
                  ]
                }
              ]
            }
          }
        },
        { $sort: { totalAppointments: -1 } }
      ]);

      res.json({
        success: true,
        report: doctorPerformance
      });
    } catch (error) {
      console.error('Error generating doctor performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating doctor performance report'
      });
    }
  }
);

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

module.exports = router;