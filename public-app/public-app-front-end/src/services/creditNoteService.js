import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

const creditNoteService = {
  // ===== Credit Note CRUD =====

  /** Get all credit notes for the logged-in pharmacist */
  getAll: (params) => api.get('/credit-notes', { params }),

  /** Get single credit note by ID */
  getById: (id) => api.get(`/credit-notes/${id}`),

  /** Create a new credit note (draft or submit) */
  create: (data) => api.post('/credit-notes', data),

  /** Update an existing draft credit note */
  update: (id, data) => api.put(`/credit-notes/${id}`, data),

  /** Delete a draft credit note */
  delete: (id) => api.delete(`/credit-notes/${id}`),

  // ===== Submission & Requests =====

  /** Submit a draft credit note for approval */
  submit: (id) => api.post(`/credit-notes/${id}/submit`),

  /** Request edit for a submitted credit note */
  requestEdit: (id, reason) => api.post(`/credit-notes/${id}/request-edit`, { reason }),

  /** Request deletion for a submitted credit note */
  requestDelete: (id, reason) => api.post(`/credit-notes/${id}/request-delete`, { reason }),

  // ===== Invoice & Product Data =====

  /** Get past invoices for product selection */
  getInvoices: (params) => api.get('/invoices', { params }),

  /** Get invoice details with line items */
  getInvoiceById: (id) => api.get(`/invoices/${id}`),

  /** Get available batches for a product from purchase history */
  getProductBatches: (productId) => api.get(`/products/${productId}/purchase-batches`),

  /** Get batches from a specific invoice */
  getInvoiceBatches: (invoiceId) => api.get(`/invoices/${invoiceId}/batches`),

  // ===== Configuration =====

  /** Get credit note configuration (area-specific) */
  getConfig: () => api.get('/credit-notes/config'),

  // ===== Billing Integration =====

  /** Get available (usable) credit notes for billing */
  getAvailableForBilling: () => api.get('/credit-notes/available-for-billing'),
};

export default creditNoteService;
