// ===== User Roles =====
export const ROLES = {
  STAFF: 'STAFF',
  MANAGEMENT: 'MANAGEMENT',
  ADMIN: 'ADMIN',
};

// ===== Order Statuses =====
export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  PROCESSING: 'PROCESSING',
  AT_SUBSTATION: 'AT_SUBSTATION',
  DISPATCHING: 'DISPATCHING',
  DISPATCHED: 'DISPATCHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ===== Order Status Config (label + color) =====
export const ORDER_STATUS_CONFIG = {
  PLACED: { label: 'Placed', color: 'info' },
  PROCESSING: { label: 'Processing', color: 'warning' },
  AT_SUBSTATION: { label: 'At Sub-Station', color: 'warning' },
  DISPATCHING: { label: 'Dispatching', color: 'primary' },
  DISPATCHED: { label: 'Dispatched', color: 'success' },
  COMPLETED: { label: 'Completed', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'danger' },
};

// ===== Request Statuses =====
export const REQUEST_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// ===== Request Types =====
export const REQUEST_TYPES = {
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  MODIFY: 'MODIFY',
};

// ===== Sub-Station Statuses =====
export const SUBSTATION_STATUSES = {
  ACTIVE: 'ACTIVE',
  IDLE: 'IDLE',
  MAINTENANCE: 'MAINTENANCE',
};

// ===== Timeline Status Icons =====
export const TIMELINE_STATUS = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
};

// ===== Sidebar Navigation Items =====
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'divider-staff',
    label: '',
    path: '',
    icon: '',
    roles: [ROLES.STAFF],
    isDivider: true,
  },
  {
    id: 'my-portal',
    label: 'My Portal',
    path: '/my-portal',
    icon: 'user',
    roles: [ROLES.STAFF],
  },
  {
    id: 'payment-reminder',
    label: 'Payment Reminder',
    path: '/payment-reminder',
    icon: 'dollar',
    roles: [ROLES.STAFF],
  },
  {
    id: 'my-tasks',
    label: 'My Tasks',
    path: '/my-tasks',
    icon: 'clipboard',
    roles: [ROLES.STAFF],
  },
  {
    id: 'leave-application',
    label: 'Leave Application',
    path: '/leave-application',
    icon: 'calendar',
    roles: [ROLES.STAFF],
  },
  {
    id: 'stock-checking',
    label: 'Stock Checking',
    path: '/stock-checking',
    icon: 'package',
    roles: [ROLES.STAFF],
  },
  {
    id: 'raise-request',
    label: 'Raise Request',
    path: '/raise-request',
    icon: 'send',
    roles: [ROLES.STAFF],
  },
  {
    id: 'divider-staff-end',
    label: '',
    path: '',
    icon: '',
    roles: [ROLES.STAFF],
    isDivider: true,
  },
  {
    id: 'order-tracking',
    label: 'Order Tracking',
    path: '/order-tracking',
    icon: 'tracking',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'barcode-generator',
    label: 'Barcode Generator',
    path: '/barcode-generator',
    icon: 'barcode',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'substation-status',
    label: 'Sub-Station Status',
    path: '/substation-status',
    icon: 'substation',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'sub-stations',
    label: 'Sub-Stations',
    path: '/sub-stations',
    icon: 'substations',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'substation-management',
    label: 'Sub-Station Management',
    path: '/substation-management',
    icon: 'settings',
    roles: [ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'divider-1',
    label: '',
    path: '',
    icon: '',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
    isDivider: true,
  },
  {
    id: 'request-raiser',
    label: 'Raise Request',
    path: '/request-raiser',
    icon: 'request',
    roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'requests',
    label: 'Request Management',
    path: '/requests',
    icon: 'requests',
    roles: [ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'divider-2',
    label: '',
    path: '',
    icon: '',
    roles: [ROLES.MANAGEMENT, ROLES.ADMIN],
    isDivider: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'analytics',
    roles: [ROLES.MANAGEMENT, ROLES.ADMIN],
  },
  {
    id: 'user-management',
    label: 'User Management',
    path: '/user-management',
    icon: 'users',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: 'audit',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'system-config',
    label: 'System Config',
    path: '/system-config',
    icon: 'config',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'divider-3',
    label: '',
    path: '',
    icon: '',
    roles: [ROLES.ADMIN, ROLES.MANAGEMENT],
    isDivider: true,
  },
  {
    id: 'utility',
    label: 'Utility Module',
    path: '/utility',
    icon: 'utility',
    roles: [ROLES.ADMIN, ROLES.MANAGEMENT],
  },
];

// ===== Sub-Stations (organized by Pharma Company) =====
export const SUBSTATIONS = [
  {
    id: 'STN-ABBOTT',
    name: 'ABBOTT',
    displayName: 'Abbott Pharma',
    status: 'ACTIVE',
    location: 'Zone A - Station 1',
  },
  {
    id: 'STN-MANKIND',
    name: 'MANKIND',
    displayName: 'Mankind Pharma',
    status: 'ACTIVE',
    location: 'Zone A - Station 2',
  },
  {
    id: 'STN-CIPLA',
    name: 'CIPLA',
    displayName: 'Cipla',
    status: 'ACTIVE',
    location: 'Zone B - Station 1',
  },
  {
    id: 'STN-LUPIN',
    name: 'LUPIN',
    displayName: 'Lupin',
    status: 'ACTIVE',
    location: 'Zone B - Station 2',
  },
  {
    id: 'STN-SUN',
    name: 'SUN',
    displayName: 'Sun Pharma',
    status: 'ACTIVE',
    location: 'Zone C - Station 1',
  },
  {
    id: 'STN-ZYDUS',
    name: 'ZYDUS',
    displayName: 'Zydus Cadila',
    status: 'ACTIVE',
    location: 'Zone C - Station 2',
  },
  {
    id: 'STN-DRREDDY',
    name: 'DRREDDY',
    displayName: 'Dr. Reddy\'s',
    status: 'IDLE',
    location: 'Zone D - Station 1',
  },
  {
    id: 'STN-AJANTA',
    name: 'AJANTA',
    displayName: 'Ajanta Pharma',
    status: 'MAINTENANCE',
    location: 'Zone D - Station 2',
  },
];

// ===== Sub-Station Status Config =====
export const SUBSTATION_STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'success', icon: '●' },
  IDLE: { label: 'Idle', color: 'warning', icon: '○' },
  MAINTENANCE: { label: 'Maintenance', color: 'danger', icon: '⚠' },
};

// ===== Mismatch Issue Types (for Request Management) =====
export const MISMATCH_ISSUE_TYPES = [
  'QUANTITY',
  'PRODUCT',
  'PRICING',
  'EXPIRY',
  'OTHER',
];

export const MISMATCH_ISSUE_CONFIG = {
  QUANTITY: { label: 'Quantity Mismatch', color: 'warning' },
  PRODUCT: { label: 'Wrong Product', color: 'danger' },
  PRICING: { label: 'Pricing Issue', color: 'danger' },
  EXPIRY: { label: 'Expiry Date Issue', color: 'danger' },
  OTHER: { label: 'Other Issue', color: 'info' },
};
