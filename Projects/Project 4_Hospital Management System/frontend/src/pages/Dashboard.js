import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Schedule,
  LocalHospital,
  EventAvailable,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/appointments');
        console.log('Dashboard data:', response.data);
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
          setError(null);
        } else {
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view your appointments.');
        } else {
          setError('Failed to fetch your appointments. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleBookAppointment = () => {
    navigate('/doctors');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          My Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EventAvailable />}
          onClick={handleBookAppointment}
        >
          Book New Appointment
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : appointments.length === 0 ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Appointments Found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You don't have any appointments scheduled yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventAvailable />}
                onClick={handleBookAppointment}
              >
                Book Your First Appointment
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {appointment.doctorId?.name || 'Doctor'}
                      </Typography>
                    </Box>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {appointment.doctorId?.specialization}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Date: {format(new Date(appointment.date), 'PPP')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Time: {appointment.timeSlot}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Type: {appointment.type}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {appointment.status === 'cancelled' && appointment.cancellationReason && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="error">
                        Cancellation Reason: {appointment.cancellationReason}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 