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
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person,
  Refresh as RefreshIcon,
  Assignment,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingApprovals: 0,
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewAppointmentDialog, setViewAppointmentDialog] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editPatientDialogOpen, setEditPatientDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access the admin dashboard');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [statsRes, doctorsRes, patientsRes, appointmentsRes, departmentsRes] = await Promise.all([
        axios.get('/api/admin/stats', config),
        axios.get('/api/admin/doctors', config),
        axios.get('/api/admin/patients', config),
        axios.get('/api/admin/appointments', config),
        axios.get('/api/admin/departments', config)
      ]);

      setStats({
        totalDoctors: statsRes.data.totalDoctors,
        totalPatients: statsRes.data.totalPatients,
        totalAppointments: appointmentsRes.data.stats.total,
        pendingApprovals: statsRes.data.pendingApprovals
      });
      
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data.appointments);
      setDepartments(departmentsRes.data);
      setSuccess('Data loaded successfully');
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
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

      await axios.put(`/api/admin/appointments/${appointmentId}/status`, {
        status: newStatus
      }, config);
      
      setSuccess('Appointment status updated successfully');
      fetchDashboardData();
    } catch (err) {
      console.error('Status update error:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
    } else {
        setError(
          err.response?.data?.message || 
          'Failed to update appointment status. Please try again.'
        );
      }
    }
  };

  const handleDoctorStatusChange = async (doctorId, newStatus) => {
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

      await axios.patch(`/api/doctors/${doctorId}/approval`, {
        isApproved: newStatus === 'active'
      }, config);
      
      setSuccess(`Doctor status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Doctor status update error:', err);
      setError(err.response?.data?.message || 'Failed to update doctor status');
    }
  };

  const handleActivateAllDoctors = async () => {
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

      // Update all doctors to active status
      await Promise.all(
        doctors.map(doctor => 
          axios.patch(`/api/doctors/${doctor._id}/approval`, {
            isApproved: true
          }, config)
        )
      );

      setSuccess('All doctors have been activated');
      fetchDashboardData();
    } catch (err) {
      console.error('Error activating doctors:', err);
      setError('Failed to activate all doctors. Please try again.');
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditDoctor(doctor);
    setEditDialogOpen(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

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

      await axios.delete(`/api/doctors/${doctorId}`, config);
      setSuccess('Doctor deleted successfully');
      fetchDashboardData();
    } catch (err) {
      console.error('Delete doctor error:', err);
      setError(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleSaveDoctor = async () => {
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

      // Format the data to match backend expectations
      const doctorData = {
        specialization: editDoctor.specialization,
        department: editDoctor.department?._id || editDoctor.department,
        experience: editDoctor.experience,
        userId: {
          name: editDoctor.userId?.name,
          email: editDoctor.userId?.email
        }
      };

      await axios.put(`/api/doctors/${editDoctor._id}/profile`, doctorData, config);
      setSuccess('Doctor information updated successfully');
      setEditDialogOpen(false);
      setEditDoctor(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Update doctor error:', err);
      setError(err.response?.data?.message || 'Failed to update doctor information');
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setViewAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = () => {
    setSelectedAppointment(null);
    setViewAppointmentDialog(false);
  };

  const handleViewPatient = (patient) => {
    // TODO: Implement patient details view
    console.log('View patient:', patient);
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setEditPatientDialogOpen(true);
  };

  const handleSavePatient = async () => {
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

      await axios.put(`/api/patients/${editPatient._id}`, {
        name: editPatient.name,
        email: editPatient.email,
        phone: editPatient.phone,
        age: editPatient.age,
        gender: editPatient.gender,
        bloodGroup: editPatient.bloodGroup
      }, config);

      setSuccess('Patient information updated successfully');
      setEditPatientDialogOpen(false);
      setEditPatient(null);
        fetchDashboardData();
      } catch (err) {
      console.error('Update patient error:', err);
      setError(err.response?.data?.message || 'Failed to update patient information');
    }
  };

  const handleViewPatientHistory = async (patientId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view history');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Fetch appointments and prescriptions for this patient
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        axios.get(`/api/appointments/patient/${patientId}`, config),
        axios.get(`/api/prescriptions/patient/${patientId}`, config)
      ]);

      setSelectedPatientHistory({
        appointments: appointmentsRes.data || [],
        prescriptions: prescriptionsRes.data || []
      });
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setError(error.response?.data?.message || 'Failed to fetch patient history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionDialogOpen(true);
  };

  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HospitalIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Doctors</Typography>
          </Box>
            <Typography variant="h3" color="primary">
              {stats.totalDoctors}
        </Typography>
      </CardContent>
    </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Patients</Typography>
            </Box>
            <Typography variant="h3" color="secondary">
              {stats.totalPatients}
            </Typography>
          </CardContent>
        </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Appointments</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {stats.totalAppointments}
            </Typography>
          </CardContent>
        </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Assignment color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Pending Approvals</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {stats.pendingApprovals}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDoctors = () => (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Doctors List</Typography>
        <Box>
          <Button
            variant="contained"
            color="success"
            sx={{ mr: 2 }}
            onClick={handleActivateAllDoctors}
          >
            Activate All Doctors
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </Box>
      </Box>
          <Table>
            <TableHead>
              <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Specialization</TableCell>
            <TableCell>Experience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
          {doctors && doctors.length > 0 ? (
            doctors.map((doctor) => {
              const user = doctor.userId || {};
              const departmentName = doctor.department?.name || (typeof doctor.department === 'string' ? doctor.department : 'N/A');
              return (
                <TableRow key={doctor._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{user.name ? user.name[0] : 'D'}</Avatar>
                      {user.name || 'Unknown Doctor'}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{departmentName}</TableCell>
                  <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                  <TableCell>{doctor.experience ? `${doctor.experience} years` : 'N/A'}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={doctor.isApproved ? 'active' : 'pending'}
                        onChange={(e) => handleDoctorStatusChange(doctor._id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteDoctor(doctor._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                      <IconButton 
                      size="small"
                        color="primary"
                        onClick={() => handleViewPatientHistory(doctor._id)}
                    >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1" color="textSecondary">
                  No doctors found
                </Typography>
              </TableCell>
            </TableRow>
          )}
            </TableBody>
          </Table>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Doctor Information</DialogTitle>
        <DialogContent>
          {editDoctor && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={editDoctor.userId?.name || ''}
                onChange={(e) => setEditDoctor({ 
                  ...editDoctor, 
                  userId: { ...editDoctor.userId, name: e.target.value }
                })}
              />
              <TextField
                label="Email"
                fullWidth
                value={editDoctor.userId?.email || ''}
                onChange={(e) => setEditDoctor({ 
                  ...editDoctor, 
                  userId: { ...editDoctor.userId, email: e.target.value }
                })}
              />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editDoctor.department?._id || editDoctor.department || ''}
                  onChange={(e) => setEditDoctor({ ...editDoctor, department: e.target.value })}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Specialization"
                fullWidth
                value={editDoctor.specialization || ''}
                onChange={(e) => setEditDoctor({ ...editDoctor, specialization: e.target.value })}
              />
              <TextField
                label="Experience (years)"
                fullWidth
                type="number"
                value={editDoctor.experience || ''}
                onChange={(e) => setEditDoctor({ ...editDoctor, experience: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDoctor} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
        </TableContainer>
  );

  const renderPatients = () => (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Patients List</Typography>
          <Button
            variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          >
          Refresh
          </Button>
        </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Blood Group</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
          {patients && patients.length > 0 ? (
            patients.map((patient) => (
              <TableRow key={patient?._id || 'temp-key'}>
                  <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{patient?.name?.[0] || 'P'}</Avatar>
                    {patient?.name || 'Unknown Patient'}
                  </Box>
                  </TableCell>
                <TableCell>{patient?.email || 'N/A'}</TableCell>
                <TableCell>{patient?.phone || 'N/A'}</TableCell>
                <TableCell>{patient?.age || 'N/A'}</TableCell>
                <TableCell>{patient?.gender || 'N/A'}</TableCell>
                <TableCell>{patient?.bloodGroup || 'N/A'}</TableCell>
                  <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                    <IconButton
                      size="small"
                        color="primary"
                        onClick={() => handleEditPatient(patient)}
                    >
                      <EditIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                    <IconButton
                      size="small"
                        color="primary"
                        onClick={() => handleViewPatientHistory(patient._id)}
                      >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1" color="textSecondary">
                  No patients found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAppointments = () => (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Appointments List</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <TableRow key={appointment?._id || 'temp-key'}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{appointment?.patientId?.name?.[0] || 'P'}</Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {appointment?.patientId?.name || 'Unknown Patient'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {appointment?.patientId?.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{appointment?.doctorId?.userId?.name?.[0] || 'D'}</Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {appointment?.doctorId?.userId?.name || 'Unknown Doctor'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {appointment?.doctorId?.userId?.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{appointment?.doctorId?.department?.name || 'N/A'}</TableCell>
                <TableCell>
                  {appointment?.date ? format(new Date(appointment.date), 'MMM dd, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{appointment?.timeSlot || 'N/A'}</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={appointment?.status || 'pending'}
                      onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                    {appointment?.status === 'pending' && (
                      <>
                        <Tooltip title="Confirm">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </Box>

      {renderStats()}

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Doctors" />
          <Tab label="Patients" />
          <Tab label="Appointments" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {activeTab === 0 && renderDoctors()}
          {activeTab === 1 && renderPatients()}
          {activeTab === 2 && renderAppointments()}
        </Box>
      </Paper>

      <Dialog 
        open={viewAppointmentDialog} 
        onClose={handleCloseAppointmentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Appointment Details</Typography>
            <IconButton onClick={handleCloseAppointmentDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Patient Information</Typography>
                  <Typography>Name: {selectedAppointment.patientId?.name || 'N/A'}</Typography>
                  <Typography>Email: {selectedAppointment.patientId?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Doctor Information</Typography>
                  <Typography>Name: {selectedAppointment.doctorId?.userId?.name || 'N/A'}</Typography>
                  <Typography>Email: {selectedAppointment.doctorId?.userId?.email || 'N/A'}</Typography>
                  <Typography>Department: {selectedAppointment.doctorId?.department?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Appointment Details</Typography>
                  <Typography>Date: {selectedAppointment.date ? format(new Date(selectedAppointment.date), 'PPP') : 'N/A'}</Typography>
                  <Typography>Time: {selectedAppointment.timeSlot || 'N/A'}</Typography>
                  <Typography>Type: {selectedAppointment.type || 'N/A'}</Typography>
                  <Typography>Status: {selectedAppointment.status || 'N/A'}</Typography>
                  <Typography>Symptoms: {selectedAppointment.symptoms || 'None'}</Typography>
                  <Typography>Notes: {selectedAppointment.notes || 'None'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentDialog}>Close</Button>
          {selectedAppointment?.status === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  handleStatusChange(selectedAppointment._id, 'confirmed');
                  handleCloseAppointmentDialog();
                }}
                color="success"
                variant="contained"
              >
                Confirm Appointment
              </Button>
              <Button 
                onClick={() => {
                  handleStatusChange(selectedAppointment._id, 'cancelled');
                  handleCloseAppointmentDialog();
                }}
                color="error"
                variant="contained"
              >
                Cancel Appointment
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Patient History</Typography>
            <IconButton onClick={() => setHistoryDialogOpen(false)}>
              <CloseIcon />
                    </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatientHistory && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Appointments</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPatientHistory.appointments.map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>
                          {format(new Date(appointment.date), 'MMM dd, yyyy')}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {appointment.timeSlot}
                          </Typography>
                        </TableCell>
                        <TableCell>{appointment.doctorId?.userId?.name || 'N/A'}</TableCell>
                        <TableCell>{appointment.doctorId?.department?.name || 'N/A'}</TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Prescriptions</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPatientHistory.prescriptions.map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell>
                          {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{prescription.doctorId?.userId?.name || 'N/A'}</TableCell>
                        <TableCell>{prescription.diagnosis}</TableCell>
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
            </TableBody>
          </Table>
        </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={prescriptionDialogOpen}
        onClose={() => setPrescriptionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Prescription Details</Typography>
            <IconButton onClick={() => setPrescriptionDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Patient Information</Typography>
                  <Typography>Name: {selectedPrescription.patientId?.name || 'N/A'}</Typography>
                  <Typography>Email: {selectedPrescription.patientId?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Doctor Information</Typography>
                  <Typography>Name: {selectedPrescription.doctorId?.userId?.name || 'N/A'}</Typography>
                  <Typography>Department: {selectedPrescription.doctorId?.department?.name || 'N/A'}</Typography>
                </Grid>
              <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Prescription Details</Typography>
                  <Typography>Date: {new Date(selectedPrescription.createdAt).toLocaleDateString()}</Typography>
                  <Typography>Diagnosis: {selectedPrescription.diagnosis}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Medicines</Typography>
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <Box key={index} sx={{ ml: 2, mb: 1 }}>
                      <Typography>
                        {medicine.name} - {medicine.dosage}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Frequency: {medicine.frequency}, Duration: {medicine.duration}
                      </Typography>
                    </Box>
                  ))}
                  {selectedPrescription.tests && selectedPrescription.tests.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Tests</Typography>
                      {selectedPrescription.tests.map((test, index) => (
                        <Typography key={index} sx={{ ml: 2 }}>{test}</Typography>
                      ))}
                    </>
                  )}
                  {selectedPrescription.notes && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Notes</Typography>
                      <Typography sx={{ whiteSpace: 'pre-line' }}>{selectedPrescription.notes}</Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={editPatientDialogOpen} 
        onClose={() => setEditPatientDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Patient Information</DialogTitle>
        <DialogContent>
          {editPatient && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={editPatient.name || ''}
                onChange={(e) => setEditPatient({ ...editPatient, name: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                value={editPatient.email || ''}
                onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                value={editPatient.phone || ''}
                onChange={(e) => setEditPatient({ ...editPatient, phone: e.target.value })}
              />
                <TextField
                label="Age"
                  fullWidth
                type="number"
                value={editPatient.age || ''}
                onChange={(e) => setEditPatient({ ...editPatient, age: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={editPatient.gender || ''}
                  onChange={(e) => setEditPatient({ ...editPatient, gender: e.target.value })}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
                <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                  <Select
                  value={editPatient.bloodGroup || ''}
                  onChange={(e) => setEditPatient({ ...editPatient, bloodGroup: e.target.value })}
                  label="Blood Group"
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPatientDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 