import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  tests: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;