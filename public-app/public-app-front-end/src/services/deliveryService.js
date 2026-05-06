/**
 * Public App - Delivery Service
 * 
 * Handles all delivery tracking and OTP verification API calls
 * for the pharmacist-facing public application.
 * 
 * Integrates with the Internal App delivery module for:
 * - Real-time delivery status tracking
 * - OTP-based delivery confirmation
 * - OTP regeneration
 * - Delivery notifications
 */
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

// ===== Delivery Status Constants (Public App View) =====
export const DELIVERY_STATUS = {
  ORDER_PLACED: 'ORDER_PLACED',
  DISPATCHED: 'DISPATCHED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
};

export const DELIVERY_STATUS_CONFIG = {
  ORDER_PLACED: {
    label: 'Order Placed',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    icon: '📦',
    description: 'Your order has been received and is being processed',
  },
  DISPATCHED: {
    label: 'Dispatched',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300',
    icon: '🚚',
    description: 'Your order has been dispatched from the warehouse',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-300',
    icon: '📍',
    description: 'Your order is on its way to your pharmacy',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-300',
    icon: '✅',
    description: 'Your order has been successfully delivered',
  },
};

// ===== OTP Configuration =====
export const OTP_CONFIG = {
  MAX_REGENERATION_COUNT: 3,
  OTP_VALIDITY_MINUTES: 10,
  OTP_LENGTH: 6,
};

// ===== Mock Delivery Data =====
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

const mockDeliveries = [
  {
    id: 'DEL-001',
    orderId: 'ORD-20260413-001',
    orderDate: '2026-04-13',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 12,
    totalAmount: 34500,
    status: DELIVERY_STATUS.OUT_FOR_DELIVERY,
    deliveryPerson: {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      vehicle: 'Bike - MH-30-AB-1234',
    },
    dispatchTime: hoursAgo(2),
    expectedDeliveryTime: '2026-04-13T16:00:00',
    deliveredTime: null,
    otp: '482916',
    otpGeneratedAt: hoursAgo(0.5),
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    otpRegenerationCount: 0,
    remarks: 'Handle with care – glass items included',
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(0.5),
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-20260412-005',
    orderDate: '2026-04-12',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 8,
    totalAmount: 18200,
    status: DELIVERY_STATUS.DISPATCHED,
    deliveryPerson: {
      name: 'Suresh Patil',
      phone: '9876543211',
      vehicle: 'Bike - MH-30-CD-5678',
    },
    dispatchTime: hoursAgo(1),
    expectedDeliveryTime: '2026-04-13T18:00:00',
    deliveredTime: null,
    otp: '731504',
    otpGeneratedAt: hoursAgo(1),
    otpExpiresAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
    otpRegenerationCount: 0,
    remarks: '',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(1),
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-20260411-003',
    orderDate: '2026-04-11',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 6,
    totalAmount: 12800,
    status: DELIVERY_STATUS.DELIVERED,
    deliveryPerson: {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      vehicle: 'Bike - MH-30-AB-1234',
    },
    dispatchTime: hoursAgo(24),
    expectedDeliveryTime: '2026-04-12T14:00:00',
    deliveredTime: hoursAgo(20),
    otp: null,
    otpGeneratedAt: null,
    otpExpiresAt: null,
    otpRegenerationCount: 0,
    remarks: 'Delivered on time',
    createdAt: hoursAgo(28),
    updatedAt: hoursAgo(20),
  },
  {
    id: 'DEL-004',
    orderId: 'ORD-20260410-002',
    orderDate: '2026-04-10',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 15,
    totalAmount: 67800,
    status: DELIVERY_STATUS.DELIVERED,
    deliveryPerson: {
      name: 'Prakash Jadhav',
      phone: '9876543213',
      vehicle: 'Bike - MH-30-GH-3456',
    },
    dispatchTime: hoursAgo(48),
    expectedDeliveryTime: '2026-04-11T16:00:00',
    deliveredTime: hoursAgo(44),
    otp: null,
    otpGeneratedAt: null,
    otpExpiresAt: null,
    otpRegenerationCount: 0,
    remarks: '',
    createdAt: hoursAgo(52),
    updatedAt: hoursAgo(44),
  },
  {
    id: 'DEL-005',
    orderId: 'ORD-20260413-008',
    orderDate: '2026-04-13',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 4,
    totalAmount: 8900,
    status: DELIVERY_STATUS.ORDER_PLACED,
    deliveryPerson: null,
    dispatchTime: null,
    expectedDeliveryTime: '2026-04-14T14:00:00',
    deliveredTime: null,
    otp: null,
    otpGeneratedAt: null,
    otpExpiresAt: null,
    otpRegenerationCount: 0,
    remarks: '',
    createdAt: minsAgo(30),
    updatedAt: minsAgo(30),
  },
  {
    id: 'DEL-006',
    orderId: 'ORD-20260409-001',
    orderDate: '2026-04-09',
    pharmacy: 'Shiv Medical Store',
    pharmacyId: 'PHARM001',
    deliveryAddress: 'Gaddam Plot, Akola, Maharashtra 444001',
    area: 'Gaddam Plot',
    items: 9,
    totalAmount: 31200,
    status: DELIVERY_STATUS.DELIVERED,
    deliveryPerson: {
      name: 'Vijay Mohite',
      phone: '9876543214',
      vehicle: 'Bike - MH-30-IJ-7890',
    },
    dispatchTime: hoursAgo(96),
    expectedDeliveryTime: '2026-04-10T12:00:00',
    deliveredTime: hoursAgo(92),
    otp: null,
    otpGeneratedAt: null,
    otpExpiresAt: null,
    otpRegenerationCount: 0,
    remarks: 'Priority delivery completed',
    createdAt: hoursAgo(100),
    updatedAt: hoursAgo(92),
  },
];

// In-memory store for mock data
let deliveryStore = [...mockDeliveries];

// ===== Mock delay helper =====
const mockDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== Generate 6-digit OTP =====
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// ===== Service Methods =====
const deliveryService = {

  // ===== Delivery Tracking =====

  /**
   * Get all deliveries for the logged-in pharmacist
   * @param {Object} params - Query params (status, page, limit)
   * @returns {Promise<{deliveries: Array, total: number, page: number}>}
   */
  getMyDeliveries: async (params = {}) => {
    await mockDelay();
    let results = [...deliveryStore];

    if (params.status) {
      results = results.filter((d) => d.status === params.status);
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = results.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const deliveries = results.slice(start, start + limit);

    return { deliveries, total, page };
  },

  /**
   * Get a single delivery by ID
   * @param {string} deliveryId
   * @returns {Promise<Object>}
   */
  getDeliveryById: async (deliveryId) => {
    await mockDelay();
    const delivery = deliveryStore.find((d) => d.id === deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    return { ...delivery };
  },

  /**
   * Get delivery by order ID
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  getDeliveryByOrderId: async (orderId) => {
    await mockDelay();
    const delivery = deliveryStore.find((d) => d.orderId === orderId);
    if (!delivery) {
      throw new Error('Delivery not found for this order');
    }
    return { ...delivery };
  },

  // ===== OTP Operations =====

  /**
   * Get current OTP for a delivery (only if active and not expired)
   * @param {string} deliveryId
   * @returns {Promise<{otp: string, expiresAt: string, isExpired: boolean}>}
   */
  getOTP: async (deliveryId) => {
    await mockDelay();
    const delivery = deliveryStore.find((d) => d.id === deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (delivery.status === DELIVERY_STATUS.DELIVERED) {
      throw new Error('OTP not available – delivery already completed');
    }

    if (!delivery.otp) {
      throw new Error('OTP not yet generated. It will be generated when the order is dispatched.');
    }

    const now = new Date();
    const expiresAt = new Date(delivery.otpExpiresAt);
    const isExpired = now > expiresAt;

    return {
      otp: delivery.otp,
      expiresAt: delivery.otpExpiresAt,
      generatedAt: delivery.otpGeneratedAt,
      isExpired,
      regenerationCount: delivery.otpRegenerationCount,
      maxRegenerations: OTP_CONFIG.MAX_REGENERATION_COUNT,
    };
  },

  /**
   * Regenerate OTP for a delivery
   * - Invalidates old OTP
   * - Generates new OTP
   * - Resets expiry timer
   * - Increments regeneration counter
   * 
   * @param {string} deliveryId
   * @returns {Promise<{otp: string, expiresAt: string, regenerationCount: number}>}
   */
  regenerateOTP: async (deliveryId) => {
    await mockDelay(800);
    const deliveryIndex = deliveryStore.findIndex((d) => d.id === deliveryId);
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found');
    }

    const delivery = deliveryStore[deliveryIndex];

    if (delivery.status === DELIVERY_STATUS.DELIVERED) {
      throw new Error('Cannot regenerate OTP – delivery already completed');
    }

    if (delivery.otpRegenerationCount >= OTP_CONFIG.MAX_REGENERATION_COUNT) {
      throw new Error(
        `Maximum OTP regeneration limit (${OTP_CONFIG.MAX_REGENERATION_COUNT}) reached. Please contact support.`
      );
    }

    const newOTP = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_CONFIG.OTP_VALIDITY_MINUTES * 60 * 1000);

    deliveryStore[deliveryIndex] = {
      ...delivery,
      otp: newOTP,
      otpGeneratedAt: now.toISOString(),
      otpExpiresAt: expiresAt.toISOString(),
      otpRegenerationCount: delivery.otpRegenerationCount + 1,
      updatedAt: now.toISOString(),
    };

    return {
      otp: newOTP,
      expiresAt: expiresAt.toISOString(),
      generatedAt: now.toISOString(),
      regenerationCount: deliveryStore[deliveryIndex].otpRegenerationCount,
      maxRegenerations: OTP_CONFIG.MAX_REGENERATION_COUNT,
    };
  },

  // ===== Stats =====

  /**
   * Get delivery statistics for the pharmacist
   * @returns {Promise<Object>}
   */
  getDeliveryStats: async () => {
    await mockDelay(400);
    const all = deliveryStore;

    return {
      total: all.length,
      orderPlaced: all.filter((d) => d.status === DELIVERY_STATUS.ORDER_PLACED).length,
      dispatched: all.filter((d) => d.status === DELIVERY_STATUS.DISPATCHED).length,
      outForDelivery: all.filter((d) => d.status === DELIVERY_STATUS.OUT_FOR_DELIVERY).length,
      delivered: all.filter((d) => d.status === DELIVERY_STATUS.DELIVERED).length,
    };
  },
};

export default deliveryService;
