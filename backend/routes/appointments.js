const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Helper: parse HH:MM to minutes since midnight
function parseTimeToMinutes(timeStr) {
	if (!timeStr || typeof timeStr !== 'string') return null;
	const parts = timeStr.split(':').map(Number);
	if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
	return parts[0] * 60 + parts[1];
}

// Helper: detect conflicts for a doctor on a specific date
async function hasConflict({ doctorId, appointmentDate, appointmentTime, duration = 30, excludeId = null }) {
	// Normalize date to midnight for querying same-day appointments
	const d = new Date(appointmentDate);
	const dayStart = new Date(d.setHours(0, 0, 0, 0));
	const dayEnd = new Date(d.setHours(23, 59, 59, 999));

	// Fetch same-day appointments for the doctor, excluding cancelled/no-show
	const existing = await Appointment.find({
		doctorId,
		appointmentDate: { $gte: dayStart, $lt: dayEnd },
		status: { $nin: ['cancelled', 'no-show'] }
	});

	const reqStart = parseTimeToMinutes(appointmentTime);
	const reqEnd = reqStart + Number(duration || 30);

	for (const apt of existing) {
		if (excludeId && String(apt._id) === String(excludeId)) continue;
		const exStart = parseTimeToMinutes(apt.appointmentTime);
		const exDur = Number(apt.duration || 30);
		const exEnd = exStart + exDur;

		// Overlap if request starts before existing end and existing starts before request end
		if (reqStart < exEnd && exStart < reqEnd) {
			return { conflict: true, conflictingAppointment: apt };
		}
	}

	return { conflict: false };
}

// List appointments with optional filters (date, doctorId, patientId, status)
router.get('/', authenticate, async (req, res) => {
	try {
		const { doctorId, patientId, status, date, page = 1, limit = 25 } = req.query;
		const query = {};

		if (doctorId) query.doctorId = doctorId;
		if (patientId) query.patientId = patientId;
		if (status) query.status = status;
		if (date) {
			const d = new Date(date);
			query.appointmentDate = {
				$gte: new Date(d.setHours(0, 0, 0, 0)),
				$lt: new Date(d.setHours(23, 59, 59, 999))
			};
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const appointments = await Appointment.find(query)
			.populate('patientId', 'userId personalInfo')
			.populate('doctorId', 'userId personalInfo professional')
			.sort({ appointmentDate: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Appointment.countDocuments(query);

		res.json({ success: true, total, count: appointments.length, appointments });
	} catch (error) {
		console.error('Error fetching appointments:', error);
		res.status(500).json({ success: false, message: 'Error fetching appointments' });
	}
});

// Create appointment
router.post('/', authenticate, authorize('admin', 'receptionist', 'patient'), async (req, res) => {
	try {
		const {
			patientId: bodyPatientId,
			doctorId,
			appointmentDate,
			appointmentTime,
			duration = 30,
			type,
			reason,
			symptoms
		} = req.body;

		// Resolve patientId: if requester is a patient, use their patient profile
		let patientId = bodyPatientId;
		if (req.user.role === 'patient') {
			const patient = await Patient.findOne({ userId: req.user._id });
			if (!patient) return res.status(400).json({ success: false, message: 'Patient profile not found' });
			patientId = patient._id;
		}

		if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

			// Basic existence checks
			const doctor = await Doctor.findById(doctorId);
			if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

			// Conflict detection: prevent double-booking for the doctor
			const conflictCheck = await hasConflict({ doctorId, appointmentDate, appointmentTime, duration });
			if (conflictCheck.conflict) {
				return res.status(409).json({
					success: false,
					message: 'Appointment time conflicts with an existing appointment',
					conflictingAppointment: conflictCheck.conflictingAppointment
				});
			}

			// Create and save
			const appointment = new Appointment({
			patientId,
			doctorId,
			appointmentDate: new Date(appointmentDate),
			appointmentTime,
			duration,
			type,
			reason,
			symptoms: symptoms || [],
			createdBy: req.user._id
		});

		await appointment.save();

		res.status(201).json({ success: true, message: 'Appointment created', appointment });
	} catch (error) {
		console.error('Appointment creation error:', error);
		res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
	}
});

// Get appointment by ID
router.get('/:id', authenticate, async (req, res) => {
	try {
		const appointment = await Appointment.findById(req.params.id)
			.populate('patientId', 'userId personalInfo')
			.populate('doctorId', 'userId personalInfo professional');

		if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

		// If patient role, ensure they can only access their own appointment
		if (req.user.role === 'patient') {
			const patient = await Patient.findOne({ userId: req.user._id });
			if (!patient || String(patient._id) !== String(appointment.patientId._id)) {
				return res.status(403).json({ success: false, message: 'Access denied' });
			}
		}

		res.json({ success: true, appointment });
	} catch (error) {
		console.error('Error fetching appointment:', error);
		res.status(500).json({ success: false, message: 'Error fetching appointment' });
	}
});

// Update (reschedule or edit) appointment
router.put('/:id', authenticate, authorize('admin', 'receptionist', 'patient', 'doctor'), async (req, res) => {
	try {
		const updates = req.body;
		updates.updatedAt = new Date();

		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

		// If patient, ensure they own the appointment
		if (req.user.role === 'patient') {
			const patient = await Patient.findOne({ userId: req.user._id });
			if (!patient || String(patient._id) !== String(appointment.patientId)) {
				return res.status(403).json({ success: false, message: 'Access denied' });
			}
		}

			// If updating time/date/duration/doctor, check conflicts
			const newDoctorId = updates.doctorId || appointment.doctorId;
			const newAppointmentDate = updates.appointmentDate || appointment.appointmentDate;
			const newAppointmentTime = updates.appointmentTime || appointment.appointmentTime;
			const newDuration = updates.duration || appointment.duration;

			const conflictCheck = await hasConflict({
				doctorId: newDoctorId,
				appointmentDate: newAppointmentDate,
				appointmentTime: newAppointmentTime,
				duration: newDuration,
				excludeId: appointment._id
			});

			if (conflictCheck.conflict) {
				return res.status(409).json({
					success: false,
					message: 'Updated appointment conflicts with an existing appointment',
					conflictingAppointment: conflictCheck.conflictingAppointment
				});
			}

			Object.assign(appointment, updates);
			await appointment.save();

		res.json({ success: true, message: 'Appointment updated', appointment });
	} catch (error) {
		console.error('Error updating appointment:', error);
		res.status(500).json({ success: false, message: 'Error updating appointment' });
	}
});

// Update appointment status (e.g., cancel, confirm, complete)
router.patch('/:id/status', authenticate, authorize('admin', 'receptionist', 'doctor', 'patient'), async (req, res) => {
	try {
		const { status, cancelReason } = req.body;
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

		// Patient may only cancel their own appointment
		if (req.user.role === 'patient') {
			const patient = await Patient.findOne({ userId: req.user._id });
			if (!patient || String(patient._id) !== String(appointment.patientId)) {
				return res.status(403).json({ success: false, message: 'Access denied' });
			}
		}

		if (status) appointment.status = status;
		if (cancelReason) appointment.cancelReason = cancelReason;
		appointment.updatedAt = new Date();

		await appointment.save();

		res.json({ success: true, message: 'Appointment status updated', appointment });
	} catch (error) {
		console.error('Error updating appointment status:', error);
		res.status(500).json({ success: false, message: 'Error updating appointment status' });
	}
});

module.exports = router;

