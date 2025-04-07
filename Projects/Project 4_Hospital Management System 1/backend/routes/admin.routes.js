import express from 'express';
const router = express.Router();
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.model.js';
import Department from '../models/department.model.js';
import Prescription from '../models/prescription.model.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalDoctors, totalPatients, appointments] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      Appointment.find()
    ]);

    const pendingApprovals = appointments.filter(apt => apt.status === 'pending').length;

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments: appointments.length,
      pendingApprovals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get all appointments (admin only)
router.get('/appointments', async (req, res) => {
  try {
    console.log('Fetching all appointments...');
    const appointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate('patientId', 'name email')
      .lean();
    
    console.log(`Found ${appointments.length} appointments`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    console.log('Fetching all doctors...');
    const doctors = await Doctor.find()
      .populate({
        path: 'userId',
        select: 'name email profilePhoto phoneNumber'
      })
      .populate('department')
      .lean()
      .then(doctors => doctors.map(doctor => ({
        ...doctor,
        name: doctor.userId?.name || 'Unknown Doctor',
        email: doctor.userId?.email || 'No email',
        department: {
          name: doctor.department?.name || 'Unknown Department'
        }
      })));
    
    console.log(`Found ${doctors.length} doctors`);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    console.log('Fetching all patients...');
    const patients = await User.find({ role: 'patient' }).lean();
    console.log(`Found ${patients.length} patients`);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    console.log('Fetching all departments...');
    const departments = await Department.find().lean();
    console.log(`Found ${departments.length} departments`);
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    // Validate appointment ID
    if (!id) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only allow specific status transitions
    const allowedStatuses = ['confirmed', 'cancelled', 'completed', 'pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Require cancellation reason when cancelling
    if (status === 'cancelled' && !cancellationReason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    // Update the appointment
    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    // Return updated appointment with populated fields
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email profilePhoto')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .lean();

    console.log('Appointment status updated:', {
      id: updatedAppointment._id,
      status: updatedAppointment.status
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

// Get patient appointments
router.get('/patients/:id/appointments', async (req, res) => {
  try {
    console.log('Fetching patient appointments...');
    const appointments = await Appointment.find({ patientId: req.params.id })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate('patientId', 'name email')
      .lean();
    
    console.log(`Found ${appointments.length} appointments for patient ${req.params.id}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Error fetching patient appointments', error: error.message });
  }
});

// Get patient prescriptions
router.get('/patients/:id/prescriptions', async (req, res) => {
  try {
    console.log('Fetching patient prescriptions...');
    const prescriptions = await Prescription.find({ patientId: req.params.id })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate('patientId', 'name email')
      .lean();
    
    console.log(`Found ${prescriptions.length} prescriptions for patient ${req.params.id}`);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: 'Error fetching patient prescriptions', error: error.message });
  }
});

// Get doctor appointments
router.get('/doctors/:id/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.id })
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
      .populate('patientId', 'name email phone')
      .sort({ date: -1 })
      .lean();

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching doctor appointments', error: error.message });
  }
});

// Get doctor prescriptions
router.get('/doctors/:id/prescriptions', async (req, res) => {
  try {
    console.log('Fetching doctor prescriptions...');
    const prescriptions = await Prescription.find({ doctorId: req.params.id })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${prescriptions.length} prescriptions for doctor ${req.params.id}`);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ message: 'Error fetching doctor prescriptions', error: error.message });
  }
});

export default router;