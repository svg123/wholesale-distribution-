import React, { useState, useMemo } from 'react';
import {
  FiPlus, FiFileText, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiSearch, FiFilter, FiArrowRight, FiSend,
  FiUser, FiTag, FiCalendar, FiMessageSquare, FiEye,
  FiInbox, FiChevronDown, FiChevronUp, FiEdit3, FiTruck,
  FiPackage, FiClipboard, FiHash, FiActivity, FiX
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

// ─── Concern Types ───────────────────────────────────────────────────
const CONCERN_TYPES = {
  INQUIRY: {
    label: 'Inquiry Ticket',
    icon: '❓',
    description: 'General query or information request',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    bgSolidClass: 'bg-blue-50',
    borderLightClass: 'border-blue-200',
  },
  STOCK_CHECK: {
    label: 'Stock Check Ticket',
    icon: '📦',
    description: 'Stock verification or discrepancy report',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
    bgSolidClass: 'bg-green-50',
    borderLightClass: 'border-green-200',
  },
  BATCH_UPDATE: {
    label: 'Batch Update Ticket',
    icon: '🏷️',
    description: 'Batch number or product detail update',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
    bgSolidClass: 'bg-purple-50',
    borderLightClass: 'border-purple-200',
  },
  TASK_TRANSFER: {
    label: 'Task Transfer',
    icon: '🔄',
    description: 'Transfer a task to another staff member',
    color: 'amber',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    bgSolidClass: 'bg-amber-50',
    borderLightClass: 'border-amber-200',
  },
  DELIVERY_UPDATE: {
    label: 'Delivery Update',
    icon: '🚚',
    description: 'Delivery status or schedule update',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-300',
    bgSolidClass: 'bg-orange-50',
    borderLightClass: 'border-orange-200',
  },
  EXPIRY_UPDATE: {
    label: 'Expiry Update',
    icon: '⏰',
    description: 'Product expiry tracking or alert',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    bgSolidClass: 'bg-red-50',
    borderLightClass: 'border-red-200',
  },
  CONVEYOR: {
    label: 'Conveyor Management',
    icon: '🔧',
    description: 'Conveyor system maintenance or issue',
    color: 'teal',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-300',
    bgSolidClass: 'bg-teal-50',
    borderLightClass: 'border-teal-200',
  },
};

// ─── Ticket Statuses ─────────────────────────────────────────────────
const TICKET_STATUSES = {
  PENDING: { label: 'Pending Approval', color: 'yellow', icon: FiClock, badgeClass: 'badge-warning' },
  APPROVED: { label: 'Approved', color: 'green', icon: FiCheckCircle, badgeClass: 'badge-success' },
  REJECTED: { label: 'Rejected', color: 'red', icon: FiXCircle, badgeClass: 'badge-danger' },
};

// ─── Priority Levels ─────────────────────────────────────────────────
const PRIORITIES = {
  LOW: { label: 'Low', bgMutedClass: 'bg-gray-100', textClass: 'text-gray-700' },
  MEDIUM: { label: 'Medium', bgMutedClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  HIGH: { label: 'High', bgMutedClass: 'bg-red-100', textClass: 'text-red-700' },
};

// ─── Mock Staff Members ──────────────────────────────────────────────
const STAFF_MEMBERS = [
  { id: 'STF-001', name: 'Rajesh Kumar', substation: 'Cipla', role: 'STAFF' },
  { id: 'STF-002', name: 'Kamla Devi', substation: 'Mankind', role: 'STAFF' },
  { id: 'STF-003', name: 'Suresh Patel', substation: 'Abbott', role: 'STAFF' },
  { id: 'STF-004', name: 'Priya Sharma', substation: 'Sun Pharma', role: 'STAFF' },
  { id: 'STF-005', name: 'Amit Verma', substation: 'Lupin', role: 'STAFF' },
  { id: 'MGT-001', name: 'Vikram Singh', substation: 'Main Warehouse', role: 'MANAGEMENT' },
  { id: 'MGT-002', name: 'Anita Desai', substation: 'Main Warehouse', role: 'MANAGEMENT' },
];

// ─── Dynamic Field Configs per Concern Type ──────────────────────────
const DYNAMIC_FIELDS = {
  INQUIRY: [
    { name: 'relatedModule', label: 'Related Module', type: 'select', options: ['Orders', 'Stock', 'Dispatch', 'Billing', 'General'], placeholder: 'Select module' },
    { name: 'queryType', label: 'Query Type', type: 'select', options: ['Information', 'Clarification', 'Process', 'Technical'], placeholder: 'Select query type' },
  ],
  STOCK_CHECK: [
    { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., Paracetamol 500mg' },
    { name: 'batch', label: 'Batch Number', type: 'text', placeholder: 'e.g., B-2026-045' },
    { name: 'section', label: 'Section', type: 'select', options: ['Section A', 'Section B', 'Section C'], placeholder: 'Select section' },
    { name: 'discrepancy', label: 'Discrepancy Details', type: 'textarea', placeholder: 'Describe the stock discrepancy found...' },
  ],
  BATCH_UPDATE: [
    { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., Amoxicillin 500mg' },
    { name: 'oldBatch', label: 'Current Batch Number', type: 'text', placeholder: 'Existing batch number' },
    { name: 'newBatch', label: 'New Batch Number', type: 'text', placeholder: 'New batch number' },
    { name: 'quantity', label: 'Quantity', type: 'text', placeholder: 'Number of units' },
    { name: 'reason', label: 'Reason for Update', type: 'textarea', placeholder: 'Why is this batch update needed...' },
  ],
  TASK_TRANSFER: [
    { name: 'fromStaff', label: 'Transfer From', type: 'select-staff', placeholder: 'Current staff member' },
    { name: 'toStaff', label: 'Transfer To', type: 'select-staff', placeholder: 'Target staff member' },
    { name: 'taskDetails', label: 'Task Details', type: 'textarea', placeholder: 'Describe the task being transferred...' },
    { name: 'deadline', label: 'Deadline', type: 'date' },
  ],
  DELIVERY_UPDATE: [
    { name: 'orderId', label: 'Order ID', type: 'text', placeholder: 'e.g., ORD-2026-001' },
    { name: 'pharmacist', label: 'Pharmacist / Customer', type: 'text', placeholder: 'Customer name' },
    { name: 'deliveryStatus', label: 'Delivery Status', type: 'select', options: ['Pending Dispatch', 'In Transit', 'Delivered', 'Delayed', 'Returned'], placeholder: 'Select status' },
    { name: 'notes', label: 'Delivery Notes', type: 'textarea', placeholder: 'Additional delivery information...' },
  ],
  EXPIRY_UPDATE: [
    { name: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., Ciprofloxacin 500mg' },
    { name: 'batch', label: 'Batch Number', type: 'text', placeholder: 'e.g., B-2026-033' },
    { name: 'currentExpiry', label: 'Current Expiry Date', type: 'date' },
    { name: 'newExpiry', label: 'Corrected Expiry Date', type: 'date' },
    { name: 'severity', label: 'Severity', type: 'select', options: ['Near Expiry (< 3 months)', 'Expiring This Month', 'Already Expired', 'Date Correction'], placeholder: 'Select severity' },
  ],
  CONVEYOR: [
    { name: 'conveyorId', label: 'Conveyor / System ID', type: 'text', placeholder: 'e.g., CVR-001' },
    { name: 'issueType', label: 'Issue Type', type: 'select', options: ['Mechanical Failure', 'Sensor Issue', 'Speed Issue', 'Jam', 'Maintenance Request', 'Other'], placeholder: 'Select issue type' },
    { name: 'location', label: 'Location / Section', type: 'text', placeholder: 'Where is the conveyor located' },
    { name: 'description', label: 'Issue Description', type: 'textarea', placeholder: 'Describe the conveyor issue in detail...' },
  ],
};

// ─── Main Component ──────────────────────────────────────────────────
const RaiseRequest = () => {
  const [activeTab, setActiveTab] = useState('raise');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterConcern, setFilterConcern] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);

  // ─── Form State ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    concernType: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    dynamicFields: {},
  });

  // ─── Mock Tickets ────────────────────────────────────────────────
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-2026-001',
      concernType: 'STOCK_CHECK',
      title: 'Discrepancy in Section B stock count',
      description: 'Found 5 units missing for Amoxicillin 500mg in Section B. Computer shows 400 but physical count is 395. Needs re-verification.',
      priority: 'HIGH',
      createdBy: { id: 'STF-001', name: 'Rajesh Kumar', substation: 'Cipla' },
      assignedTo: { id: 'STF-002', name: 'Kamla Devi', substation: 'Mankind' },
      status: 'PENDING',
      createdAt: '2026-04-10 09:30 AM',
      dynamicFields: { product: 'Amoxicillin 500mg', batch: 'B-2026-039', section: 'Section B', discrepancy: '5 units missing from shelf' },
    },
    {
      id: 'TKT-2026-002',
      concernType: 'BATCH_UPDATE',
      title: 'New batch arrival for Sun Pharma products',
      description: 'New batch B-2026-072 arrived from Sun Pharma. Need to update system with correct batch details for 15 products.',
      priority: 'MEDIUM',
      createdBy: { id: 'STF-003', name: 'Suresh Patel', substation: 'Abbott' },
      assignedTo: { id: 'STF-001', name: 'Rajesh Kumar', substation: 'Cipla' },
      status: 'APPROVED',
      approvedBy: { id: 'MGT-001', name: 'Vikram Singh' },
      approvedAt: '2026-04-09 04:00 PM',
      createdAt: '2026-04-09 10:15 AM',
      dynamicFields: { product: 'Cetirizine 10mg', oldBatch: 'B-2026-032', newBatch: 'B-2026-072', quantity: '300', reason: 'New stock arrival - batch replacement' },
    },
    {
      id: 'TKT-2026-003',
      concernType: 'DELIVERY_UPDATE',
      title: 'MedPlus Pharmacy delivery delayed',
      description: 'Delivery to MedPlus Pharmacy is delayed by 2 days due to stock unavailability for 3 items. Need updated schedule.',
      priority: 'HIGH',
      createdBy: { id: 'STF-002', name: 'Kamla Devi', substation: 'Mankind' },
      assignedTo: { id: 'MGT-001', name: 'Vikram Singh' },
      status: 'REJECTED',
      rejectedBy: { id: 'MGT-001', name: 'Vikram Singh' },
      rejectedAt: '2026-04-08 11:30 AM',
      rejectionReason: 'This should be communicated directly to dispatch team. Not a ticket item.',
      createdAt: '2026-04-08 09:00 AM',
      dynamicFields: { orderId: 'ORD-2026-045', pharmacist: 'MedPlus Pharmacy', deliveryStatus: 'Delayed', notes: '3 items out of stock' },
    },
    {
      id: 'TKT-2026-004',
      concernType: 'EXPIRY_UPDATE',
      title: 'Near-expiry products in Section A',
      description: 'Found 3 products in Section A expiring within next 2 months. Need to flag for early dispatch or return.',
      priority: 'HIGH',
      createdBy: { id: 'STF-004', name: 'Priya Sharma', substation: 'Sun Pharma' },
      assignedTo: { id: 'STF-005', name: 'Amit Verma', substation: 'Lupin' },
      status: 'APPROVED',
      approvedBy: { id: 'MGT-002', name: 'Anita Desai' },
      approvedAt: '2026-04-10 02:00 PM',
      createdAt: '2026-04-10 08:00 AM',
      dynamicFields: { product: 'Metronidazole 400mg', batch: 'B-2025-056', currentExpiry: '2026-06', newExpiry: '2026-06', severity: 'Near Expiry (< 3 months)' },
    },
    {
      id: 'TKT-2026-005',
      concernType: 'TASK_TRANSFER',
      title: 'Transfer barcode labeling task to Kamla',
      description: 'I need to transfer the barcode labeling task for the new Sun Pharma batch to Kamla as I have been assigned urgent dispatch duties.',
      priority: 'MEDIUM',
      createdBy: { id: 'STF-001', name: 'Rajesh Kumar', substation: 'Cipla' },
      assignedTo: { id: 'STF-002', name: 'Kamla Devi', substation: 'Mankind' },
      status: 'PENDING',
      createdAt: '2026-04-11 11:00 AM',
      dynamicFields: { fromStaff: 'STF-001', toStaff: 'STF-002', taskDetails: 'Print and apply barcode labels for 120 items from Sun Pharma batch B-2026-072', deadline: '2026-04-14' },
    },
  ]);

  const currentStaff = STAFF_MEMBERS[0]; // Logged-in staff (Rajesh Kumar)

  // ─── Filtered Tickets ────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = !searchQuery ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
      const matchesConcern = filterConcern === 'ALL' || ticket.concernType === filterConcern;
      return matchesSearch && matchesStatus && matchesConcern;
    });
  }, [tickets, searchQuery, filterStatus, filterConcern]);

  // ─── Ticket Stats ────────────────────────────────────────────────
  const ticketStats = useMemo(() => ({
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'PENDING').length,
    approved: tickets.filter((t) => t.status === 'APPROVED').length,
    rejected: tickets.filter((t) => t.status === 'REJECTED').length,
    myTickets: tickets.filter((t) => t.createdBy.id === currentStaff.id).length,
    assignedToMe: tickets.filter((t) => t.assignedTo.id === currentStaff.id && t.status === 'APPROVED').length,
  }), [tickets, currentStaff.id]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleDynamicFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [fieldName]: value },
    }));
  };

  const resetForm = () => {
    setFormData({
      concernType: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedTo: '',
      dynamicFields: {},
    });
    setShowForm(false);
  };

  const handleSubmit = () => {
    const assignedStaff = STAFF_MEMBERS.find((s) => s.id === formData.assignedTo);
    const newTicket = {
      id: `TKT-2026-${String(tickets.length + 1).padStart(3, '0')}`,
      concernType: formData.concernType,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      createdBy: { id: currentStaff.id, name: currentStaff.name, substation: currentStaff.substation },
      assignedTo: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name, substation: assignedStaff.substation } : { id: '', name: 'Unassigned', substation: '' },
      status: 'PENDING',
      createdAt: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\//g, '-'),
      dynamicFields: { ...formData.dynamicFields },
    };
    setTickets((prev) => [newTicket, ...prev]);
    resetForm();
    setActiveTab('my-tickets');
  };

  const handleApprove = (ticketId) => {
    setTickets((prev) => prev.map((t) =>
      t.id === ticketId
        ? { ...t, status: 'APPROVED', approvedBy: { id: currentStaff.id, name: currentStaff.name }, approvedAt: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\//g, '-') }
        : t
    ));
  };

  const handleReject = (ticketId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      setTickets((prev) => prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'REJECTED', rejectedBy: { id: currentStaff.id, name: currentStaff.name }, rejectedAt: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\//g, '-'), rejectionReason: reason }
          : t
      ));
    }
  };

  // ─── Tabs ────────────────────────────────────────────────────────
  const tabs = [
    { id: 'raise', label: 'Raise Ticket', icon: FiPlus },
    { id: 'my-tickets', label: 'My Tickets', icon: FiInbox },
    { id: 'all-tickets', label: 'All Tickets', icon: FiFileText },
  ];

  const selectedConcernConfig = formData.concernType ? CONCERN_TYPES[formData.concernType] : null;
  const dynamicFields = formData.concernType ? DYNAMIC_FIELDS[formData.concernType] : [];

  // ─── Render Dynamic Field ────────────────────────────────────────
  const renderDynamicField = (field) => {
    const value = formData.dynamicFields[field.name] || '';

    if (field.type === 'select-staff') {
      return (
        <select
          value={value}
          onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
          className="input-field"
        >
          <option value="">{field.placeholder}</option>
          {STAFF_MEMBERS.filter((s) => s.role === 'STAFF').map((staff) => (
            <option key={staff.id} value={staff.id}>{staff.name} — {staff.substation}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
          className="input-field"
        >
          <option value="">{field.placeholder}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
          className="input-field"
          rows={3}
          placeholder={field.placeholder}
        />
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
          className="input-field"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
        className="input-field"
        placeholder={field.placeholder}
      />
    );
  };

  // ─── Render Dynamic Field Display (for ticket view) ─────────────
  const renderDynamicFieldDisplay = (fields) => {
    if (!fields || Object.keys(fields).length === 0) return null;
    const entries = Object.entries(fields).filter(([, v]) => v);
    if (entries.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</p>
        {entries.map(([key, val]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
          let displayValue = val;
          // Resolve staff IDs to names
          if (key === 'fromStaff' || key === 'toStaff') {
            const staff = STAFF_MEMBERS.find((s) => s.id === val);
            displayValue = staff ? `${staff.name} (${staff.substation})` : val;
          }
          return (
            <div key={key} className="flex items-start gap-2">
              <span className="text-xs text-gray-500 min-w-[120px]">{label}:</span>
              <span className="text-xs font-medium text-gray-700">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const isFormValid = formData.concernType && formData.title.trim() && formData.description.trim() && formData.assignedTo;

  // ─── Ticket Card Component ───────────────────────────────────────
  const TicketCard = ({ ticket, showApprovalActions }) => {
    const concernConfig = CONCERN_TYPES[ticket.concernType];
    const statusConfig = TICKET_STATUSES[ticket.status];
    const priorityConfig = PRIORITIES[ticket.priority];
    const isExpanded = expandedTicket === ticket.id;
    const StatusIcon = statusConfig.icon;

    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${concernConfig.bgClass}`}>
                {concernConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">{ticket.id}</span>
                  <span className={`badge ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${priorityConfig.bgMutedClass} ${priorityConfig.textClass}`}>
                    {priorityConfig.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${concernConfig.bgClass} ${concernConfig.textClass}`}>
                    {concernConfig.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-1">{ticket.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.description}</p>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                    {renderDynamicFieldDisplay(ticket.dynamicFields)}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiUser className="w-3 h-3" />
                    From: {ticket.createdBy.name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiArrowRight className="w-3 h-3" />
                    To: {ticket.assignedTo.name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {ticket.createdAt}
                  </span>
                </div>

                {/* Approval/Rejection info */}
                {ticket.status === 'APPROVED' && ticket.approvedBy && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Approved by {ticket.approvedBy.name} at {ticket.approvedAt}
                    </p>
                  </div>
                )}
                {ticket.status === 'REJECTED' && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700 flex items-center gap-1">
                      <FiXCircle className="w-3 h-3" />
                      Rejected by {ticket.rejectedBy?.name} at {ticket.rejectedAt}
                    </p>
                    {ticket.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1 italic">"{ticket.rejectionReason}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 ml-3">
              <button
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {showApprovalActions && ticket.status === 'PENDING' && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleApprove(ticket.id)}
                    className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                  >
                    <FiCheckCircle className="w-3 h-3 inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(ticket.id)}
                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    <FiXCircle className="w-3 h-3 inline mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raise Request</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create tickets and assign tasks to staff members</p>
        </div>
        {!showForm && activeTab === 'raise' && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            New Ticket
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">Total Tickets</p>
            <p className="text-xl font-bold text-gray-900">{ticketStats.total}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{ticketStats.pending}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-xl font-bold text-green-600">{ticketStats.approved}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="text-xl font-bold text-red-600">{ticketStats.rejected}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">My Tickets</p>
            <p className="text-xl font-bold text-blue-600">{ticketStats.myTickets}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <p className="text-xs text-gray-500">Assigned to Me</p>
            <p className="text-xl font-bold text-purple-600">{ticketStats.assignedToMe}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══════════════════ RAISE TICKET TAB ═══════════════════ */}
      {activeTab === 'raise' && (
        <div>
          {!showForm ? (
            <div className="card p-8 text-center">
              <FiSend className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">Raise a New Ticket</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Create a request to assign tasks or report issues to other staff members</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                <FiPlus className="w-4 h-4" />
                Create Ticket
              </button>
            </div>
          ) : (
            <div className="card max-w-3xl">
              <div className="card-header">
                <h3 className="text-base font-semibold text-gray-900">New Ticket</h3>
                <p className="text-xs text-gray-500">Fill in the details below. Your ticket will be sent to manager for approval.</p>
              </div>
              <div className="card-body space-y-5">
                {/* Step 1: Concern Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5"><FiTag className="w-4 h-4" /> Concern Type</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(CONCERN_TYPES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, concernType: key, dynamicFields: {} }));
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.concernType === key
                            ? `${config.borderClass} ${config.bgSolidClass} shadow-sm`
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <p className={`text-xs font-medium mt-1 ${formData.concernType === key ? config.textClass : 'text-gray-700'}`}>
                          {config.label}
                        </p>
                      </button>
                    ))}
                  </div>
                  {selectedConcernConfig && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {selectedConcernConfig.description}
                    </p>
                  )}
                </div>

                {/* Step 2: Common Fields */}
                {formData.concernType && (
                  <>
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5"><FiEdit3 className="w-4 h-4" /> Title / Subject</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        placeholder="Brief summary of the ticket..."
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5"><FiMessageSquare className="w-4 h-4" /> Description</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="input-field"
                        rows={4}
                        placeholder="Provide detailed description of the issue or request..."
                      />
                    </div>

                    {/* Priority & Assigned To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <span className="flex items-center gap-1.5"><FiActivity className="w-4 h-4" /> Priority</span>
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                          className="input-field"
                        >
                          {Object.entries(PRIORITIES).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4" /> Assign To</span>
                        </label>
                        <select
                          value={formData.assignedTo}
                          onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                          className="input-field"
                        >
                          <option value="">Select staff or manager...</option>
                          {STAFF_MEMBERS.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} — {staff.substation} {staff.role === 'MANAGEMENT' ? '(Manager)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Created By (auto-filled) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Created By:</span> {currentStaff.name} ({currentStaff.substation}) — <span className="font-medium">Auto-filled</span>
                      </p>
                    </div>

                    {/* Step 3: Dynamic Fields */}
                    {dynamicFields.length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center gap-1.5"><FiClipboard className="w-4 h-4" /> {selectedConcernConfig.label} Details</span>
                        </label>
                        <div className="space-y-3">
                          {dynamicFields.map((field) => (
                            <div key={field.name}>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                              {renderDynamicField(field)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        Submit for Approval
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ MY TICKETS TAB ═══════════════════ */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <VoiceSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => setSearchQuery(val)}
                placeholder="Search my tickets..."
                inputWidth="w-full"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const myTickets = filteredTickets.filter((t) => t.createdBy.id === currentStaff.id);
              if (myTickets.length === 0) {
                return (
                  <div className="card p-8 text-center">
                    <FiInbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400">No tickets created by you</p>
                  </div>
                );
              }
              return myTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showApprovalActions={false} />
              ));
            })()}
          </div>
        </div>
      )}

      {/* ═══════════════════ ALL TICKETS TAB ═══════════════════ */}
      {activeTab === 'all-tickets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <VoiceSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => setSearchQuery(val)}
                placeholder="Search all tickets by ID, title, description, or assignee..."
                inputWidth="w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={filterConcern}
              onChange={(e) => setFilterConcern(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="ALL">All Types</option>
              {Object.entries(CONCERN_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="card p-8 text-center">
                <FiFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showApprovalActions={true} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaiseRequest;
