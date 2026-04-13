import { createSlice } from '@reduxjs/toolkit';

// Helper to create relative timestamps
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

const mockEmployees = [
  {
    id: 'EMP-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@wholesale.com',
    role: 'OPERATOR',
    department: 'Warehouse',
    status: 'WORKING',
    currentModule: 'Sub-Station',
    currentTask: 'Processing orders at ABBOTT station',
    assignedSubStation: 'STN-ABBOTT',
    subStationName: 'Abbott Pharma',
    phone: '+91-9876543210',
    joinDate: '2024-03-15',
    avatar: null,
  },
  {
    id: 'EMP-002',
    name: 'Priya Sharma',
    email: 'priya@wholesale.com',
    role: 'STAFF',
    department: 'Billing',
    status: 'WORKING',
    currentModule: 'Billing',
    currentTask: 'Generating final bills for pending orders',
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543211',
    joinDate: '2024-06-20',
    avatar: null,
  },
  {
    id: 'EMP-003',
    name: 'Amit Patel',
    email: 'amit@wholesale.com',
    role: 'STAFF',
    department: 'Warehouse',
    status: 'IDLE',
    currentModule: null,
    currentTask: null,
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543212',
    joinDate: '2023-11-10',
    avatar: null,
  },
  {
    id: 'EMP-004',
    name: 'Sneha Deshmukh',
    email: 'sneha@wholesale.com',
    role: 'OPERATOR',
    department: 'Warehouse',
    status: 'WORKING',
    currentModule: 'Sub-Station',
    currentTask: 'Stock verification at CIPLA station',
    assignedSubStation: 'STN-CIPLA',
    subStationName: 'Cipla',
    phone: '+91-9876543213',
    joinDate: '2024-01-05',
    avatar: null,
  },
  {
    id: 'EMP-005',
    name: 'Vikram Singh',
    email: 'vikram@wholesale.com',
    role: 'STAFF',
    department: 'Delivery',
    status: 'WORKING',
    currentModule: 'Delivery',
    currentTask: 'Delivering order ORD-20260413-003 to Gaddam Plot',
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543214',
    joinDate: '2024-02-18',
    avatar: null,
  },
  {
    id: 'EMP-006',
    name: 'Neha Jadhav',
    email: 'neha@wholesale.com',
    role: 'STAFF',
    department: 'Orders',
    status: 'ON_LEAVE',
    currentModule: null,
    currentTask: null,
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543215',
    joinDate: '2023-09-22',
    avatar: null,
  },
  {
    id: 'EMP-007',
    name: 'Suresh Kulkarni',
    email: 'suresh@wholesale.com',
    role: 'OPERATOR',
    department: 'Warehouse',
    status: 'WORKING',
    currentModule: 'Sub-Station',
    currentTask: 'Dispatching orders from LUPIN station',
    assignedSubStation: 'STN-LUPIN',
    subStationName: 'Lupin',
    phone: '+91-9876543216',
    joinDate: '2023-07-14',
    avatar: null,
  },
  {
    id: 'EMP-008',
    name: 'Kavita Raut',
    email: 'kavita@wholesale.com',
    role: 'STAFF',
    department: 'Billing',
    status: 'WORKING',
    currentModule: 'Billing',
    currentTask: 'Processing return bills',
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543217',
    joinDate: '2024-04-01',
    avatar: null,
  },
  {
    id: 'EMP-009',
    name: 'Deepak Mohite',
    email: 'deepak@wholesale.com',
    role: 'STAFF',
    department: 'Delivery',
    status: 'ON_LEAVE',
    currentModule: null,
    currentTask: null,
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543218',
    joinDate: '2024-08-10',
    avatar: null,
  },
  {
    id: 'EMP-010',
    name: 'Anita Pawar',
    email: 'anita@wholesale.com',
    role: 'OPERATOR',
    department: 'Warehouse',
    status: 'IDLE',
    currentModule: null,
    currentTask: null,
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543219',
    joinDate: '2024-05-25',
    avatar: null,
  },
  {
    id: 'EMP-011',
    name: 'Manoj Tiwari',
    email: 'manoj@wholesale.com',
    role: 'STAFF',
    department: 'Orders',
    status: 'WORKING',
    currentModule: 'Order',
    currentTask: 'Processing new order placements',
    assignedSubStation: null,
    subStationName: null,
    phone: '+91-9876543220',
    joinDate: '2023-12-03',
    avatar: null,
  },
  {
    id: 'EMP-012',
    name: 'Pooja Khedkar',
    email: 'pooja@wholesale.com',
    role: 'OPERATOR',
    department: 'Warehouse',
    status: 'WORKING',
    currentModule: 'Sub-Station',
    currentTask: 'Quality check at SUN PHARMA station',
    assignedSubStation: 'STN-SUN',
    subStationName: 'Sun Pharma',
    phone: '+91-9876543221',
    joinDate: '2024-01-20',
    avatar: null,
  },
];

const mockAttendance = {
  'EMP-001': {
    loginTime: hoursAgo(6),
    logoutTime: null,
    totalHours: 6.0,
    breakMinutes: 30,
  },
  'EMP-002': {
    loginTime: hoursAgo(5.5),
    logoutTime: null,
    totalHours: 5.5,
    breakMinutes: 15,
  },
  'EMP-003': {
    loginTime: hoursAgo(2),
    logoutTime: null,
    totalHours: 2.0,
    breakMinutes: 0,
  },
  'EMP-004': {
    loginTime: hoursAgo(7),
    logoutTime: null,
    totalHours: 7.0,
    breakMinutes: 45,
  },
  'EMP-005': {
    loginTime: hoursAgo(4),
    logoutTime: null,
    totalHours: 4.0,
    breakMinutes: 20,
  },
  'EMP-006': { loginTime: null, logoutTime: null, totalHours: 0, breakMinutes: 0 },
  'EMP-007': {
    loginTime: hoursAgo(8),
    logoutTime: null,
    totalHours: 8.0,
    breakMinutes: 30,
  },
  'EMP-008': {
    loginTime: hoursAgo(5),
    logoutTime: null,
    totalHours: 5.0,
    breakMinutes: 20,
  },
  'EMP-009': { loginTime: null, logoutTime: null, totalHours: 0, breakMinutes: 0 },
  'EMP-010': {
    loginTime: hoursAgo(1),
    logoutTime: null,
    totalHours: 1.0,
    breakMinutes: 0,
  },
  'EMP-011': {
    loginTime: hoursAgo(6.5),
    logoutTime: null,
    totalHours: 6.5,
    breakMinutes: 30,
  },
  'EMP-012': {
    loginTime: hoursAgo(7.5),
    logoutTime: null,
    totalHours: 7.5,
    breakMinutes: 40,
  },
};

const mockProductivity = {
  'EMP-001': { billsProcessed: 18, ordersHandled: 24, tasksCompleted: 12 },
  'EMP-002': { billsProcessed: 32, ordersHandled: 0, tasksCompleted: 8 },
  'EMP-003': { billsProcessed: 2, ordersHandled: 1, tasksCompleted: 0 },
  'EMP-004': { billsProcessed: 0, ordersHandled: 15, tasksCompleted: 10 },
  'EMP-005': { billsProcessed: 0, ordersHandled: 6, tasksCompleted: 6 },
  'EMP-006': { billsProcessed: 0, ordersHandled: 0, tasksCompleted: 0 },
  'EMP-007': { billsProcessed: 5, ordersHandled: 20, tasksCompleted: 14 },
  'EMP-008': { billsProcessed: 28, ordersHandled: 0, tasksCompleted: 7 },
  'EMP-009': { billsProcessed: 0, ordersHandled: 0, tasksCompleted: 0 },
  'EMP-010': { billsProcessed: 1, ordersHandled: 2, tasksCompleted: 1 },
  'EMP-011': { billsProcessed: 0, ordersHandled: 30, tasksCompleted: 15 },
  'EMP-012': { billsProcessed: 0, ordersHandled: 18, tasksCompleted: 11 },
};

const mockActivityLog = {
  'EMP-001': [
    { time: minsAgo(10), action: 'Processed order ORD-20260413-042', module: 'Sub-Station' },
    { time: minsAgo(25), action: 'Stock update at ABBOTT station', module: 'Sub-Station' },
    { time: hoursAgo(1), action: 'Dispatched order ORD-20260413-038', module: 'Sub-Station' },
    { time: hoursAgo(2), action: 'Logged into ABBOTT station', module: 'Sub-Station' },
    { time: hoursAgo(6), action: 'Shift started', module: 'System' },
  ],
  'EMP-002': [
    { time: minsAgo(5), action: 'Generated final bill for ORD-20260413-040', module: 'Billing' },
    { time: minsAgo(20), action: 'Processed return bill RB-0091', module: 'Billing' },
    { time: hoursAgo(1.5), action: 'Generated final bill for ORD-20260413-035', module: 'Billing' },
    { time: hoursAgo(5.5), action: 'Shift started', module: 'System' },
  ],
  'EMP-003': [
    { time: hoursAgo(2), action: 'Logged in (idle since)', module: 'System' },
  ],
  'EMP-004': [
    { time: minsAgo(8), action: 'Quality check completed for batch B-204', module: 'Sub-Station' },
    { time: minsAgo(30), action: 'Stock verification at CIPLA station', module: 'Sub-Station' },
    { time: hoursAgo(1.5), action: 'Processed order ORD-20260413-031', module: 'Sub-Station' },
    { time: hoursAgo(3), action: 'Received stock transfer', module: 'Sub-Station' },
    { time: hoursAgo(7), action: 'Shift started', module: 'System' },
  ],
  'EMP-005': [
    { time: minsAgo(15), action: 'Delivered order ORD-20260413-003', module: 'Delivery' },
    { time: hoursAgo(1), action: 'Picked up order ORD-20260413-005 from warehouse', module: 'Delivery' },
    { time: hoursAgo(2), action: 'Delivered order ORD-20260413-001', module: 'Delivery' },
    { time: hoursAgo(4), action: 'Shift started', module: 'System' },
  ],
  'EMP-006': [],
  'EMP-007': [
    { time: minsAgo(12), action: 'Dispatched order ORD-20260413-044', module: 'Sub-Station' },
    { time: minsAgo(35), action: 'Processed order ORD-20260413-041', module: 'Sub-Station' },
    { time: hoursAgo(1), action: 'Stock reconciliation at LUPIN station', module: 'Sub-Station' },
    { time: hoursAgo(2.5), action: 'Dispatched 3 orders', module: 'Sub-Station' },
    { time: hoursAgo(8), action: 'Shift started', module: 'System' },
  ],
  'EMP-008': [
    { time: minsAgo(7), action: 'Processing return bill RB-0093', module: 'Billing' },
    { time: minsAgo(40), action: 'Generated final bill for ORD-20260413-039', module: 'Billing' },
    { time: hoursAgo(2), action: 'Generated 5 bills in batch', module: 'Billing' },
    { time: hoursAgo(5), action: 'Shift started', module: 'System' },
  ],
  'EMP-009': [],
  'EMP-010': [
    { time: hoursAgo(1), action: 'Logged in (idle since)', module: 'System' },
  ],
  'EMP-011': [
    { time: minsAgo(3), action: 'Placed order ORD-20260413-045', module: 'Order' },
    { time: minsAgo(18), action: 'Processed order ORD-20260413-044', module: 'Order' },
    { time: minsAgo(45), action: 'Updated order status for ORD-20260413-040', module: 'Order' },
    { time: hoursAgo(1.5), action: 'Processed 8 new orders', module: 'Order' },
    { time: hoursAgo(6.5), action: 'Shift started', module: 'System' },
  ],
  'EMP-012': [
    { time: minsAgo(5), action: 'Quality check passed for batch B-198', module: 'Sub-Station' },
    { time: minsAgo(22), action: 'Received stock at SUN PHARMA station', module: 'Sub-Station' },
    { time: hoursAgo(1), action: 'Processed order ORD-20260413-036', module: 'Sub-Station' },
    { time: hoursAgo(3), action: 'Stock verification completed', module: 'Sub-Station' },
    { time: hoursAgo(7.5), action: 'Shift started', module: 'System' },
  ],
};

const mockLeaveRecords = [
  {
    employeeId: 'EMP-006',
    employeeName: 'Neha Jadhav',
    leaveType: 'Sick Leave',
    startDate: '2026-04-12',
    endDate: '2026-04-14',
    status: 'APPROVED',
    reason: 'Fever and cold',
    approvedBy: 'Admin',
  },
  {
    employeeId: 'EMP-009',
    employeeName: 'Deepak Mohite',
    leaveType: 'Casual Leave',
    startDate: '2026-04-13',
    endDate: '2026-04-13',
    status: 'APPROVED',
    reason: 'Personal work',
    approvedBy: 'Manager',
  },
  {
    employeeId: 'EMP-003',
    employeeName: 'Amit Patel',
    leaveType: 'Casual Leave',
    startDate: '2026-04-10',
    endDate: '2026-04-10',
    status: 'COMPLETED',
    reason: 'Family function',
    approvedBy: 'Manager',
  },
];

const mockPerformance = {
  'EMP-001': { rating: 4.2, feedback: 'Consistent performer, handles ABBOTT station efficiently.', lastReview: '2026-03-15' },
  'EMP-002': { rating: 4.5, feedback: 'Excellent billing accuracy and speed.', lastReview: '2026-03-20' },
  'EMP-003': { rating: 3.0, feedback: 'Needs improvement in task engagement. Frequently idle.', lastReview: '2026-03-10' },
  'EMP-004': { rating: 4.0, feedback: 'Reliable operator, good at quality checks.', lastReview: '2026-03-18' },
  'EMP-005': { rating: 4.3, feedback: 'Timely deliveries, good customer interaction.', lastReview: '2026-03-22' },
  'EMP-006': { rating: 3.8, feedback: 'Good team player, regular attendance.', lastReview: '2026-03-12' },
  'EMP-007': { rating: 4.7, feedback: 'Top performer, excellent dispatch management.', lastReview: '2026-03-25' },
  'EMP-008': { rating: 4.1, feedback: 'Accurate billing, handles returns well.', lastReview: '2026-03-14' },
  'EMP-009': { rating: 3.5, feedback: 'Average performance, needs more ownership.', lastReview: '2026-03-08' },
  'EMP-010': { rating: 2.8, feedback: 'Low engagement, requires supervision.', lastReview: '2026-03-05' },
  'EMP-011': { rating: 4.4, feedback: 'Fast order processing, highly productive.', lastReview: '2026-03-20' },
  'EMP-012': { rating: 4.0, feedback: 'Thorough quality checks, dependable.', lastReview: '2026-03-16' },
};

const initialState = {
  employees: mockEmployees,
  attendance: mockAttendance,
  productivity: mockProductivity,
  activityLog: mockActivityLog,
  leaveRecords: mockLeaveRecords,
  performance: mockPerformance,
  isLoading: false,
  selectedEmployee: null,
  filters: {
    role: null,
    status: null,
    subStation: null,
    searchQuery: '',
  },
};

const staffTrackSlice = createSlice({
  name: 'staffTrack',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: (state) => {
      state.filters = { role: null, status: null, subStation: null, searchQuery: '' };
    },
    selectEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    updateEmployeeStatus: (state, action) => {
      const { employeeId, status } = action.payload;
      const emp = state.employees.find((e) => e.id === employeeId);
      if (emp) emp.status = status;
    },
    addFeedback: (state, action) => {
      const { employeeId, feedback, rating } = action.payload;
      if (state.performance[employeeId]) {
        state.performance[employeeId].feedback = feedback;
        if (rating) state.performance[employeeId].rating = rating;
        state.performance[employeeId].lastReview = new Date().toISOString().split('T')[0];
      }
    },
    addActivityLog: (state, action) => {
      const { employeeId, action: act, module: mod } = action.payload;
      if (state.activityLog[employeeId]) {
        state.activityLog[employeeId].unshift({
          time: new Date().toISOString(),
          action: act,
          module: mod || 'System',
        });
      }
    },
  },
});

export const {
  setFilter,
  clearFilters,
  selectEmployee,
  clearSelectedEmployee,
  updateEmployeeStatus,
  addFeedback,
  addActivityLog,
} = staffTrackSlice.actions;

export default staffTrackSlice.reducer;
