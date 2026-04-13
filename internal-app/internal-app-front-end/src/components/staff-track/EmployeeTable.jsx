import React from 'react';
import { FiClock, FiMapPin, FiBriefcase } from 'react-icons/fi';

const statusConfig = {
  WORKING: {
    label: 'Working',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  ON_LEAVE: {
    label: 'On Leave',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  IDLE: {
    label: 'Idle',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
};

const roleConfig = {
  STAFF: { label: 'Staff', badge: 'badge-info' },
  OPERATOR: { label: 'Operator', badge: 'badge-warning' },
  DELIVERY: { label: 'Delivery', badge: 'badge-primary' },
};

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

export default function EmployeeTable({ employees, attendance, onSelect }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h3 className="text-base font-semibold text-gray-900">Employee Status</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Sub-Station</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Current Task</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Working Hrs</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Last Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => {
              const sc = statusConfig[emp.status] || statusConfig.IDLE;
              const rc = roleConfig[emp.role] || roleConfig.STAFF;
              const att = attendance[emp.id] || {};

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(emp)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400 truncate">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${rc.badge}`}>{rc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border ${sc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {emp.subStationName ? (
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                        {emp.subStationName}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {emp.currentTask ? (
                      <span className="inline-flex items-center gap-1 text-gray-600 max-w-[200px] truncate">
                        <FiBriefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{emp.currentTask}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {att.totalHours > 0 ? (
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <FiClock className="w-3.5 h-3.5 text-gray-400" />
                        {att.totalHours.toFixed(1)}h
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-gray-500 text-xs">{timeAgo(att.loginTime)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(emp);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No employees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
