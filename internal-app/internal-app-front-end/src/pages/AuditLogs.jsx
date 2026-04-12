import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { formatDateTime } from '../utils/formatters';

const mockLogs = [
  { id: 1, user: 'Rajesh Kumar', action: 'USER_LOGIN', module: 'Auth', details: 'Admin logged in', ip: '192.168.1.10', timestamp: '2026-04-08T10:30:00Z' },
  { id: 2, user: 'Priya Sharma', action: 'REQUEST_APPROVED', module: 'Requests', details: 'Approved REQ-001 for ORD-20260408-001', ip: '192.168.1.22', timestamp: '2026-04-08T10:15:00Z' },
  { id: 3, user: 'Amit Patel', action: 'REQUEST_CREATED', module: 'Requests', details: 'Created request for subtracting 5 units of Telmikind 20', ip: '192.168.1.35', timestamp: '2026-04-08T09:45:00Z' },
  { id: 4, user: 'Rajesh Kumar', action: 'USER_CREATED', module: 'User Mgmt', details: 'Created user account for vikram.s', ip: '192.168.1.10', timestamp: '2026-04-08T09:00:00Z' },
  { id: 5, user: 'System', action: 'BARCODE_GENERATED', module: 'Barcode', details: 'Generated barcode for ORD-20260408-001', ip: 'System', timestamp: '2026-04-08T08:30:00Z' },
  { id: 6, user: 'Priya Sharma', action: 'CONFIG_UPDATED', module: 'System', details: 'Updated barcode print size to Standard', ip: '192.168.1.22', timestamp: '2026-04-07T16:00:00Z' },
];

const actionColors = {
  USER_LOGIN: 'badge-info',
  USER_CREATED: 'badge-success',
  REQUEST_APPROVED: 'badge-success',
  REQUEST_CREATED: 'badge-warning',
  REQUEST_REJECTED: 'badge-danger',
  BARCODE_GENERATED: 'badge-info',
  CONFIG_UPDATED: 'badge-gray',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');

  const modules = ['ALL', 'Auth', 'Requests', 'Barcode', 'User Mgmt', 'System'];

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'ALL' || log.module === filterModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Track all system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <VoiceSearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="select-field pl-10 min-w-[180px]"
              >
                {modules.map((m) => (
                  <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{log.user}</td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${actionColors[log.action] || 'badge-gray'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">{log.module}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-600 max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-400 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
