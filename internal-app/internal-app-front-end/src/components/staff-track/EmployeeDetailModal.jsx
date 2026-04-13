import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiX, FiClock, FiMapPin, FiBriefcase, FiFileText, FiCheckSquare, FiPackage, FiStar, FiMessageSquare, FiActivity, FiEdit3 } from 'react-icons/fi';
import { addFeedback, clearSelectedEmployee } from '../../redux/slices/staffTrackSlice';

const statusConfig = {
  WORKING: { label: 'Working', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  ON_LEAVE: { label: 'On Leave', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  IDLE: { label: 'Idle', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};

const roleLabels = { STAFF: 'Staff', OPERATOR: 'Operator', DELIVERY: 'Delivery' };

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function StarRating({ rating, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          className="focus:outline-none"
          onMouseEnter={() => onRate && setHover(s)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(s)}
          disabled={!onRate}
        >
          <FiStar
            className={`w-4 h-4 ${
              s <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          />
        </button>
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function EmployeeDetailModal({ employee, attendance, productivity, activityLog, performance, leaveRecords }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(performance?.rating || 0);
  const [editingFeedback, setEditingFeedback] = useState(false);

  if (!employee) return null;

  const att = attendance[employee.id] || {};
  const prod = productivity[employee.id] || { billsProcessed: 0, ordersHandled: 0, tasksCompleted: 0 };
  const logs = activityLog[employee.id] || [];
  const perf = performance || { rating: 0, feedback: '', lastReview: '' };
  const empLeaves = leaveRecords.filter((l) => l.employeeId === employee.id);
  const sc = statusConfig[employee.status] || statusConfig.IDLE;

  const handleSaveFeedback = () => {
    if (feedbackText.trim()) {
      dispatch(addFeedback({ employeeId: employee.id, feedback: feedbackText, rating: feedbackRating }));
      setEditingFeedback(false);
      setFeedbackText('');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity Log' },
    { key: 'performance', label: 'Performance' },
    { key: 'leave', label: 'Leave History' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold">
              {employee.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{employee.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{roleLabels[employee.role] || employee.role}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{employee.department}</span>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearSelectedEmployee())}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Current Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FiBriefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Module:</span>
                      <span className="font-medium text-gray-900">{employee.currentModule || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiActivity className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Task:</span>
                      <span className="font-medium text-gray-900">{employee.currentTask || '—'}</span>
                    </div>
                    {employee.subStationName && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Sub-Station:</span>
                        <span className="font-medium text-gray-900">{employee.subStationName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Attendance Today</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-500">Login:</span>
                      <span className="font-medium text-gray-900">{formatTime(att.loginTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="w-4 h-4 text-red-400" />
                      <span className="text-gray-500">Logout:</span>
                      <span className="font-medium text-gray-900">{formatTime(att.logoutTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium text-gray-900">{att.totalHours.toFixed(1)}h (Break: {att.breakMinutes}m)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productivity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Today's Productivity</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="card p-4 text-center">
                    <FiFileText className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{prod.billsProcessed}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Bills Processed</p>
                  </div>
                  <div className="card p-4 text-center">
                    <FiPackage className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{prod.ordersHandled}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Orders Handled</p>
                  </div>
                  <div className="card p-4 text-center">
                    <FiCheckSquare className="w-5 h-5 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{prod.tasksCompleted}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tasks Completed</p>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Performance Rating</h4>
                  <span className="text-xs text-gray-400">Last review: {perf.lastReview}</span>
                </div>
                <StarRating rating={perf.rating} />
                <p className="text-sm text-gray-600 mt-2">{perf.feedback}</p>
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {activeTab === 'activity' && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Activity Timeline</h4>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No activity recorded.</div>
              ) : (
                <div className="space-y-0">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {/* Timeline line */}
                      {i < logs.length - 1 && (
                        <div className="absolute left-[7px] top-6 bottom-0 w-px bg-gray-200" />
                      )}
                      <div className="w-[15px] h-[15px] rounded-full bg-primary-100 border-2 border-primary-400 flex-shrink-0 mt-1 relative z-10" />
                      <div className="pb-4 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{timeAgo(log.time)}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{log.module}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Rating</h4>
                  <span className="text-xs text-gray-400">Last review: {perf.lastReview}</span>
                </div>
                <StarRating rating={perf.rating} />
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Manager Feedback</h4>
                  {!editingFeedback && (
                    <button
                      onClick={() => { setEditingFeedback(true); setFeedbackText(perf.feedback); setFeedbackRating(perf.rating); }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <FiEdit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                {editingFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Rating</label>
                      <StarRating rating={feedbackRating} onRate={setFeedbackRating} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Feedback</label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                        placeholder="Enter feedback for this employee..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingFeedback(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveFeedback}
                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <FiMessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{perf.feedback || 'No feedback yet.'}</p>
                  </div>
                )}
              </div>

              {/* Productivity Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Productivity Breakdown</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Bills Processed', value: prod.billsProcessed, color: 'bg-blue-500', max: 40 },
                    { label: 'Orders Handled', value: prod.ordersHandled, color: 'bg-purple-500', max: 40 },
                    { label: 'Tasks Completed', value: prod.tasksCompleted, color: 'bg-green-500', max: 20 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${item.color} rounded-full h-2 transition-all duration-500`}
                          style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LEAVE TAB */}
          {activeTab === 'leave' && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Leave History</h4>
              {empLeaves.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No leave records found.</div>
              ) : (
                <div className="space-y-3">
                  {empLeaves.map((leave, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{leave.leaveType}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{leave.reason}</p>
                        </div>
                        <span className={`badge ${
                          leave.status === 'APPROVED' ? 'badge-success' :
                          leave.status === 'REJECTED' ? 'badge-danger' :
                          leave.status === 'PENDING' ? 'badge-warning' :
                          'badge-gray'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>From: {new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>To: {new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>Approved by: {leave.approvedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
