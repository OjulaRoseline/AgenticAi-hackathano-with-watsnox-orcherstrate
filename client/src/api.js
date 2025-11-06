import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const onboarding = {
  create: (data) => api.post('/onboarding/create', data),
  getAll: (params) => api.get('/onboarding', { params }),
  getById: (id) => api.get(`/onboarding/${id}`),
  updateStatus: (id, status) => api.patch(`/onboarding/${id}/status`, { status }),
  getTasks: (id) => api.get(`/onboarding/${id}/tasks`),
  updateTask: (id, taskId, data) => api.patch(`/onboarding/${id}/tasks/${taskId}`, data),
};

export const chat = {
  sendMessage: (employeeId, message) => api.post('/chat/message', { employeeId, message }),
  getHistory: (employeeId) => api.get(`/chat/history/${employeeId}`),
};

export default api;
