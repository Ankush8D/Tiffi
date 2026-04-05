import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://10.0.2.2:8080/api/v1'; // Android emulator → localhost
// For physical device: replace with your Mac's local IP e.g. http://192.168.1.x:8080

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  verify: (idToken, role) => api.post('/auth/verify', { idToken, role }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
  getProfile: () => api.get('/owner/profile'),
  updateProfile: (data) => api.put('/owner/profile', data),
};

export const customerAPI = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  updateStatus: (id, status) => api.patch(`/customers/${id}/status`, { status }),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const deliveryAPI = {
  getToday: (zone) => api.get('/deliveries/today', { params: { zone } }),
  mark: (data) => api.post('/deliveries/mark', data),
  markBatch: (marks) => api.post('/deliveries/mark-batch', marks),
  getHistory: (customerId, month, year) =>
    api.get(`/deliveries/history/${customerId}`, { params: { month, year } }),
};

export const leaveAPI = {
  apply: (data) => api.post('/leaves', data),
  approve: (id) => api.patch(`/leaves/${id}/approve`),
  reject: (id) => api.patch(`/leaves/${id}/reject`),
  myLeaves: () => api.get('/leaves/my'),
  pending: () => api.get('/leaves'),
};

export const paymentAPI = {
  recordCash: (data) => api.post('/payments/record-cash', data),
  createOrder: (data) => api.post('/payments/create-razorpay-order', data),
  verify: (data) => api.post('/payments/verify-razorpay', data),
  history: (customerId) => api.get(`/payments/history/${customerId}`),
  summary: (month, year) => api.get('/payments/summary', { params: { month, year } }),
};

export default api;
