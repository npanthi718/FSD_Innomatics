import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Ensure the base URL is correct
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials if needed
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ensure the token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          window.location.href = '/unauthorized';
          break;
        case 404:
          console.error('Resource not found:', response.data.message);
          break;
        case 500:
          console.error('Server error:', response.data.message);
          break;
        default:
          console.error('Error:', response.data.message);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export the API service
const apiService = {
  getPrescriptions: () => api.get('/prescriptions'), // Ensure this matches your backend route
};

export default apiService;