const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Create new doctor
router.post('/',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { username, email, password, personalInfo, professional, schedule, fees } = req.body;

      // Create user account
      const user = new User({
        username,
        email,
        password,
        role: 'doctor'
      });
      await user.save();

      // Create doctor profile
      const doctor = new Doctor({
        userId: user._id,
        personalInfo,
        professional,
        schedule,
        fees
      });
      await doctor.save();

      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully',
        doctor
      });
    } catch (error) {
      console.error('Doctor creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating doctor',
        error: error.message
      });
    }
  }
);

// Get all doctors
router.get('/',
  authenticate,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        specialization,
        available
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      let query = { isActive: true };

      if (specialization) {
        query['professional.specialization'] = specialization;
      }

      if (available === 'true') {
        query.isAvailable = true;
      }

      const doctors = await Doctor.find(query)
        .populate('userId', 'username email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ 'personalInfo.lastName': 1 });

      const total = await Doctor.countDocuments(query);

      res.json({
        success: true,
        doctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors'
      });
    }
  }
);

// Get doctor by ID
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id)
        .populate('userId', 'username email');

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      res.json({
        success: true,
        doctor
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctor'
      });
    }
  }
);

// Update doctor
router.put('/:id',
  authenticate,
  authorize('admin', 'doctor'),
  async (req, res) => {
    try {
      const updates = req.body;
      updates.updatedAt = new Date();

      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      res.json({
        success: true,
        message: 'Doctor updated successfully',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating doctor'
      });
    }
  }
);

// Get doctor availability
router.get('/:id/availability',
  authenticate,
  async (req, res) => {
    try {
      const { date } = req.query;
      const doctor = await Doctor.findById(req.params.id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      const requestedDate = new Date(date);
      const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Check if doctor works on this day
      if (!doctor.schedule.workDays.includes(dayName)) {
        return res.json({
          success: true,
          available: false,
          message: 'Doctor does not work on this day'
        });
      }

      // Get existing appointments for this date
      const Appointment = require('../models/Appointment');
      const appointments = await Appointment.find({
        doctorId: req.params.id,
        appointmentDate: {
          $gte: new Date(date).setHours(0, 0, 0, 0),
          $lt: new Date(date).setHours(23, 59, 59, 999)
        },
        status: { $nin: ['cancelled', 'no-show'] }
      });

      // Generate available time slots
      const slots = generateTimeSlots(
        doctor.schedule.workHours,
        doctor.schedule.consultationDuration,
        doctor.schedule.breakTime,
        appointments
      );

      res.json({
        success: true,
        available: true,
        slots
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking availability'
      });
    }
  }
);

// Helper function to generate time slots
function generateTimeSlots(workHours, duration, breakTime, bookedAppointments) {
  const slots = [];
  const start = parseTime(workHours.start);
  const end = parseTime(workHours.end);
  const breakStart = breakTime ? parseTime(breakTime.start) : null;
  const breakEnd = breakTime ? parseTime(breakTime.end) : null;

  let current = start;

  while (current + duration <= end) {
    const slotTime = formatTime(current);
    
    // Check if slot is during break time
    const isDuringBreak = breakStart && breakEnd && 
      current >= breakStart && current < breakEnd;
    
    // Check if slot is already booked
    const isBooked = bookedAppointments.some(apt => 
      apt.appointmentTime === slotTime
    );

    if (!isDuringBreak && !isBooked) {
      slots.push({
        time: slotTime,
        available: true
      });
    }

    current += duration;
  }

  return slots;
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

module.exports = router;