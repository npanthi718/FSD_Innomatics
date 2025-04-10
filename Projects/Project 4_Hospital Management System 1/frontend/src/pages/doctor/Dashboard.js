import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday,
  AccessTime,
  Person,
  LocalHospital,
  Edit,
  Assignment,
  Search,
  Delete as DeleteIcon,
  EventNote,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log complete request details for debugging
    console.log('Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPrescriptions: 0
  });
  const [appointments, setAppointments] = useState({
    today: [],
    upcoming: [],
    completed: [],
    cancelled: [],
    all: []
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewPrescriptionDialog, setViewPrescriptionDialog] = useState(false);
  const [selectedPrescriptionData, setSelectedPrescriptionData] = useState(null);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: [],
    tests: [],
    notes: '',
    followUpDate: null
  });

  // Session timeout handling
  useEffect(() => {
    let inactivityTimer;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Session timeout - logging out');
        logout();
        navigate('/login');
      }, SESSION_TIMEOUT);
    };

    // Reset timer on user activity
    const handleUserActivity = () => {
      resetTimer();
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [logout, navigate]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the doctor's appointments
      const appointmentsRes = await api.get('/doctors/appointments');
      const allAppointments = appointmentsRes.data || [];
      
      // Process appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedAppointments = {
        today: [],
        upcoming: [],
        completed: [],
        cancelled: [],
        all: allAppointments
      };

      allAppointments.forEach(app => {
        const appDate = new Date(app.date);
        appDate.setHours(0, 0, 0, 0);

        if (app.status === 'completed') {
          processedAppointments.completed.push(app);
        } else if (app.status === 'cancelled') {
          processedAppointments.cancelled.push(app);
        } else if (appDate.getTime() === today.getTime()) {
          processedAppointments.today.push(app);
        } else if (appDate.getTime() > today.getTime()) {
          processedAppointments.upcoming.push(app);
        }
      });

      // Update appointments state
      setAppointments(processedAppointments);

      // Try to get prescriptions
      try {
        const prescriptionsRes = await api.get('/prescriptions/doctor');
        setPrescriptions(prescriptionsRes.data || []);
      } catch (prescError) {
        console.error('Error fetching prescriptions:', prescError);
        setPrescriptions([]);
      }

      // Update stats
      setStats({
        totalAppointments: allAppointments.length,
        todayAppointments: processedAppointments.today.length,
        upcomingAppointments: processedAppointments.upcoming.length,
        completedAppointments: processedAppointments.completed.length,
        cancelledAppointments: processedAppointments.cancelled.length,
        totalPrescriptions: 0 // Set to 0 if prescriptions fetch fails
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }

      // Set default states on error
      setAppointments({
        today: [],
        upcoming: [],
        completed: [],
        cancelled: [],
        all: []
      });
      setPrescriptions([]);
      setStats({
        totalAppointments: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalPrescriptions: 0
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionNote('');
    setOpenPrescriptionDialog(true);
  };

  const handleClosePrescription = () => {
    setOpenPrescriptionDialog(false);
    setSelectedAppointment(null);
    setPrescriptionNote('');
  };

  const handleSubmitPrescription = async () => {
    try {
      setError('');
      if (!prescriptionNote.trim()) {
        setError('Please enter prescription details');
        return;
      }

      if (!selectedAppointment?._id || !selectedAppointment?.patientId?._id) {
        setError('Invalid appointment data');
        return;
      }

      // First add the prescription
      const prescriptionData = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId._id,
        diagnosis: prescriptionNote,
        notes: prescriptionNote
      };

      console.log('Attempting to submit prescription with data:', prescriptionData);

      // Add the prescription using the configured api instance
      const prescriptionResponse = await api.post('/prescriptions', prescriptionData);
      console.log('Prescription created successfully:', prescriptionResponse.data);

      // Then complete the appointment using the configured api instance
      await api.patch(`/doctors/appointments/${selectedAppointment._id}/complete`);
      console.log('Appointment marked as completed');

      setSuccess('Prescription added and appointment completed successfully');
      setOpenPrescriptionDialog(false);
      setPrescriptionNote('');
      await fetchDashboardData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Error submitting prescription:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit prescription';
      setError(`Error: ${errorMessage}. Please try again.`);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus, prescription = null) => {
    try {
      setError(null);
      // Fix: Use the correct status update endpoint
      const response = await api.patch(`/doctors/appointments/${appointmentId}/status`, {
        status: newStatus,
        prescription
      });
      
      setSuccess(`Appointment ${newStatus} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const categorizeAppointments = (appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      todayAppointments: appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime() && 
               (appointment.status === 'confirmed' || appointment.status === 'pending');
      }),
      upcomingAppointments: appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() > today.getTime() && 
               appointment.status !== 'cancelled' && 
               appointment.status !== 'completed';
      }),
      pastAppointments: appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() < today.getTime() || 
               appointment.status === 'completed' || 
               appointment.status === 'cancelled';
      })
    };
  };

  const handleViewPrescription = async (appointment) => {
    try {
      setError(null);
      setSelectedPrescriptionData(null);
      
      if (!appointment?._id) {
        setError('Invalid appointment data');
        return;
      }

      console.log('Fetching prescription for appointment:', appointment._id);
      
      // First get all prescriptions for this doctor
      const response = await api.get('/prescriptions/doctor');
      
      // Find the prescription for this appointment
      const prescriptions = response.data.filter(p => p.appointmentId === appointment._id);
      
      // Even if no prescription is found, we'll show the dialog with appointment info
      setSelectedAppointment(appointment);
      
      if (prescriptions && prescriptions.length > 0) {
        // Get the most recent prescription
        const prescription = prescriptions[0];
        setSelectedPrescriptionData(prescription);
      }
      
      setViewPrescriptionDialog(true);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Failed to fetch prescription: ${errorMessage}`);
    }
  };

  const handleCompleteAppointment = async (appointment, withPrescription = false) => {
    try {
      setError(null);
      
      const data = {
        prescription: withPrescription ? prescriptionData : null
      };

      console.log('Completing appointment with data:', {
        appointmentId: appointment._id,
        data
      });

      // Fix: Use the correct complete appointment endpoint
      const response = await api.patch(`/doctors/appointments/${appointment._id}/complete`, data);
      
      setSuccess('Appointment completed successfully');
      if (withPrescription) {
        setPrescriptionDialogOpen(false);
        setPrescriptionData({
          diagnosis: '',
          medicines: [],
          tests: [],
          notes: '',
          followUpDate: null
        });
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error completing appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete appointment';
      setError(`Failed to complete appointment: ${errorMessage}`);
    }
  };

  const handleAddPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionDialogOpen(true);
  };

  const formatPrescriptionData = () => {
    return {
      ...prescriptionData,
      medicines: prescriptionData.medicines.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim()
      })).filter(med => med.name && med.dosage),
      tests: prescriptionData.tests.filter(test => test.trim()),
      diagnosis: prescriptionData.diagnosis.trim(),
      notes: prescriptionData.notes.trim(),
      followUpDate: prescriptionData.followUpDate || null
    };
  };

  const handlePrescriptionSubmit = () => {
    if (!prescriptionData.diagnosis.trim()) {
      setError('Diagnosis is required');
      return;
    }

    const formattedData = formatPrescriptionData();
    handleCompleteAppointment(selectedAppointment, true);
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Icon sx={{ fontSize: 40, color }} />
          <Typography variant="h6" ml={2} color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderAppointmentsTable = () => {
    if (!appointments.all) return null;

    const renderAppointmentTable = (appointmentList, title, id = null) => (
      <>
        {id && <Typography variant="h6" id={id} sx={{ mt: 3, mb: 2 }}>{title}</Typography>}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No {title.toLowerCase()} found</TableCell>
                </TableRow>
              ) : (
                appointmentList.map((appointment) => {
                  const patientName = appointment.patientId?.name || 'Unknown Patient';
                  const patientEmail = appointment.patientId?.email || 'No email';
                  const appointmentDate = new Date(appointment.date);
                  const formattedDate = format(appointmentDate, 'MMM dd, yyyy');
                  const formattedTime = appointment.timeSlot || format(appointmentDate, 'HH:mm');

                  return (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={appointment.patientId?.profilePhoto} 
                            alt={patientName}
                            sx={{ width: 32, height: 32 }}
                          >
                            {patientName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{patientName}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {patientEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formattedDate}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formattedTime}
                        </Typography>
                      </TableCell>
                      <TableCell>{appointment.type || 'General Checkup'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {appointment.status === 'confirmed' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleAddPrescription(appointment)}
                            >
                              Complete with Prescription
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleCompleteAppointment(appointment, false)}
                            >
                              Complete
                            </Button>
                          </Box>
                        )}
                        {appointment.status === 'completed' && (
                          <Tooltip title="View Prescription">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleViewPrescription(appointment)}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );

    return (
      <>
        {activeTab === 0 && renderAppointmentTable(appointments.today, "Today's Appointments", 'today-appointments')}
        {activeTab === 1 && renderAppointmentTable(appointments.upcoming, "Upcoming Appointments", 'upcoming-appointments')}
        {activeTab === 2 && (
          <>
            {renderAppointmentTable(appointments.completed, "Completed Appointments", 'completed-appointments')}
            {renderAppointmentTable(appointments.cancelled, "Cancelled Appointments", 'cancelled-appointments')}
          </>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome Dr. {user?.name?.split(' ')[1] || user?.name || 'Doctor'}
        </Typography>
        <Box>
          <Chip
            icon={<LocalHospital />}
            label="General"
            color="primary"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<Person />}
            label="Doctor"
            color="secondary"
          />
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CalendarToday}
            title="Today's Appointments"
            value={stats.todayAppointments}
            color="primary.main"
            onClick={() => {
              setActiveTab(0);
              const todaySection = document.getElementById('today-appointments');
              if (todaySection) {
                todaySection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AccessTime}
            title="Pending"
            value={stats.upcomingAppointments}
            color="warning.main"
            onClick={() => {
              setActiveTab(1);
              const upcomingSection = document.getElementById('upcoming-appointments');
              if (upcomingSection) {
                upcomingSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircleIcon}
            title="Completed"
            value={stats.completedAppointments}
            color="success.main"
            onClick={() => {
              setActiveTab(2);
              const completedSection = document.getElementById('completed-appointments');
              if (completedSection) {
                completedSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Assignment}
            title="Total Patients"
            value={stats.totalAppointments}
            color="info.main"
            onClick={() => {
              setActiveTab(2);
              const pastSection = document.getElementById('past-appointments');
              if (pastSection) {
                pastSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={`Today (${appointments.today.length})`}
              icon={<CalendarToday />}
              iconPosition="start"
            />
            <Tab 
              label={`Upcoming (${appointments.upcoming.length})`}
              icon={<AccessTime />}
              iconPosition="start"
            />
            <Tab 
              label={`History (${appointments.completed.length + appointments.cancelled.length})`}
              icon={<Assignment />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {renderAppointmentsTable()}
      </Paper>

      <Dialog
        open={openPrescriptionDialog}
        onClose={handleClosePrescription}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedAppointment?.status === 'completed' 
                ? 'View Prescription' 
                : 'Add Prescription'}
            </Typography>
            <IconButton onClick={handleClosePrescription}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Patient:</strong> {selectedAppointment.patientId?.name}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Date:</strong> {format(new Date(selectedAppointment.date), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Time:</strong> {selectedAppointment.timeSlot}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Prescription Notes"
                    value={prescriptionNote}
                    onChange={(e) => setPrescriptionNote(e.target.value)}
                    disabled={selectedAppointment.status === 'completed'}
                    placeholder="Enter diagnosis, medicines, tests, and any additional notes..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescription}>Cancel</Button>
          {selectedAppointment?.status !== 'completed' && (
            <Button
              onClick={handleSubmitPrescription}
              variant="contained"
              disabled={!prescriptionNote.trim()}
            >
              Submit & Complete Appointment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewPrescriptionDialog}
        onClose={() => setViewPrescriptionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Appointment Details</Typography>
            <IconButton onClick={() => setViewPrescriptionDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Patient Information
                        </Typography>
                        <Typography variant="body1">
                          Name: {selectedAppointment.patientId?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          Email: {selectedAppointment.patientId?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Appointment Details
                        </Typography>
                        <Typography variant="body1">
                          Date: {format(new Date(selectedAppointment.date), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="body1">
                          Time: {selectedAppointment.timeSlot}
                        </Typography>
                        <Typography variant="body1">
                          Type: {selectedAppointment.type || 'General Checkup'}
                        </Typography>
                        <Chip 
                          label={selectedAppointment.status}
                          color={getStatusColor(selectedAppointment.status)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  {selectedPrescriptionData ? (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                        Prescription Details
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Date: {new Date(selectedPrescriptionData.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Diagnosis: {selectedPrescriptionData.diagnosis}
                      </Typography>

                      {selectedPrescriptionData.medicines?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                            Medicines
                          </Typography>
                          <Grid container spacing={2}>
                            {selectedPrescriptionData.medicines.map((medicine, index) => (
                              <Grid item xs={12} key={index}>
                                <Paper variant="outlined" sx={{ p: 1 }}>
                                  <Typography variant="body1">
                                    {medicine.name} - {medicine.dosage}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Frequency: {medicine.frequency}, Duration: {medicine.duration}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {selectedPrescriptionData.tests?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                            Tests
                          </Typography>
                          <Grid container spacing={1}>
                            {selectedPrescriptionData.tests.map((test, index) => (
                              <Grid item key={index}>
                                <Chip label={test} variant="outlined" />
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}

                      {selectedPrescriptionData.notes && (
                        <>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                            Notes
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 1 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {selectedPrescriptionData.notes}
                            </Typography>
                          </Paper>
                        </>
                      )}
                    </Paper>
                  ) : (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'background.default', 
                        borderRadius: 2,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider'
                      }}
                    >
                      <Assignment sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Prescription Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This appointment has been completed but no prescription was issued.
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPrescriptionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={prescriptionDialogOpen} 
        onClose={() => setPrescriptionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Prescription</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Diagnosis"
              fullWidth
              multiline
              rows={2}
              value={prescriptionData.diagnosis}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
            />
            
            {/* Medicines Section */}
            <Typography variant="subtitle1">Medicines</Typography>
            {prescriptionData.medicines.map((medicine, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Name"
                  value={medicine.name}
                  onChange={(e) => {
                    const newMedicines = [...prescriptionData.medicines];
                    newMedicines[index].name = e.target.value;
                    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
                  }}
                />
                <TextField
                  label="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => {
                    const newMedicines = [...prescriptionData.medicines];
                    newMedicines[index].dosage = e.target.value;
                    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
                  }}
                />
                <IconButton 
                  color="error"
                  onClick={() => {
                    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);
                    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => setPrescriptionData({
                ...prescriptionData,
                medicines: [...prescriptionData.medicines, { name: '', dosage: '' }]
              })}
            >
              Add Medicine
            </Button>

            {/* Tests Section */}
            <TextField
              label="Tests"
              fullWidth
              multiline
              rows={2}
              value={prescriptionData.tests.join('\n')}
              onChange={(e) => setPrescriptionData({
                ...prescriptionData,
                tests: e.target.value.split('\n').filter(test => test.trim())
              })}
              placeholder="Enter tests (one per line)"
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={prescriptionData.notes}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
            />

            <TextField
              label="Follow-up Date"
              type="date"
              value={prescriptionData.followUpDate || ''}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handlePrescriptionSubmit}
          >
            Complete with Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 