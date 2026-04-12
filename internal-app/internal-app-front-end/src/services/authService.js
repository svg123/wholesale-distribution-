import api from './api';
import config from '../config/env';

// Mock users for development (when no backend is running)
const MOCK_USERS = {
  admin: {
    password: 'admin123',
    user: { id: 1, name: 'Rajesh Kumar', username: 'admin', email: 'rajesh@pharma.com', role: 'ADMIN' },
  },
  management: {
    password: 'mgmt123',
    user: { id: 2, name: 'Priya Sharma', username: 'management', email: 'priya@pharma.com', role: 'MANAGEMENT' },
  },
  staff: {
    password: 'staff123',
    user: { id: 3, name: 'Amit Patel', username: 'staff', email: 'amit@pharma.com', role: 'STAFF' },
  },
};

const authService = {
  login: async (credentials) => {
    // Mock login when backend is not available
    if (config.enableMockApi) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUser = MOCK_USERS[credentials.username];
          if (mockUser && mockUser.password === credentials.password) {
            resolve({
              success: true,
              token: 'mock-jwt-token-' + Date.now(),
              user: mockUser.user,
              message: 'Login successful',
            });
          } else {
            reject(new Error('Invalid username or password'));
          }
        }, 500);
      });
    }
    return api.post('/auth/login', credentials);
  },

  logout: () => {
    if (config.enableMockApi) return Promise.resolve({ success: true });
    return api.post('/auth/logout');
  },

  verifyElevatedAccess: async (credentials) => {
    if (config.enableMockApi) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const admin = MOCK_USERS.admin;
          if (admin && admin.password === credentials.password) {
            resolve({ success: true });
          } else {
            reject(new Error('Invalid admin credentials'));
          }
        }, 300);
      });
    }
    return api.post('/auth/verify-elevated', credentials);
  },

  getCurrentUser: () => api.get('/auth/me'),

  changePassword: (data) => api.put('/auth/change-password', data),
};

export default authService;
