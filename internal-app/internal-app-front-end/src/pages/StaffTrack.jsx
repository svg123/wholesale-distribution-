import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFilter,
  clearFilters,
  selectEmployee,
  clearSelectedEmployee,
} from '../redux/slices/staffTrackSlice';

import OverviewCards from '../components/staff-track/OverviewCards';
import EmployeeTable from '../components/staff-track/EmployeeTable';
import EmployeeDetailModal from '../components/staff-track/EmployeeDetailModal';
import AlertFlags from '../components/staff-track/AlertFlags';
import DailySummary from '../components/staff-track/DailySummary';

import { FiSearch, FiFilter, FiX, FiEye, FiList, FiBarChart2 } from 'react-icons/fi';

const ROLES_OPTIONS = ['ALL', 'OPERATOR', 'STAFF'];
const STATUS_OPTIONS = ['ALL', 'WORKING', 'IDLE', 'ON_LEAVE'];

export default function StaffTrack() {
  const dispatch = useDispatch();
  const {
    employees,
    attendance,
    productivity,
    activityLog,
    leaveRecords,
    performance,
    filters,
    selectedEmployee,
  } = useSelector((state) => state.staffTrack);

  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // overview | summary

  // Unique sub-stations from employees
  const subStations = useMemo(() => {
    const stations = [...new Set(employees.map((e) => e.subStationName).filter(Boolean))];
    return ['ALL', ...stations];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (filters.role && filters.role !== 'ALL' && emp.role !== filters.role) return false;
      if (filters.status && filters.status !== 'ALL' && emp.status !== filters.status) return false;
      if (filters.subStation && filters.subStation !== 'ALL' && emp.subStationName !== filters.subStation) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          (emp.department && emp.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [employees, filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSelectEmployee = (emp) => {
    dispatch(selectEmployee(emp));
  };

  const handleCloseModal = () => {
    dispatch(clearSelectedEmployee());
  };

  const hasActiveFilters = filters.role || filters.status || filters.subStation || filters.searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Staff Track</h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time workforce monitoring &amp; activity tracking</p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiEye className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveView('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === 'summary'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              Daily Summary
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, email, or department..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleFilterChange('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                {[filters.role, filters.status, filters.subStation].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={filters.role || 'ALL'}
                onChange={(e) => handleFilterChange('role', e.target.value === 'ALL' ? null : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt === 'ALL' ? 'All Roles' : opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'ALL' ? null : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt === 'ALL' ? 'All Statuses' : opt.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sub-Station</label>
              <select
                value={filters.subStation || 'ALL'}
                onChange={(e) => handleFilterChange('subStation', e.target.value === 'ALL' ? null : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subStations.map((opt) => (
                  <option key={opt} value={opt}>{opt === 'ALL' ? 'All Sub-Stations' : opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {activeView === 'overview' ? (
          <>
            {/* Overview Cards */}
            <OverviewCards employees={employees} attendance={attendance} />

            {/* Alert Flags */}
            <AlertFlags employees={employees} attendance={attendance} />

            {/* Employee Table */}
            <EmployeeTable
              employees={filteredEmployees}
              attendance={attendance}
              onSelectEmployee={handleSelectEmployee}
            />

            {/* Results count */}
            {hasActiveFilters && (
              <p className="text-sm text-gray-500 text-center">
                Showing {filteredEmployees.length} of {employees.length} employees
              </p>
            )}
          </>
        ) : (
          <>
            {/* Daily Summary View */}
            <DailySummary
              employees={filteredEmployees}
              productivity={productivity}
              attendance={attendance}
            />
          </>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          attendance={attendance[selectedEmployee.id]}
          productivity={productivity[selectedEmployee.id]}
          activityLog={activityLog[selectedEmployee.id] || []}
          performance={performance[selectedEmployee.id]}
          leaveRecords={leaveRecords.filter((lr) => lr.employeeId === selectedEmployee.id)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
