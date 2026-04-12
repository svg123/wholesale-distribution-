import React, { useState, useMemo } from 'react';
import {
  FiDollarSign, FiAlertTriangle, FiClock, FiSend, FiBell,
  FiCheck, FiX, FiFilter, FiSearch, FiCalendar, FiCreditCard,
  FiTrendingDown, FiMessageSquare, FiSettings, FiEye, FiEyeOff
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

const PaymentReminder = () => {
  const [activeTab, setActiveTab] = useState('bills');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    pharmacistId: '',
    message: '',
    sendVia: 'WHATSAPP',
    isUrgent: false,
  });
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(true);
  const [autoReminderDays, setAutoReminderDays] = useState(3);

  // Mock bills data
  const [bills] = useState([
    { id: 'BILL-2026-001', pharmacist: 'MedPlus Pharmacy', amount: 45200, dueDate: '2026-03-25', status: 'DUE', creditLimit: 100000, used: 45200, paymentDays: 30, phone: '+91 98765 00001', lastReminder: '2026-03-22' },
    { id: 'BILL-2026-002', pharmacist: 'Apollo Pharmacy', amount: 78500, dueDate: '2026-03-20', status: 'OVERDUE', creditLimit: 200000, used: 178500, paymentDays: 45, phone: '+91 98765 00002', lastReminder: '2026-03-24' },
    { id: 'BILL-2026-003', pharmacist: 'HealthWorld', amount: 23400, dueDate: '2026-03-28', status: 'DUE', creditLimit: 75000, used: 48400, paymentDays: 30, phone: '+91 98765 00003', lastReminder: null },
    { id: 'BILL-2026-004', pharmacist: 'Netmeds Store', amount: 91200, dueDate: '2026-03-15', status: 'OVERDUE', creditLimit: 150000, used: 141200, paymentDays: 60, phone: '+91 98765 00004', lastReminder: '2026-03-24' },
    { id: 'BILL-2026-005', pharmacist: 'Wellness Forever', amount: 18700, dueDate: '2026-04-05', status: 'UPCOMING', creditLimit: 50000, used: 18700, paymentDays: 30, phone: '+91 98765 00005', lastReminder: null },
    { id: 'BILL-2026-006', pharmacist: 'PharmaCare', amount: 56800, dueDate: '2026-03-22', status: 'OVERDUE', creditLimit: 80000, used: 76800, paymentDays: 30, phone: '+91 98765 00006', lastReminder: '2026-03-23' },
  ]);

  // Reminder journal
  const [reminderJournal] = useState([
    { id: 'RJ-001', pharmacist: 'Apollo Pharmacy', sentAt: '2026-03-24 10:30 AM', via: 'WHATSAPP', message: 'Payment of ₹78,500 was due on Mar 20. Please clear at earliest.', status: 'DELIVERED', readAt: '2026-03-24 11:00 AM' },
    { id: 'RJ-002', pharmacist: 'Netmeds Store', sentAt: '2026-03-24 10:35 AM', via: 'SMS', message: 'URGENT: ₹91,200 overdue since Mar 15. Immediate clearance requested.', status: 'DELIVERED', readAt: null },
    { id: 'RJ-003', pharmacist: 'PharmaCare', sentAt: '2026-03-23 02:15 PM', via: 'WHATSAPP', message: 'Gentle reminder: ₹56,800 due on Mar 22. Kindly process payment.', status: 'DELIVERED', readAt: '2026-03-23 05:00 PM' },
    { id: 'RJ-004', pharmacist: 'MedPlus Pharmacy', sentAt: '2026-03-22 09:00 AM', via: 'WHATSAPP', message: 'Payment of ₹45,200 due on Mar 25. Please arrange.', status: 'DELIVERED', readAt: '2026-03-22 09:30 AM' },
  ]);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch = !searchQuery ||
        bill.pharmacist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || bill.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bills, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    totalDue: bills.filter((b) => b.status === 'DUE').reduce((sum, b) => sum + b.amount, 0),
    totalOverdue: bills.filter((b) => b.status === 'OVERDUE').reduce((sum, b) => sum + b.amount, 0),
    totalUpcoming: bills.filter((b) => b.status === 'UPCOMING').reduce((sum, b) => sum + b.amount, 0),
    overdueCount: bills.filter((b) => b.status === 'OVERDUE').length,
    remindersSent: reminderJournal.length,
  }), [bills, reminderJournal]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OVERDUE': return 'danger';
      case 'DUE': return 'warning';
      case 'UPCOMING': return 'info';
      case 'PAID': return 'success';
      default: return 'gray';
    }
  };

  const getCreditUsagePercent = (used, limit) => Math.round((used / limit) * 100);

  const handleSendReminder = () => {
    setShowReminderModal(false);
    setReminderForm({ pharmacistId: '', message: '', sendVia: 'WHATSAPP', isUrgent: false });
  };

  const tabs = [
    { id: 'bills', label: 'Bills & Payments', icon: FiDollarSign },
    { id: 'journal', label: 'Reminder Journal', icon: FiMessageSquare },
    { id: 'settings', label: 'Auto-Reminder Settings', icon: FiSettings },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Reminder & Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track bills, manage credit limits, and send payment reminders</p>
        </div>
        <button
          onClick={() => setShowReminderModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiSend className="w-4 h-4" />
          Send Reminder
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-lg font-bold text-red-600">₹{stats.totalOverdue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{stats.overdueCount} bill{stats.overdueCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Soon</p>
                <p className="text-lg font-bold text-amber-600">₹{stats.totalDue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{bills.filter((b) => b.status === 'DUE').length} bills</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Upcoming</p>
                <p className="text-lg font-bold text-blue-600">₹{stats.totalUpcoming.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{bills.filter((b) => b.status === 'UPCOMING').length} bills</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <FiSend className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Reminders Sent</p>
                <p className="text-lg font-bold text-green-600">{stats.remindersSent}</p>
                <p className="text-xs text-gray-400">This month</p>
              </div>
            </div>
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

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <VoiceSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => setSearchQuery(val)}
                placeholder="Search by pharmacist or bill ID"
                inputWidth="w-full"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'OVERDUE', 'DUE', 'UPCOMING'].map((status) => (
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

          {/* Bills Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pharmacist</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Reminder</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{bill.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{bill.pharmacist}</p>
                            <p className="text-xs text-gray-500">{bill.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{bill.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{bill.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`badge badge-${getStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full max-w-[100px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">{getCreditUsagePercent(bill.used, bill.creditLimit)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  getCreditUsagePercent(bill.used, bill.creditLimit) > 80
                                    ? 'bg-red-500'
                                    : getCreditUsagePercent(bill.used, bill.creditLimit) > 50
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(getCreditUsagePercent(bill.used, bill.creditLimit), 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">₹{bill.used.toLocaleString()} / ₹{bill.creditLimit.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {bill.lastReminder || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setShowReminderModal(true)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            <FiSend className="w-3 h-3" />
                            Remind
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Journal Tab */}
      {activeTab === 'journal' && (
        <div className="space-y-3">
          {reminderJournal.map((entry) => (
            <div key={entry.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                      entry.via === 'WHATSAPP' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <FiMessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{entry.pharmacist}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          entry.via === 'WHATSAPP' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {entry.via}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{entry.sentAt}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <FiCheck className="w-3 h-3" />
                          Delivered
                        </span>
                        {entry.readAt && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <FiEye className="w-3 h-3" />
                              Read at {entry.readAt}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-Reminder Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Auto-Reminder Configuration</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Auto-Reminders</p>
                  <p className="text-xs text-gray-500">Automatically send reminders before due date</p>
                </div>
                <button
                  onClick={() => setAutoReminderEnabled(!autoReminderEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoReminderEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {autoReminderEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send reminder before due date (days)
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 3, 5, 7].map((days) => (
                        <button
                          key={days}
                          onClick={() => setAutoReminderDays(days)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            autoReminderDays === days
                              ? 'bg-primary-100 text-primary-700 border border-primary-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {days} day{days !== 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Channel</label>
                    <div className="flex items-center gap-3">
                      {['WHATSAPP', 'SMS', 'BOTH'].map((channel) => (
                        <button
                          key={channel}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            channel === 'WHATSAPP'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {channel === 'BOTH' ? 'WhatsApp + SMS' : channel.charAt(0) + channel.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Message Template</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      defaultValue="Dear {pharmacist_name},\n\nThis is a reminder that your payment of ₹{amount} is due on {due_date}.\nPlease arrange for payment at the earliest.\n\nThank you,\nIVR Pharma"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Escalation Rules</h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Overdue 1-3 days</p>
                  <p className="text-xs text-gray-500">Send gentle reminder</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">WhatsApp</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Overdue 4-7 days</p>
                  <p className="text-xs text-gray-500">Send urgent reminder + notify manager</p>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">WhatsApp + SMS</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Overdue 7+ days</p>
                  <p className="text-xs text-gray-500">Halt orders + escalate to admin</p>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Auto-halt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Send Payment Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Pharmacist</label>
              <select className="input-field">
                <option value="">Choose...</option>
                {bills.filter((b) => b.status !== 'PAID').map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    {bill.pharmacist} — ₹{bill.amount.toLocaleString()} ({bill.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Type your reminder message..."
                value={reminderForm.message}
                onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Send Via</label>
              <div className="flex gap-2">
                {['WHATSAPP', 'SMS'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => setReminderForm({ ...reminderForm, sendVia: channel })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      reminderForm.sendVia === channel
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {channel.charAt(0) + channel.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Mark as Urgent</label>
              <button
                onClick={() => setReminderForm({ ...reminderForm, isUrgent: !reminderForm.isUrgent })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reminderForm.isUrgent ? 'bg-red-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reminderForm.isUrgent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 inline-flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReminder;
