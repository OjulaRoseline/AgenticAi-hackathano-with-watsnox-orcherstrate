import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (userData) =>
  api.post('/api/auth/register', userData);

export const logout = () =>
  api.post('/api/auth/logout');

// AI Agents
export const queryAgent = (query, context = {}) =>
  api.post('/api/agents/query', { query, context });

// Patients
export const getPatients = () =>
  api.get('/api/patients');

export const getPatient = (id) =>
  api.get(`/api/patients/${id}`);

// Vitals
export const getPatientVitals = (patientId) =>
  api.get(`/api/vitals/patient/${patientId}`);

// Alerts
export const getAlerts = () =>
  api.get('/api/alerts');

// Meetings
export const getMeetings = () =>
  api.get('/api/meetings');

export default api;
