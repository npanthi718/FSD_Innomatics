import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewPrescriptionDialog, setViewPrescriptionDialog] = useState(false);
  const [selectedPrescriptionData, setSelectedPrescriptionData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access the dashboard');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Get appointments - the backend will handle doctor filtering
      const appointmentsResponse = await axios.get('/api/appointments', config);
      
      if (!appointmentsResponse.data || !appointmentsResponse.data.appointments) {
        throw new Error('No appointments data received');
      }

      const allAppointments = appointmentsResponse.data.appointments;
      
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter appointments for different categories
      const todayAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      const pendingAppointments = allAppointments.filter(apt => 
        apt.status === 'pending'
      );

      const confirmedAppointments = allAppointments.filter(apt => 
        apt.status === 'confirmed'
      );

      const completedAppointments = allAppointments.filter(apt => 
        apt.status === 'completed'
      );

      // Set appointments
      setAppointments(allAppointments);

      // Set calculated stats
      setStats({
        totalPatients: new Set(allAppointments.map(apt => apt.patientId?._id)).size,
        todayAppointments: todayAppointments.length,
        pendingAppointments: pendingAppointments.length + confirmedAppointments.length,
        completedAppointments: completedAppointments.length
      });

      setError(''); // Clear any previous errors
      setSuccess('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to perform this action');
        return;
      }

      if (!prescriptionNote.trim()) {
        setError('Please enter prescription details');
        return;
      }

      if (!selectedAppointment?._id || !selectedAppointment?.patientId?._id) {
        setError('Invalid appointment data');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // First add the prescription
      const prescriptionData = {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId._id,
        diagnosis: prescriptionNote,
        notes: prescriptionNote
      };

      console.log('Attempting to submit prescription with data:', prescriptionData);

      // Add the prescription
      const prescriptionResponse = await axios.post('/api/prescriptions', prescriptionData, config);
      console.log('Prescription created successfully:', prescriptionResponse.data);

      // Then complete the appointment
      await axios.patch(`/api/appointments/${selectedAppointment._id}/complete`, {}, config);
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

  const handleUpdateAppointment = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to perform this action');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.put(`/api/appointments/${appointmentId}/status`, {
        status
      }, config);

      setSuccess(`Appointment ${status} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError(error.response?.data?.message || 'Failed to update appointment');
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

  const filterAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (activeTab) {
      case 0: // Today's appointments
        return appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
      case 1: // Upcoming appointments
        return appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return (apt.status === 'pending' || apt.status === 'confirmed') && aptDate >= today;
        });
      case 2: // Past appointments
        return appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return apt.status === 'completed' || aptDate < today;
        });
      default:
        return appointments;
    }
  };

  const handleViewPrescription = async (appointment) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view prescriptions');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`/api/prescriptions/appointment/${appointment._id}`, config);
      setSelectedPrescriptionData(response.data);
      setViewPrescriptionDialog(true);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      setError(error.response?.data?.message || 'Failed to fetch prescription');
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card>
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

  const renderAppointmentsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Symptoms</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterAppointments().map((appointment) => (
            <TableRow key={appointment._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>
                    {appointment.patientId?.name?.[0] || 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {appointment.patientId?.name || 'Unknown Patient'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {appointment.patientId?.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">
                  {format(new Date(appointment.date), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {appointment.timeSlot}
                </Typography>
              </TableCell>
              <TableCell>{appointment.type || 'Regular'}</TableCell>
              <TableCell>{appointment.symptoms || 'Not specified'}</TableCell>
              <TableCell>
                <Chip 
                  label={appointment.status} 
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {appointment.status === 'pending' && (
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleUpdateAppointment(appointment._id, 'confirmed')}
                      sx={{ mr: 1 }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleUpdateAppointment(appointment._id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
                {appointment.status === 'confirmed' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenPrescription(appointment)}
                  >
                    Add Prescription & Complete
                  </Button>
                )}
                {appointment.status === 'completed' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleViewPrescription(appointment)}
                  >
                    View Prescription
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filterAppointments().length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body1" color="textSecondary">
                  No appointments found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
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
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AccessTime}
            title="Pending"
            value={stats.pendingAppointments}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircleIcon}
            title="Completed"
            value={stats.completedAppointments}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Assignment}
            title="Total Patients"
            value={stats.totalPatients}
            color="info.main"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Today's Appointments" />
            <Tab label="Upcoming Appointments" />
            <Tab label="Past Appointments" />
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
            <Typography variant="h6">Prescription Details</Typography>
            <IconButton onClick={() => setViewPrescriptionDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPrescriptionData && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Patient Information</Typography>
                  <Typography>Name: {selectedPrescriptionData.patientId?.name || 'N/A'}</Typography>
                  <Typography>Email: {selectedPrescriptionData.patientId?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Prescription Details</Typography>
                  <Typography>Date: {new Date(selectedPrescriptionData.createdAt).toLocaleDateString()}</Typography>
                  <Typography>Diagnosis: {selectedPrescriptionData.diagnosis}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Medicines</Typography>
                  {selectedPrescriptionData.medicines.map((medicine, index) => (
                    <Box key={index} sx={{ ml: 2, mb: 1 }}>
                      <Typography>
                        {medicine.name} - {medicine.dosage}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Frequency: {medicine.frequency}, Duration: {medicine.duration}
                      </Typography>
                    </Box>
                  ))}
                  {selectedPrescriptionData.tests && selectedPrescriptionData.tests.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Tests</Typography>
                      {selectedPrescriptionData.tests.map((test, index) => (
                        <Typography key={index} sx={{ ml: 2 }}>{test}</Typography>
                      ))}
                    </>
                  )}
                  {selectedPrescriptionData.notes && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Notes</Typography>
                      <Typography sx={{ whiteSpace: 'pre-line' }}>{selectedPrescriptionData.notes}</Typography>
                    </>
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
    </Container>
  );
};

export default Dashboard; 