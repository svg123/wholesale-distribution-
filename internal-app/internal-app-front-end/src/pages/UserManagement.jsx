import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiUsers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { getRoleLabel, getRoleBadgeColor } from '../utils/permissions';
import { ROLES } from '../utils/constants';

const mockUsers = [
  { id: 1, name: 'Rajesh Kumar', username: 'rajesh.k', email: 'rajesh@pharma.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-04-08T09:30:00Z' },
  { id: 2, name: 'Priya Sharma', username: 'priya.s', email: 'priya@pharma.com', role: 'MANAGEMENT', status: 'ACTIVE', lastLogin: '2026-04-08T10:15:00Z' },
  { id: 3, name: 'Amit Patel', username: 'amit.p', email: 'amit@pharma.com', role: 'STAFF', status: 'ACTIVE', lastLogin: '2026-04-08T08:45:00Z' },
  { id: 4, name: 'Sneha Reddy', username: 'sneha.r', email: 'sneha@pharma.com', role: 'STAFF', status: 'ACTIVE', lastLogin: '2026-04-07T17:00:00Z' },
  { id: 5, name: 'Vikram Singh', username: 'vikram.s', email: 'vikram@pharma.com', role: 'STAFF', status: 'INACTIVE', lastLogin: '2026-03-20T12:00:00Z' },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage staff, management, and admin users</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <div className="relative max-w-md">
            <VoiceSearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" placeholder="Enter full name" />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input-field" placeholder="Enter username" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="Enter email" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="select-field">
                  <option value="STAFF">Staff</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input-field" placeholder="Create password" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="btn-primary">Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
