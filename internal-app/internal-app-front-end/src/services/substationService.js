import api from './api';

const substationService = {
  getAll: () => api.get('/substations'),

  getById: (id) => api.get(`/substations/${id}`),

  create: (data) => api.post('/substations', data),

  update: (id, data) => api.put(`/substations/${id}`, data),

  delete: (id) => api.delete(`/substations/${id}`),

  updateStatus: (id, status) => api.patch(`/substations/${id}/status`, { status }),

  getOrders: (id, params) => api.get(`/substations/${id}/orders`, { params }),

  updateOrderStatus: (substationId, orderId, data) =>
    api.put(`/substations/${substationId}/orders/${orderId}`, data),

  getPerformance: (id, params) =>
    api.get(`/substations/${id}/performance`, { params }),
};

export default substationService;
