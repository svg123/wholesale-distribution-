import api from './api';

const requestService = {
  getAll: (params) => api.get('/requests', { params }),

  getById: (id) => api.get(`/requests/${id}`),

  create: (data) => api.post('/requests', data),

  approve: (id, data) => api.put(`/requests/${id}/approve`, data),

  reject: (id, data) => api.put(`/requests/${id}/reject`, data),

  getByStatus: (status) => api.get('/requests', { params: { status } }),
};

export default requestService;
