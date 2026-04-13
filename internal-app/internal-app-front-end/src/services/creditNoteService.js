import api from './api';

const creditNoteService = {
  // ===== Credit Note Management =====

  /** Get all credit notes with filters (for internal management) */
  getAll: (params) => api.get('/credit-notes', { params }),

  /** Get single credit note by ID (full details with logs) */
  getById: (id) => api.get(`/credit-notes/${id}`),

  // ===== Stage 1: Approval =====

  /** Approve credit note (full or partial) */
  approve: (id, data) => api.put(`/credit-notes/${id}/approve`, data),

  /** Reject credit note with mandatory comment */
  reject: (id, data) => api.put(`/credit-notes/${id}/reject`, data),

  // ===== Stage 2: Ready-to-Process =====

  /** Mark credit note as Ready-to-Process (Manager/Admin only) */
  markReadyToProcess: (id, data) => api.put(`/credit-notes/${id}/ready-to-process`, data),

  // ===== Edit/Delete Request Handling =====

  /** Approve or reject edit request */
  handleEditRequest: (id, data) => api.put(`/credit-notes/${id}/handle-edit`, data),

  /** Approve or reject delete request */
  handleDeleteRequest: (id, data) => api.put(`/credit-notes/${id}/handle-delete`, data),

  // ===== Dashboard & Stats =====

  /** Get credit note dashboard stats */
  getStats: (params) => api.get('/credit-notes/stats', { params }),

  // ===== Configuration =====

  /** Get credit note configuration */
  getConfig: () => api.get('/credit-notes/config'),

  /** Update credit note configuration */
  updateConfig: (data) => api.put('/credit-notes/config', data),

  /** Get area-specific configurations */
  getAreaConfigs: () => api.get('/credit-notes/config/areas'),

  /** Create or update area-specific configuration */
  upsertAreaConfig: (data) => api.put('/credit-notes/config/areas', data),

  /** Delete area-specific configuration */
  deleteAreaConfig: (areaCode) => api.delete(`/credit-notes/config/areas/${areaCode}`),

  // ===== Export =====

  /** Export credit notes as CSV */
  exportCSV: (params) => api.get('/credit-notes/export', { params, responseType: 'blob' }),

  /** Get credit notes available for billing for a specific customer */
  getAvailableForBilling: (customerId) => api.get('/credit-notes/available-for-billing', { params: { customerId } }),
};

export default creditNoteService;
