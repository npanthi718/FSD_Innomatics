import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocalHospital,
  History,
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your appointments');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch appointments
        const appointmentsResponse = await axios.get('/api/appointments', config);
        setAppointments(appointmentsResponse.data.appointments || []);
        
        // Fetch prescriptions
        const prescriptionsResponse = await axios.get('/api/prescriptions', config);
        setPrescriptions(prescriptionsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionDialogOpen(true);
  };

  const handleClosePrescriptionDialog = () => {
    setPrescriptionDialogOpen(false);
    setSelectedPrescription(null);
  };

  const getAppointmentStatus = (status) => {
    switch (status) {
      case 'pending':
        return <Typography color="warning.main">Pending</Typography>;
      case 'confirmed':
        return <Typography color="success.main">Confirmed</Typography>;
      case 'completed':
        return <Typography color="info.main">Completed</Typography>;
      case 'cancelled':
        return <Typography color="error.main">Cancelled</Typography>;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming Appointments
                  </Typography>
                  <Typography variant="h5">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccessTime color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Appointments
                  </Typography>
                  <Typography variant="h5">
                    {appointments.filter(a => a.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <History color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Past Appointments
                  </Typography>
                  <Typography variant="h5">
                    {appointments.filter(a => a.status === 'completed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalHospital color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Prescriptions
                  </Typography>
                  <Typography variant="h5">
                    {prescriptions.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Appointments" />
          <Tab label="Prescriptions" />
        </Tabs>
      </Box>

      {/* Appointments Table */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{appointment.timeSlot}</TableCell>
                  <TableCell>{appointment.doctorId?.userId?.name || 'Unknown Doctor'}</TableCell>
                  <TableCell>{appointment.doctorId?.department?.name || 'N/A'}</TableCell>
                  <TableCell>{getAppointmentStatus(appointment.status)}</TableCell>
                  <TableCell>
                    {appointment.status === 'completed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const prescription = prescriptions.find(
                            (p) => p.appointmentId === appointment._id
                          );
                          if (prescription) {
                            handleViewPrescription(prescription);
                          }
                        }}
                      >
                        View Prescription
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
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
      )}

      {/* Prescriptions Table */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription._id}>
                  <TableCell>
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{prescription.doctorId?.userId?.name || 'Unknown Doctor'}</TableCell>
                  <TableCell>{prescription.doctorId?.department?.name || 'N/A'}</TableCell>
                  <TableCell>{prescription.diagnosis.substring(0, 50)}...</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewPrescription(prescription)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {prescriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No prescriptions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Prescription Dialog */}
      <Dialog
        open={prescriptionDialogOpen}
        onClose={handleClosePrescriptionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date:</strong>{' '}
                {new Date(selectedPrescription.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Doctor:</strong> {selectedPrescription.doctorId?.userId?.name || 'Unknown Doctor'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Department:</strong> {selectedPrescription.doctorId?.department?.name || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Diagnosis:</strong>
              </Typography>
              <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                {selectedPrescription.diagnosis}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Prescription:</strong>
              </Typography>
              <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                {selectedPrescription.prescription}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Notes:</strong>
              </Typography>
              <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                {selectedPrescription.notes}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescriptionDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 