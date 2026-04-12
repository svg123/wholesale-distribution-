import React, { useState, useMemo } from 'react';
import {
  FiCalendar, FiClock, FiAlertTriangle, FiCheck, FiX,
  FiPlus, FiFileText, FiFilter, FiSearch, FiArrowRight,
  FiMessageSquare, FiUser, FiCheckCircle, FiXCircle, FiLoader
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

const LEAVE_TYPES = {
  CASUAL: { label: 'Casual Leave', color: 'blue', icon: '🏖️', maxDays: 12, bgClass: 'bg-blue-500', bgLightClass: 'bg-blue-50', bgMutedClass: 'bg-blue-100', borderClass: 'border-blue-300', borderLightClass: 'border-blue-200', textClass: 'text-blue-700' },
  SICK: { label: 'Sick Leave', color: 'red', icon: '🏥', maxDays: 10, bgClass: 'bg-red-500', bgLightClass: 'bg-red-50', bgMutedClass: 'bg-red-100', borderClass: 'border-red-300', borderLightClass: 'border-red-200', textClass: 'text-red-700' },
  EARNED: { label: 'Earned Leave', color: 'green', icon: '⭐', maxDays: 15, bgClass: 'bg-green-500', bgLightClass: 'bg-green-50', bgMutedClass: 'bg-green-100', borderClass: 'border-green-300', borderLightClass: 'border-green-200', textClass: 'text-green-700' },
  EMERGENCY: { label: 'Emergency Leave', color: 'orange', icon: '🚨', maxDays: 5, bgClass: 'bg-orange-500', bgLightClass: 'bg-orange-50', bgMutedClass: 'bg-orange-100', borderClass: 'border-orange-300', borderLightClass: 'border-orange-200', textClass: 'text-orange-700' },
  HALF_DAY: { label: 'Half Day', color: 'purple', icon: '🕐', maxDays: 6, bgClass: 'bg-purple-500', bgLightClass: 'bg-purple-50', bgMutedClass: 'bg-purple-100', borderClass: 'border-purple-300', borderLightClass: 'border-purple-200', textClass: 'text-purple-700' },
};

const LEAVE_STATUSES = {
  PENDING: { label: 'Pending', color: 'yellow', icon: FiClock, badgeClass: 'badge-warning' },
  APPROVED: { label: 'Approved', color: 'green', icon: FiCheckCircle, badgeClass: 'badge-success' },
  REJECTED: { label: 'Rejected', color: 'red', icon: FiXCircle, badgeClass: 'badge-danger' },
  CANCELLED: { label: 'Cancelled', color: 'gray', icon: FiX, badgeClass: 'badge-gray' },
};

const URGENCY_LEVELS = {
  NORMAL: { label: 'Normal', color: 'blue', bgMutedClass: 'bg-blue-100', textClass: 'text-blue-700', borderLightClass: 'border-blue-200' },
  URGENT: { label: 'Urgent', color: 'orange', bgMutedClass: 'bg-orange-100', textClass: 'text-orange-700', borderLightClass: 'border-orange-200' },
  CRITICAL: { label: 'Critical', color: 'red', bgMutedClass: 'bg-red-100', textClass: 'text-red-700', borderLightClass: 'border-red-200' },
};

const LeaveApplication = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    urgency: 'NORMAL',
    contactDuringLeave: '',
    backupPerson: '',
    isHalfDay: false,
    halfDaySlot: 'FIRST_HALF',
  });

  const [leaves] = useState([
    {
      id: 'LV-2026-001',
      leaveType: 'SICK',
      startDate: '2026-03-20',
      endDate: '2026-03-21',
      days: 2,
      reason: 'Fever and cold - doctor advised rest',
      urgency: 'URGENT',
      status: 'APPROVED',
      appliedAt: '2026-03-19 06:00 PM',
      approvedBy: 'Vikram Singh',
      approvedAt: '2026-03-19 07:00 PM',
      managerComment: 'Get well soon. Take rest.',
    },
    {
      id: 'LV-2026-002',
      leaveType: 'CASUAL',
      startDate: '2026-03-28',
      endDate: '2026-03-29',
      days: 2,
      reason: 'Family function in hometown',
      urgency: 'NORMAL',
      status: 'PENDING',
      appliedAt: '2026-03-24 10:00 AM',
      approvedBy: null,
      approvedAt: null,
      managerComment: null,
    },
    {
      id: 'LV-2026-003',
      leaveType: 'EMERGENCY',
      startDate: '2026-03-15',
      endDate: '2026-03-15',
      days: 1,
      reason: 'Medical emergency - family member hospitalized',
      urgency: 'CRITICAL',
      status: 'APPROVED',
      appliedAt: '2026-03-15 07:00 AM',
      approvedBy: 'Vikram Singh',
      approvedAt: '2026-03-15 07:30 AM',
      managerComment: 'Approved immediately. Handle the emergency.',
    },
    {
      id: 'LV-2026-004',
      leaveType: 'HALF_DAY',
      startDate: '2026-03-10',
      endDate: '2026-03-10',
      days: 0.5,
      reason: 'Bank work - personal errand',
      urgency: 'NORMAL',
      status: 'APPROVED',
      appliedAt: '2026-03-09 04:00 PM',
      approvedBy: 'Vikram Singh',
      approvedAt: '2026-03-09 05:00 PM',
      managerComment: 'Approved. First half.',
    },
  ]);

  const leaveBalance = useMemo(() => ({
    casual: { used: 3, total: 12, available: 9 },
    sick: { used: 2, total: 10, available: 8 },
    earned: { used: 0, total: 15, available: 15 },
    emergency: { used: 1, total: 5, available: 4 },
    half_day: { used: 1, total: 6, available: 5 },
  }), []);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch = !searchQuery ||
        leave.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        LEAVE_TYPES[leave.leaveType].label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || leave.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [leaves, searchQuery, filterStatus]);

  const handleApplyLeave = () => {
    setShowForm(false);
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      urgency: 'NORMAL',
      contactDuringLeave: '',
      backupPerson: '',
      isHalfDay: false,
      halfDaySlot: 'FIRST_HALF',
    });
  };

  const getDaysCount = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diff, 0);
  };

  const tabs = [
    { id: 'apply', label: 'Apply Leave', icon: FiPlus },
    { id: 'history', label: 'Leave History', icon: FiFileText },
    { id: 'balance', label: 'Leave Balance', icon: FiCalendar },
  ];

  // Map leaveBalance keys to LEAVE_TYPES keys
  const balanceKeyToLeaveType = {
    casual: 'CASUAL',
    sick: 'SICK',
    earned: 'EARNED',
    emergency: 'EMERGENCY',
    half_day: 'HALF_DAY',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
          <p className="text-sm text-gray-500 mt-0.5">Apply for leave and track approval status</p>
        </div>
        {!showForm && activeTab === 'apply' && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            New Application
          </button>
        )}
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(leaveBalance).map(([key, balance]) => {
          const leaveType = LEAVE_TYPES[balanceKeyToLeaveType[key]];
          return (
          <div key={key} className="card">
            <div className="card-body py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{leaveType.icon}</span>
                <span className="text-xs font-medium text-gray-500">{leaveType.label}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-xl font-bold text-gray-900">{balance.available}</span>
                <span className="text-xs text-gray-400 mb-1">/ {balance.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${leaveType.bgClass}`}
                  style={{ width: `${(balance.used / balance.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
          );
        })}
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

      {/* Apply Leave Tab */}
      {activeTab === 'apply' && (
        <div>
          {!showForm ? (
            <div className="card p-8 text-center">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">Apply for Leave</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Select leave type, dates, and provide a reason</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                <FiPlus className="w-4 h-4" />
                Apply Now
              </button>
            </div>
          ) : (
            <div className="card max-w-2xl">
              <div className="card-header">
                <h3 className="text-base font-semibold text-gray-900">New Leave Application</h3>
              </div>
              <div className="card-body space-y-4">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(LEAVE_TYPES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, leaveType: key })}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.leaveType === key
                            ? `${config.borderClass} ${config.bgLightClass}`
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <div>
                            <p className={`text-sm font-medium ${
                              formData.leaveType === key ? config.textClass : 'text-gray-700'
                            }`}>
                              {config.label}
                            </p>
                            <p className="text-xs text-gray-400">{config.maxDays} days max</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-field"
                      min={formData.startDate}
                    />
                  </div>
                </div>

                {/* Days Count */}
                {formData.startDate && formData.endDate && (
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm text-primary-700">
                      <span className="font-semibold">{getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''}</span> selected
                    </p>
                  </div>
                )}

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <div className="flex gap-2">
                    {Object.entries(URGENCY_LEVELS).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, urgency: key })}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          formData.urgency === key
                            ? `${config.bgMutedClass} ${config.textClass} border ${config.borderLightClass}`
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Provide a detailed reason for your leave..."
                  />
                </div>

                {/* Contact & Backup */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact During Leave</label>
                    <input
                      type="tel"
                      value={formData.contactDuringLeave}
                      onChange={(e) => setFormData({ ...formData, contactDuringLeave: e.target.value })}
                      className="input-field"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Person</label>
                    <input
                      type="text"
                      value={formData.backupPerson}
                      onChange={(e) => setFormData({ ...formData, backupPerson: e.target.value })}
                      className="input-field"
                      placeholder="Colleague name"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyLeave}
                    disabled={!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <VoiceSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => setSearchQuery(val)}
                placeholder="Search by leave ID, type, or reason..."
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
            {filteredLeaves.length === 0 ? (
              <div className="card p-8 text-center">
                <FiFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">No leave records found</p>
              </div>
            ) : (
              filteredLeaves.map((leave) => {
                const leaveStatus = LEAVE_STATUSES[leave.status];
                const leaveType = LEAVE_TYPES[leave.leaveType];
                const urgencyLevel = URGENCY_LEVELS[leave.urgency];
                return (
                <div key={leave.id} className="card">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
                          {leaveType.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-gray-400">{leave.id}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {leaveType.label}
                            </span>
                            <span className={`badge ${leaveStatus.badgeClass}`}>
                              {leaveStatus.label}
                            </span>
                            {leave.urgency !== 'NORMAL' && (
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${urgencyLevel.bgMutedClass} ${urgencyLevel.textClass}`}>
                                {urgencyLevel.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {leave.startDate} — {leave.endDate} ({leave.days} day{leave.days !== 1 ? 's' : ''})
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              Applied: {leave.appliedAt}
                            </span>
                          </div>
                          {leave.managerComment && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">Manager's Comment:</p>
                              <p className="text-sm text-gray-700 italic">"{leave.managerComment}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {leave.status === 'APPROVED' && (
                        <div className="text-right">
                          <FiCheckCircle className="w-5 h-5 text-green-500" />
                          <p className="text-xs text-gray-400 mt-1">{leave.approvedBy}</p>
                        </div>
                      )}
                      {leave.status === 'PENDING' && (
                        <div className="text-right">
                          <FiClock className="w-5 h-5 text-yellow-500 animate-pulse" />
                          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      )}

      {/* Leave Balance Tab */}
      {activeTab === 'balance' && (
        <div className="max-w-2xl">
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Leave Balance Summary — FY 2026-27</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {Object.entries(leaveBalance).map(([key, balance]) => {
                  const leaveType = LEAVE_TYPES[balanceKeyToLeaveType[key]];
                  return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-xl w-8">{leaveType.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {leaveType.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {balance.available} / {balance.total} days
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${leaveType.bgClass} transition-all`}
                          style={{ width: `${(balance.used / balance.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">{balance.used} used</span>
                        <span className="text-xs text-gray-400">{balance.available} remaining</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900">Leave Policy Notes</h4>
                <ul className="mt-2 space-y-1 text-xs text-blue-700">
                  <li>• Casual Leave: Can be taken in advance with 2 days notice</li>
                  <li>• Sick Leave: Can be availed without prior notice for medical reasons</li>
                  <li>• Earned Leave: Accrued monthly, requires 5 days advance notice</li>
                  <li>• Emergency Leave: For unforeseen circumstances, auto-approved for critical urgency</li>
                  <li>• Half Day: Counts as 0.5 days from Casual Leave balance</li>
                  <li>• All leaves subject to manager approval except Critical Emergency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplication;
