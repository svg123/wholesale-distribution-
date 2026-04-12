import api from './api';

// Mock orders data for sub-station operations
const mockOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-001',
    customer: 'City Hospital',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'PROCESSING',
    barcode: 'ORD00120260409',
    currentSubstation: null,
    products: [
      { id: 'P1', name: 'Paracetamol 500mg', requiredQty: 100, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P2', name: 'Amoxicillin 250mg', requiredQty: 50, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P3', name: 'Ibuprofen 400mg', requiredQty: 75, assignedSubstation: 'CIPLA', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P4', name: 'Metformin 500mg', requiredQty: 120, assignedSubstation: 'MANKIND', batchNumber: '', processedQty: 0, status: 'PENDING' },
    ],
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD-002',
    customer: 'Regional Medical Center',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'PROCESSING',
    barcode: 'ORD00220260409',
    currentSubstation: null,
    products: [
      { id: 'P5', name: 'Omeprazole 20mg', requiredQty: 80, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P6', name: 'Cetirizine 10mg', requiredQty: 200, assignedSubstation: 'CIPLA', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P7', name: 'Vitamin D3 1000IU', requiredQty: 150, assignedSubstation: 'LUPIN', batchNumber: '', processedQty: 0, status: 'PENDING' },
    ],
  },
  {
    id: 'ORD-003',
    orderNumber: 'ORD-003',
    customer: 'Community Health Clinic',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'PROCESSING',
    barcode: 'ORD00320260409',
    currentSubstation: null,
    products: [
      { id: 'P8', name: 'Calcium Carbonate 500mg', requiredQty: 180, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P9', name: 'Azithromycin 500mg', requiredQty: 60, assignedSubstation: 'CIPLA', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P10', name: 'Pantoprazole 40mg', requiredQty: 90, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P11', name: 'Diclofenac 50mg', requiredQty: 110, assignedSubstation: 'MANKIND', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P12', name: 'Losartan 50mg', requiredQty: 70, assignedSubstation: 'LUPIN', batchNumber: '', processedQty: 0, status: 'PENDING' },
    ],
  },
  {
    id: 'ORD-004',
    orderNumber: 'ORD-004',
    customer: 'District General Hospital',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'PROCESSING',
    barcode: 'ORD00420260409',
    currentSubstation: null,
    products: [
      { id: 'P13', name: 'Dolo 650mg', requiredQty: 250, assignedSubstation: 'ABBOTT', batchNumber: '', processedQty: 0, status: 'PENDING' },
      { id: 'P14', name: 'Montelukast 10mg', requiredQty: 100, assignedSubstation: 'CIPLA', batchNumber: '', processedQty: 0, status: 'PENDING' },
    ],
  },
];

const orderService = {
  getOrders: (params) => api.get('/orders', { params }),

  getOrderById: (orderId) => api.get(`/orders/${orderId}`),

  getOrderTimeline: (orderId) => api.get(`/orders/${orderId}/timeline`),

  updateOrderStatus: (orderId, status) =>
    api.put(`/orders/${orderId}/status`, { status }),

  getRecentOrders: (limit = 10) => api.get('/orders/recent', { params: { limit } }),

  // Sub-station specific functions (using mock data for now)
  getOrderByBarcode: (barcode) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.barcode === barcode || o.orderNumber === barcode);
        if (order) {
          resolve(order);
        } else {
          reject(new Error('Order not found'));
        }
      }, 400);
    });
  },

  getOrderById: (orderId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (order) {
          resolve(order);
        } else {
          reject(new Error('Order not found'));
        }
      }, 300);
    });
  },

  getProductsForSubstation: (orderId, substationName) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (!order) {
          reject(new Error('Order not found'));
          return;
        }
        const products = order.products.filter(p => p.assignedSubstation === substationName);
        resolve({ order, products });
      }, 300);
    });
  },

  submitProcessedProducts: (orderId, substationName, processedProducts) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
        if (orderIndex === -1) {
          reject(new Error('Order not found'));
          return;
        }
        const order = mockOrders[orderIndex];
        // Update each product — now supports multi-batch format
        order.products = order.products.map(p => {
          const processed = processedProducts.find(pp => pp.id === p.id);
          if (processed && p.assignedSubstation === substationName) {
            const totalProcessedQty = processed.batches.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
            const allBatchesValid = processed.batches.every(b => b.batchNumber.trim() !== '' && Number(b.quantity) > 0);
            return {
              ...p,
              batches: processed.batches,
              processedQty: totalProcessedQty,
              status: (!allBatchesValid || processed.batches.length === 0)
                ? 'PENDING'
                : totalProcessedQty === p.requiredQty
                  ? 'COMPLETED'
                  : 'MISMATCH',
            };
          }
          return p;
        });
        const stationProducts = order.products.filter(p => p.assignedSubstation === substationName);
        const allCompleted = stationProducts.every(p => p.status === 'COMPLETED');
        resolve({ order, allCompleted, stationProducts });
      }, 500);
    });
  },

  submitMismatchTicket: (ticketData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ticket = {
          id: `TKT-${String(Date.now()).slice(-6)}`,
          ...ticketData,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          processedAt: null,
        };
        resolve(ticket);
      }, 300);
    });
  },

  getOrdersForSubstation: (substationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOrders.filter(o => o.status === 'processing'));
      }, 300);
    });
  },

  getSubstationStats: (substationId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: mockOrders.length,
          pending: mockOrders.filter(o => o.status === 'processing').length,
          completed: mockOrders.filter(o => o.status === 'completed').length,
          lastUpdated: new Date().toISOString()
        });
      }, 300);
    });
  },

  updateOrderBatchInfo: (orderId, batchInfo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          mockOrders[orderIndex] = {
            ...mockOrders[orderIndex],
            substation: batchInfo.substation,
            items: mockOrders[orderIndex].items.map((item, index) => ({
              ...item,
              batchNumber: batchInfo.batchNumbers[index] || '',
              quantityFilled: batchInfo.quantities[index] || item.quantity
            })),
            completedAt: batchInfo.completedAt,
            status: 'completed'
          };
          resolve(mockOrders[orderIndex]);
        } else {
          reject(new Error('Order not found'));
        }
      }, 500);
    });
  },

  getPendingOrders: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOrders.filter(o => o.status === 'processing'));
      }, 300);
    });
  }
};

// Export individual functions for easier import
export const getOrders = orderService.getOrders;
export const getOrderById = orderService.getOrderById;
export const getOrderTimeline = orderService.getOrderTimeline;
export const updateOrderStatus = orderService.updateOrderStatus;
export const getRecentOrders = orderService.getRecentOrders;
export const getOrderByBarcode = orderService.getOrderByBarcode;
export const getOrdersForSubstation = orderService.getOrdersForSubstation;
export const getSubstationStats = orderService.getSubstationStats;
export const updateOrderBatchInfo = orderService.updateOrderBatchInfo;
export const getPendingOrders = orderService.getPendingOrders;
export const getProductsForSubstation = orderService.getProductsForSubstation;
export const submitProcessedProducts = orderService.submitProcessedProducts;
export const submitMismatchTicket = orderService.submitMismatchTicket;

export default orderService;
