import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    date: null,
    time: null,
    type: 'General Checkup',
    symptoms: '',
    notes: '',
  });
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const doctorId = location.state?.doctorId;
    if (doctorId) {
      setFormData(prev => ({ ...prev, doctorId }));
      fetchDoctorDetails(doctorId);
    }
    fetchAppointments();
    fetchDoctors();
  }, [location]);

  useEffect(() => {
    if (error) {
      console.error('Appointment Error:', error);
    }
  }, [error]);

  const fetchDoctorDetails = async (doctorId) => {
    try {
      const response = await axios.get(`/api/doctors/${doctorId}`);
      const doctorData = response.data;
      setFormData(prev => ({ 
        ...prev, 
        doctorId: doctorData._id,
        consultationFee: doctorData.consultationFee
      }));
    } catch (err) {
      console.error('Failed to fetch doctor details:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view appointments');
        return;
      }

      const response = await axios.get('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      console.log('Fetched doctors:', response.data);
      setDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDateChange = (newDate) => {
    console.log('New date selected:', newDate);
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleTimeChange = (newTime) => {
    console.log('New time selected:', newTime);
    setFormData(prev => ({
      ...prev,
      time: newTime
    }));
  };

  const handleNext = () => {
    console.log('Current form data:', formData);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    console.log('Current form data:', formData);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit form data:', formData);
    
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to book an appointment');
        return;
      }

      // Format date and time properly
      const appointmentDate = new Date(formData.date);
      const appointmentTime = new Date(formData.time);
      
      // Create combined date-time
      const combinedDateTime = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        appointmentTime.getHours(),
        appointmentTime.getMinutes()
      );

      // Format timeSlot in HH:mm format
      const hours = String(appointmentTime.getHours()).padStart(2, '0');
      const minutes = String(appointmentTime.getMinutes()).padStart(2, '0');
      const timeSlot = `${hours}:${minutes}`;

      const appointmentData = {
        doctorId: formData.doctorId,
        date: combinedDateTime.toISOString(),
        timeSlot: timeSlot,
        type: formData.type || 'General Checkup',
        symptoms: formData.symptoms || '',
        notes: formData.notes || ''
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await axios.post('http://localhost:5000/api/appointments', appointmentData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Appointment created:', response.data);
      setSuccess('Appointment booked successfully!');
      setOpenDialog(false);
      fetchAppointments();
      setFormData({
        doctorId: '',
        date: null,
        time: null,
        type: 'General Checkup',
        symptoms: '',
        notes: '',
      });
      setActiveStep(0);
    } catch (err) {
      console.error('Appointment creation error:', err.response?.data);
      
      let errorMessage = 'Failed to book appointment';
      
      if (err.response?.data) {
        if (Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(error => error.msg || error.message).join('\n');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const steps = ['Select Doctor', 'Choose Date & Time', 'Appointment Details'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Doctor
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.userId.name} - {doctor.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.doctorId && doctors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {(() => {
                  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
                  if (!selectedDoctor) return null;
                  
                  return (
                    <Paper sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <img
                            src={selectedDoctor.profilePhoto || '/images/doctor-placeholder.jpg'}
                            alt={selectedDoctor.userId.name}
                            style={{ width: '100%', borderRadius: '8px' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="h6" color="primary">
                            {selectedDoctor.userId.name}
                          </Typography>
                          <Typography variant="subtitle1" gutterBottom>
                            {selectedDoctor.specialization}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {selectedDoctor.specialityDescription}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Chip 
                              label={`${selectedDoctor.experience} years experience`}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={`₹${selectedDoctor.consultationFee} consultation fee`}
                              color="primary"
                              size="small"
                            />
                          </Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Available Hours:
                          </Typography>
                          {selectedDoctor.availabilitySchedule?.regularHours ? (
                            Object.entries(selectedDoctor.availabilitySchedule.regularHours).map(([day, hours]) => (
                              <Typography key={day} variant="body2" color="text.secondary">
                                {day.charAt(0).toUpperCase() + day.slice(1)}: {hours.morning}, {hours.evening}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Contact clinic for availability
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })()}
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    textField={(params) => <TextField {...params} fullWidth required />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Appointment Time"
                    value={formData.time}
                    onChange={handleTimeChange}
                    textField={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    defaultValue="General Checkup"
                  >
                    <MenuItem value="General Checkup">General Checkup</MenuItem>
                    <MenuItem value="Follow-up">Follow-up</MenuItem>
                    <MenuItem value="Consultation">Consultation</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="symptoms"
                  label="Symptoms (Optional)"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your symptoms if any..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="notes"
                  label="Additional Notes (Optional)"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    navigate('/login', { state: { from: '/appointments' } });
  };

  const handleAppointmentAction = async (appointmentId, action, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch(action) {
        case 'complete':
          endpoint = `http://localhost:5000/api/appointments/${appointmentId}/complete`;
          break;
        case 'cancel':
          endpoint = `http://localhost:5000/api/appointments/${appointmentId}/cancel`;
          break;
        default:
          throw new Error('Invalid action');
      }

      await axios.put(endpoint, { notes }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Appointment ${action}d successfully`);
      fetchAppointments();
      setOpenActionDialog(false);
      setActionNotes('');
    } catch (err) {
      setError(`Failed to ${action} appointment`);
    }
  };

  const renderAppointmentActions = (appointment) => {
    if (user?.role === 'doctor') {
      return (
        <Box>
          {appointment.status === 'pending' && (
            <>
              <Button
                color="success"
                size="small"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setOpenActionDialog(true);
                }}
              >
                Complete
              </Button>
              <Button
                color="error"
                size="small"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setOpenActionDialog(true);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      );
    }
    return null;
  };

  const renderAppointments = () => {
    if (!appointments.length) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">No appointments found</TableCell>
        </TableRow>
      );
    }

    return appointments.map((appointment) => {
      const doctorName = appointment.doctorId?.userId?.name || 'Unknown Doctor';
      const specialization = appointment.doctorId?.specialization || 'N/A';
      const appointmentDate = new Date(appointment.date);
      const formattedDate = `${appointmentDate.toLocaleDateString()} ${appointment.timeSlot}`;

      return (
        <TableRow key={appointment._id}>
          <TableCell>{doctorName}</TableCell>
          <TableCell>{specialization}</TableCell>
          <TableCell>{formattedDate}</TableCell>
          <TableCell>
            <Chip
              label={appointment.status}
              color={getStatusColor(appointment.status)}
            />
          </TableCell>
          <TableCell>
            {appointment.status === 'pending' && (
              <Button
                color="error"
                onClick={() => handleCancelAppointment(appointment._id)}
              >
                Cancel
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {user?.role === 'doctor' ? 'My Patient Appointments' : 'My Appointments'}
        </Typography>
        {user?.role === 'patient' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {user?.role === 'doctor' ? (
                <>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Symptoms</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderAppointments()}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Book Appointment</Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {renderStepContent(activeStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!formData.doctorId || (activeStep === 1 && (!formData.date || !formData.time))}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Book Appointment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            You need to be logged in to book an appointment. Would you like to log in now?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Cancel</Button>
          <Button onClick={handleLoginRedirect} variant="contained" color="primary">
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)}>
        <DialogTitle>
          {selectedAppointment?.status === 'pending' ? 'Complete' : 'Cancel'} Appointment
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleAppointmentAction(
              selectedAppointment?._id,
              selectedAppointment?.status === 'pending' ? 'complete' : 'cancel',
              actionNotes
            )}
            color={selectedAppointment?.status === 'pending' ? 'success' : 'error'}
            variant="contained"
          >
            {selectedAppointment?.status === 'pending' ? 'Complete' : 'Cancel'} Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments; 