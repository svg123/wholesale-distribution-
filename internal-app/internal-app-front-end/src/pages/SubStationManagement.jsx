
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isAdmin, isManagementOrAbove } from '../utils/permissions';
import { SUBSTATIONS, SUBSTATION_STATUS_CONFIG } from '../utils/constants';
import VoiceSearchInput from '../components/common/VoiceSearchInput';

export default function SubStationManagement() {
  const { user } = useSelector((state) => state.auth);
  const [substations, setSubstations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSubstation, setEditingSubstation] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    displayName: '',
    status: 'ACTIVE',
    location: ''
  });

  // Check if user has permission
  const canManageSubstations = isManagementOrAbove(user?.role);

  useEffect(() => {
    // Load substations
    setSubstations([...SUBSTATIONS]);
  }, []);

  // Filter substations by search query
  const filteredSubstations = useMemo(() => {
    if (!searchQuery.trim()) return substations;
    const q = searchQuery.toLowerCase().trim();
    return substations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [substations, searchQuery]);

  const handleEdit = (substation) => {
    setEditingSubstation(substation);
    setFormData({
      id: substation.id,
      name: substation.name,
      displayName: substation.displayName,
      status: substation.status,
      location: substation.location
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      id: '',
      name: '',
      displayName: '',
      status: 'ACTIVE',
      location: ''
    });
  };

  const handleCancel = () => {
    setEditingSubstation(null);
    setIsAdding(false);
    setFormData({
      id: '',
      name: '',
      displayName: '',
      status: 'ACTIVE',
      location: ''
    });
  };

  const handleSave = () => {
    if (isAdding) {
      // Add new substation
      const newSubstation = {
        id: formData.id || `STN-${formData.name.toUpperCase()}-${Date.now()}`,
        name: formData.name.toUpperCase(),
        displayName: formData.displayName,
        status: formData.status,
        location: formData.location
      };
      setSubstations([...substations, newSubstation]);
    } else if (editingSubstation) {
      // Update existing substation
      setSubstations(substations.map(s => 
        s.id === editingSubstation.id ? { ...s, ...formData } : s
      ));
    }
    handleCancel();
    alert(isAdding ? 'Substation added successfully!' : 'Substation updated successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this substation?')) {
      setSubstations(substations.filter(s => s.id !== id));
      alert('Substation deleted successfully!');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!canManageSubstations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage sub-stations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Station Management</h1>
            <p className="text-sm text-gray-600">Add, edit, and manage sub-stations</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Sub-Station
          </button>
        </div>

        {/* Search */}
        <VoiceSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID, location, or status..."
          inputWidth="w-full"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Total Sub-Stations</div>
            <div className="text-2xl font-bold text-gray-900">{substations.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{substations.filter(s => s.status === 'ACTIVE').length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Idle</div>
            <div className="text-2xl font-bold text-yellow-600">{substations.filter(s => s.status === 'IDLE').length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Maintenance</div>
            <div className="text-2xl font-bold text-red-600">{substations.filter(s => s.status === 'MAINTENANCE').length}</div>
          </div>
        </div>

        {/* Form */}
        {(isAdding || editingSubstation) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isAdding ? 'Add New Sub-Station' : 'Edit Sub-Station'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Station ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g., STN-ABBOTT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!!editingSubstation}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., ABBOTT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g., Abbott Pharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="IDLE">Idle</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Zone A - Station 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isAdding ? 'Add Sub-Station' : 'Update Sub-Station'}
              </button>
            </div>
          </div>
        )}

        {/* Sub-Station List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubstations.map(substation => {
                const statusConfig = SUBSTATION_STATUS_CONFIG[substation.status];
                return (
                  <tr key={substation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{substation.displayName}</div>
                        <div className="text-sm text-gray-500">{substation.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          statusConfig.color === 'success'
                            ? 'bg-green-100 text-green-700'
                            : statusConfig.color === 'warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {substation.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(substation)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-3l-3 3-3-3v3H2l6.172-6.172a2 2 0 012.828 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(substation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSubstations.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {searchQuery
                        ? 'No sub-stations match your search.'
                        : 'No sub-stations found. Click "Add Sub-Station" to create one.'}
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
