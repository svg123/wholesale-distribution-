/**
 * Delivery Service
 * Mock data and business logic for the Delivery Management Module
 */
import { DELIVERY_STATUSES, DELIVERY_AVAILABILITY } from '../utils/constants';

// Helper to create relative timestamps
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

// ===== Mock Delivery Personnel =====
export const mockDeliveryPersonnel = [
  {
    id: 'DP-001',
    staffId: 'STAFF-001',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh.kumar@medwholesale.com',
    role: 'STAFF',
    isDeliveryPerson: true,
    availability: DELIVERY_AVAILABILITY.AVAILABLE,
    areas: ['Gaddam Plot', 'Ranpise Nagar'],
    isPrimary: true,
    activeLeave: null,
    totalDeliveries: 342,
    todayDeliveries: 5,
    rating: 4.8,
    vehicle: 'Bike - MH-30-AB-1234',
    joinedDate: '2025-06-15',
  },
  {
    id: 'DP-002',
    staffId: 'STAFF-002',
    name: 'Suresh Patil',
    phone: '9876543211',
    email: 'suresh.patil@medwholesale.com',
    role: 'STAFF',
    isDeliveryPerson: true,
    availability: DELIVERY_AVAILABILITY.AVAILABLE,
    areas: ['Old City', 'Cotton Market'],
    isPrimary: true,
    activeLeave: null,
    totalDeliveries: 289,
    todayDeliveries: 3,
    rating: 4.6,
    vehicle: 'Bike - MH-30-CD-5678',
    joinedDate: '2025-08-20',
  },
  {
    id: 'DP-003',
    staffId: 'STAFF-003',
    name: 'Anil Deshmukh',
    phone: '9876543212',
    email: 'anil.deshmukh@medwholesale.com',
    role: 'STAFF',
    isDeliveryPerson: true,
    availability: DELIVERY_AVAILABILITY.ON_LEAVE,
    areas: ['Tilak Road', 'Station Road'],
    isPrimary: true,
    activeLeave: {
      id: 'LV-2026-010',
      leaveType: 'SICK',
      startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'APPROVED',
    },
    totalDeliveries: 256,
    todayDeliveries: 0,
    rating: 4.5,
    vehicle: 'Bike - MH-30-EF-9012',
    joinedDate: '2025-09-10',
  },
  {
    id: 'DP-004',
    staffId: 'STAFF-004',
    name: 'Prakash Jadhav',
    phone: '9876543213',
    email: 'prakash.jadhav@medwholesale.com',
    role: 'STAFF',
    isDeliveryPerson: true,
    availability: DELIVERY_AVAILABILITY.AVAILABLE,
    areas: ['Civil Lines', 'Akola Fort'],
    isPrimary: true,
    activeLeave: null,
    totalDeliveries: 198,
    todayDeliveries: 4,
    rating: 4.3,
    vehicle: 'Bike - MH-30-GH-3456',
    joinedDate: '2025-11-01',
  },
  {
    id: 'DP-005',
    staffId: 'STAFF-005',
    name: 'Vijay Mohite',
    phone: '9876543214',
    email: 'vijay.mohite@medwholesale.com',
    role: 'STAFF',
    isDeliveryPerson: true,
    availability: DELIVERY_AVAILABILITY.AVAILABLE,
    areas: ['Murtizapur Road', 'Balapur Naka'],
    isPrimary: true,
    activeLeave: null,
    totalDeliveries: 167,
    todayDeliveries: 2,
    rating: 4.4,
    vehicle: 'Bike - MH-30-IJ-7890',
    joinedDate: '2026-01-15',
  },
];

// ===== Mock Area Mappings =====
export const mockAreaMappings = [
  { area: 'Gaddam Plot', primary: 'DP-001', primaryName: 'Rajesh Kumar', backup: 'DP-002', backupName: 'Suresh Patil' },
  { area: 'Ranpise Nagar', primary: 'DP-001', primaryName: 'Rajesh Kumar', backup: 'DP-004', backupName: 'Prakash Jadhav' },
  { area: 'Old City', primary: 'DP-002', primaryName: 'Suresh Patil', backup: 'DP-003', backupName: 'Anil Deshmukh' },
  { area: 'Cotton Market', primary: 'DP-002', primaryName: 'Suresh Patil', backup: 'DP-001', backupName: 'Rajesh Kumar' },
  { area: 'Tilak Road', primary: 'DP-003', primaryName: 'Anil Deshmukh', backup: 'DP-005', backupName: 'Vijay Mohite' },
  { area: 'Station Road', primary: 'DP-003', primaryName: 'Anil Deshmukh', backup: 'DP-001', backupName: 'Rajesh Kumar' },
  { area: 'Civil Lines', primary: 'DP-004', primaryName: 'Prakash Jadhav', backup: 'DP-005', backupName: 'Vijay Mohite' },
  { area: 'Akola Fort', primary: 'DP-004', primaryName: 'Prakash Jadhav', backup: 'DP-002', backupName: 'Suresh Patil' },
  { area: 'Murtizapur Road', primary: 'DP-005', primaryName: 'Vijay Mohite', backup: 'DP-004', backupName: 'Prakash Jadhav' },
  { area: 'Balapur Naka', primary: 'DP-005', primaryName: 'Vijay Mohite', backup: 'DP-003', backupName: 'Anil Deshmukh' },
];

// ===== Mock Delivery Tasks =====
export const mockDeliveryTasks = [
  // Ready for Dispatch (Unassigned)
  {
    id: 'DT-001',
    orderId: 'ORD-20260412-001',
    pharmacy: 'Shiv Medical',
    pharmacyAddress: 'Gaddam Plot, Akola',
    area: 'Gaddam Plot',
    items: 12,
    totalAmount: 34500,
    status: DELIVERY_STATUSES.READY_FOR_DISPATCH,
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    createdAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.5),
    priority: 'HIGH',
    notes: '',
  },
  {
    id: 'DT-002',
    orderId: 'ORD-20260412-002',
    pharmacy: 'MedPlus Express',
    pharmacyAddress: 'Tilak Road, Akola',
    area: 'Tilak Road',
    items: 8,
    totalAmount: 18200,
    status: DELIVERY_STATUSES.READY_FOR_DISPATCH,
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    priority: 'MEDIUM',
    notes: '',
  },
  {
    id: 'DT-003',
    orderId: 'ORD-20260412-003',
    pharmacy: 'Apollo Pharmacy',
    pharmacyAddress: 'Civil Lines, Akola',
    area: 'Civil Lines',
    items: 15,
    totalAmount: 67800,
    status: DELIVERY_STATUSES.READY_FOR_DISPATCH,
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    createdAt: minsAgo(20),
    updatedAt: minsAgo(20),
    priority: 'HIGH',
    notes: 'Priority client - deliver first',
  },

  // Assigned Tasks
  {
    id: 'DT-004',
    orderId: 'ORD-20260411-008',
    pharmacy: 'Health Plus Pharmacy',
    pharmacyAddress: 'Ranpise Nagar, Akola',
    area: 'Ranpise Nagar',
    items: 6,
    totalAmount: 12800,
    status: DELIVERY_STATUSES.ASSIGNED,
    assignedTo: { id: 'DP-001', name: 'Rajesh Kumar' },
    assignedBy: 'System (Auto)',
    assignedAt: hoursAgo(1.5),
    dispatchedAt: null,
    deliveredAt: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(1.5),
    priority: 'MEDIUM',
    notes: '',
  },
  {
    id: 'DT-005',
    orderId: 'ORD-20260411-010',
    pharmacy: 'City Pharma',
    pharmacyAddress: 'Cotton Market, Akola',
    area: 'Cotton Market',
    items: 4,
    totalAmount: 8900,
    status: DELIVERY_STATUSES.ASSIGNED,
    assignedTo: { id: 'DP-002', name: 'Suresh Patil' },
    assignedBy: 'Vikram Singh',
    assignedAt: hoursAgo(0.75),
    dispatchedAt: null,
    deliveredAt: null,
    createdAt: hoursAgo(1.5),
    updatedAt: hoursAgo(0.75),
    priority: 'LOW',
    notes: '',
  },

  // In Progress Tasks
  {
    id: 'DT-006',
    orderId: 'ORD-20260411-005',
    pharmacy: 'Green Cross Pharmacy',
    pharmacyAddress: 'Old City, Akola',
    area: 'Old City',
    items: 10,
    totalAmount: 42300,
    status: DELIVERY_STATUSES.IN_PROGRESS,
    assignedTo: { id: 'DP-002', name: 'Suresh Patil' },
    assignedBy: 'System (Auto)',
    assignedAt: hoursAgo(3),
    dispatchedAt: hoursAgo(2.5),
    deliveredAt: null,
    createdAt: hoursAgo(3.5),
    updatedAt: hoursAgo(2.5),
    priority: 'HIGH',
    notes: '',
  },
  {
    id: 'DT-007',
    orderId: 'ORD-20260411-007',
    pharmacy: 'Sanjeevani Store',
    pharmacyAddress: 'Murtizapur Road, Akola',
    area: 'Murtizapur Road',
    items: 3,
    totalAmount: 5600,
    status: DELIVERY_STATUSES.IN_PROGRESS,
    assignedTo: { id: 'DP-005', name: 'Vijay Mohite' },
    assignedBy: 'Vikram Singh',
    assignedAt: hoursAgo(4),
    dispatchedAt: hoursAgo(3),
    deliveredAt: null,
    createdAt: hoursAgo(4.5),
    updatedAt: hoursAgo(3),
    priority: 'MEDIUM',
    notes: '',
  },
  {
    id: 'DT-008',
    orderId: 'ORD-20260411-012',
    pharmacy: 'Netra Medicals',
    pharmacyAddress: 'Gaddam Plot, Akola',
    area: 'Gaddam Plot',
    items: 7,
    totalAmount: 21500,
    status: DELIVERY_STATUSES.IN_PROGRESS,
    assignedTo: { id: 'DP-001', name: 'Rajesh Kumar' },
    assignedBy: 'System (Auto)',
    assignedAt: hoursAgo(2),
    dispatchedAt: hoursAgo(1),
    deliveredAt: null,
    createdAt: hoursAgo(2.5),
    updatedAt: hoursAgo(1),
    priority: 'LOW',
    notes: '',
  },

  // Delivered Tasks
  {
    id: 'DT-009',
    orderId: 'ORD-20260410-003',
    pharmacy: 'Wellness Drug House',
    pharmacyAddress: 'Akola Fort, Akola',
    area: 'Akola Fort',
    items: 9,
    totalAmount: 31200,
    status: DELIVERY_STATUSES.DELIVERED,
    assignedTo: { id: 'DP-004', name: 'Prakash Jadhav' },
    assignedBy: 'System (Auto)',
    assignedAt: hoursAgo(8),
    dispatchedAt: hoursAgo(7),
    deliveredAt: hoursAgo(5),
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(5),
    priority: 'MEDIUM',
    notes: 'Delivered on time',
  },
  {
    id: 'DT-010',
    orderId: 'ORD-20260410-006',
    pharmacy: 'LifeCare Pharma',
    pharmacyAddress: 'Station Road, Akola',
    area: 'Station Road',
    items: 5,
    totalAmount: 15800,
    status: DELIVERY_STATUSES.DELIVERED,
    assignedTo: { id: 'DP-005', name: 'Vijay Mohite' },
    assignedBy: 'Vikram Singh',
    assignedAt: hoursAgo(10),
    dispatchedAt: hoursAgo(9),
    deliveredAt: hoursAgo(7),
    createdAt: hoursAgo(11),
    updatedAt: hoursAgo(7),
    priority: 'LOW',
    notes: '',
  },
  {
    id: 'DT-011',
    orderId: 'ORD-20260410-009',
    pharmacy: 'Delhi Medical Store',
    pharmacyAddress: 'Balapur Naka, Akola',
    area: 'Balapur Naka',
    items: 11,
    totalAmount: 48600,
    status: DELIVERY_STATUSES.DELIVERED,
    assignedTo: { id: 'DP-005', name: 'Vijay Mohite' },
    assignedBy: 'System (Auto)',
    assignedAt: hoursAgo(12),
    dispatchedAt: hoursAgo(11),
    deliveredAt: hoursAgo(9),
    createdAt: hoursAgo(13),
    updatedAt: hoursAgo(9),
    priority: 'HIGH',
    notes: 'Priority delivery completed',
  },
];

// ===== Mock Approved Leaves (for leave sync) =====
export const mockApprovedLeaves = [
  {
    id: 'LV-2026-010',
    userId: 'STAFF-003',
    leaveType: 'SICK',
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'APPROVED',
  },
];

// ===== Available Staff for Delivery Role Assignment =====
export const mockAvailableStaff = [
  { id: 'STAFF-006', name: 'Amit Sharma', phone: '9876543215', currentRole: 'STAFF' },
  { id: 'STAFF-007', name: 'Nitin Raut', phone: '9876543216', currentRole: 'STAFF' },
  { id: 'STAFF-008', name: 'Kiran Bhand', phone: '9876543217', currentRole: 'STAFF' },
];

/**
 * Auto-assign a delivery task based on area mapping and availability
 * Returns the assigned personnel ID or null
 */
export function autoAssignDeliveryTask(task, areaMappings, personnel) {
  // Step 1: Identify area from task
  const area = task.area;
  if (!area) return null;

  // Step 2: Find area mapping
  const mapping = areaMappings.find((m) => m.area === area);
  if (!mapping) return null;

  // Step 3: Check primary availability
  const primary = personnel.find((p) => p.id === mapping.primary);
  if (primary && primary.availability === DELIVERY_AVAILABILITY.AVAILABLE) {
    return {
      personnelId: primary.id,
      personnelName: primary.name,
      assignedBy: 'System (Auto)',
    };
  }

  // Step 4: Check backup availability
  const backup = personnel.find((p) => p.id === mapping.backup);
  if (backup && backup.availability === DELIVERY_AVAILABILITY.AVAILABLE) {
    return {
      personnelId: backup.id,
      personnelName: backup.name,
      assignedBy: 'System (Auto - Backup)',
    };
  }

  // No one available
  return null;
}

/**
 * Extract area from pharmacy address
 * e.g., "Shiv Medical, Gaddam Plot, Akola" → "Gaddam Plot"
 */
export function extractAreaFromAddress(address) {
  if (!address) return '';
  const parts = address.split(',').map((p) => p.trim());
  // Usually the area is the second-to-last part
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return parts[0] || '';
}

/**
 * Format timestamp for display
 */
export function formatDeliveryTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
