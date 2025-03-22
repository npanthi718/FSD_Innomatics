const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Appointment = require('../models/appointment.model');
const Department = require('../models/department.model');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get dashboard stats
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const [doctors, patients, appointments, pendingApprovals] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalDoctors: doctors,
      totalPatients: patients,
      totalAppointments: appointments,
      pendingApprovals: pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get all doctors
router.get('/doctors', [auth, admin], async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: 'userId',
        select: 'name email profilePhoto phoneNumber'
      })
      .populate('department')
      .lean();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get all patients
router.get('/patients', [auth, admin], async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// Get all appointments
router.get('/appointments', [auth, admin], async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'name email'
          },
          {
            path: 'department',
            select: 'name'
          }
        ]
      })
      .populate('patientId', 'name email')
      .sort({ date: 1 });

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate < tomorrow;
    });

    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');

    res.json({
      appointments,
      stats: {
        today: todayAppointments.length,
        pending: pendingAppointments.length,
        completed: completedAppointments.length,
        total: appointments.length
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get all departments
router.get('/departments', [auth, admin], async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

// Update appointment status
router.put('/appointments/:id/status', [auth, admin], async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

module.exports = router; 