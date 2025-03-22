const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const validateDoctorUpdate = [
    body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
    body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
];

// Get all doctors
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all doctors...');
        const doctors = await Doctor.find({ isApproved: true })
            .populate({
                path: 'userId',
                select: 'name email profilePhoto phoneNumber',
            })
            .populate('department')
            .lean();

        console.log(`Found ${doctors.length} doctors`);
        
        if (!doctors.length) {
            console.log('No doctors found in the database');
        }

        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`Fetching doctor with ID: ${req.params.id}`);
        const doctor = await Doctor.findById(req.params.id)
            .populate({
                path: 'userId',
                select: 'name email profilePhoto phoneNumber',
            })
            .populate('department')
            .lean();

        if (!doctor) {
            console.log('Doctor not found');
            return res.status(404).json({ message: 'Doctor not found' });
        }

        console.log('Doctor found:', doctor.userId.name);
        res.json(doctor);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
});

// Update doctor profile
router.put('/:id/profile', auth, authorize('admin'), async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Update doctor fields
        if (req.body.specialization) doctor.specialization = req.body.specialization;
        if (req.body.department) doctor.department = req.body.department;
        if (req.body.experience) doctor.experience = req.body.experience;

        // Update user fields if provided
        if (req.body.userId && doctor.userId) {
            const user = await User.findById(doctor.userId);
            if (user) {
                if (req.body.userId.name) user.name = req.body.userId.name;
                if (req.body.userId.email) user.email = req.body.userId.email;
                await user.save();
            }
        }

        await doctor.save();

        // Fetch the updated doctor with populated fields
        const updatedDoctor = await Doctor.findById(doctor._id)
            .populate({
                path: 'userId',
                select: 'name email profilePhoto phoneNumber'
            })
            .populate('department')
            .lean();

        res.json(updatedDoctor);
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
    }
});

// Update doctor availability
router.put('/availability', auth, authorize('doctor'), async (req, res) => {
    try {
        const { availability } = req.body;
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        doctor.availability = availability;
        await doctor.save();

        res.json({ message: 'Availability updated successfully', availability: doctor.availability });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get doctor's appointments
router.get('/appointments', auth, authorize('doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate('patientId', 'name email phone')
            .sort({ date: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update appointment status
router.patch('/appointments/:id/status', auth, authorize('doctor'), async (req, res) => {
    try {
        const { status } = req.body;
        const doctor = await Doctor.findOne({ userId: req.user._id });
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctorId: doctor._id
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get doctor statistics
router.get('/stats/overview', auth, authorize('doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const stats = await Promise.all([
            Appointment.countDocuments({ doctorId: doctor._id, status: 'pending' }),
            Appointment.countDocuments({ doctorId: doctor._id, status: 'confirmed' }),
            Appointment.countDocuments({ doctorId: doctor._id, status: 'completed' }),
            Appointment.countDocuments({ doctorId: doctor._id, status: 'cancelled' })
        ]);

        res.json({
            pendingAppointments: stats[0],
            confirmedAppointments: stats[1],
            completedAppointments: stats[2],
            cancelledAppointments: stats[3]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve/reject doctor (admin only)
router.patch('/:id/approval', auth, authorize('admin'), async (req, res) => {
    try {
        const { isApproved } = req.body;
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.isApproved = isApproved;
        await doctor.save();

        res.json({ message: 'Doctor approval status updated successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update doctor status (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.status = req.body.status;
        await doctor.save();

        res.json(doctor);
    } catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({ message: 'Error updating doctor status', error: error.message });
    }
});

// Delete doctor (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Delete the doctor's user account if it exists
        if (doctor.userId) {
            await User.findByIdAndDelete(doctor.userId);
        }

        // Delete the doctor
        await Doctor.findByIdAndDelete(req.params.id);

        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ message: 'Error deleting doctor', error: error.message });
    }
});

module.exports = router; 