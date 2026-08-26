import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${apiBase}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm JWT token vào Header nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xiv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  forgotPasswordSendOtp: (data) => api.post('/auth/forgot-password/send-otp', data),
  forgotPasswordReset: (data) => api.post('/auth/forgot-password/reset', data),
  changePasswordSendOtp: () => api.post('/auth/change-password/send-otp'),
  changePassword: (data) => api.post('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orderAPI = {
  checkout: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getAll: (params) => api.get('/orders', { params }),
  getTracking: (code) => api.get(`/orders/track/${code}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getKPIs: () => api.get('/orders/kpi/dashboard'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateMembership: (id, data) => api.put(`/users/${id}/membership`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const faqAPI = {
  getAll: (params) => api.get('/faqs', { params }),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
};

export const aiAPI = {
  generateDescription: (data) => api.post('/ai/generate-description', data),
  getStrategicAnalysis: () => api.get('/ai/strategic-analysis'),
};

export default api;
