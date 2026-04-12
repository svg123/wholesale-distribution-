import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUsers, FiMapPin, FiShield, FiPlus, FiEdit2, FiTrash2,
  FiUserPlus, FiCheck, FiX, FiSearch, FiTruck, FiStar,
  FiPhone, FiMail, FiCalendar, FiToggleLeft, FiAlertTriangle
} from 'react-icons/fi';
import {
  initializeDeliveryData,
  addDeliveryPerson,
  updateDeliveryPerson,
  removeDeliveryPerson,
  addAreaMapping,
  updateAreaMapping,
  removeAreaMapping,
} from '../redux/slices/deliverySlice';
import AvailabilityBadge from '../components/delivery/AvailabilityBadge';
import {
  mockDeliveryTasks,
  mockDeliveryPersonnel,
  mockAreaMappings,
  mockApprovedLeaves,
  mockAvailableStaff,
} from '../services/deliveryService';
import { DELIVERY_AREAS, DELIVERY_AVAILABILITY } from '../utils/constants';

const TABS = {
  PERSONNEL: 'personnel',
  AREAS: 'areas',
};

const DeliveryManager = () => {
  const dispatch = useDispatch();
  const { deliveryPersonnel, areaMappings } = useSelector((state) => state.delivery);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(TABS.PERSONNEL);
  const [search, setSearch] = useState('');

  // Modal states
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showAddArea, setShowAddArea] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  // Form states
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    phone: '',
    email: '',
    areas: [],
    vehicle: '',
    isPrimary: true,
  });

  const [areaForm, setAreaForm] = useState({
    area: '',
    primary: '',
    primaryName: '',
    backup: '',
    backupName: '',
  });

  // Initialize mock data
  useEffect(() => {
    dispatch(
      initializeDeliveryData({
        tasks: mockDeliveryTasks,
        personnel: mockDeliveryPersonnel,
        areaMappings: mockAreaMappings,
      })
    );
  }, [dispatch]);

  // Personnel form reset
  const resetPersonnelForm = () => {
    setPersonnelForm({ name: '', phone: '', email: '', areas: [], vehicle: '', isPrimary: true });
    setEditingPerson(null);
    setShowAddPersonnel(false);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setPersonnelForm({
      name: person.name,
      phone: person.phone,
      email: person.email,
      areas: person.areas,
      vehicle: person.vehicle,
      isPrimary: person.isPrimary,
    });
    setShowAddPersonnel(true);
  };

  const handleSavePersonnel = () => {
    if (editingPerson) {
      dispatch(
        updateDeliveryPerson({
          id: editingPerson.id,
          updates: personnelForm,
        })
      );
    } else {
      const newPerson = {
        id: `DP-${String(deliveryPersonnel.length + 1).padStart(3, '0')}`,
        staffId: `STAFF-${Date.now()}`,
        ...personnelForm,
        role: 'STAFF',
        isDeliveryPerson: true,
        availability: DELIVERY_AVAILABILITY.AVAILABLE,
        activeLeave: null,
        totalDeliveries: 0,
        todayDeliveries: 0,
        rating: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      dispatch(addDeliveryPerson(newPerson));
    }
    resetPersonnelForm();
  };

  const handleDeletePerson = (id) => {
    if (window.confirm('Are you sure you want to remove this delivery person?')) {
      dispatch(removeDeliveryPerson(id));
    }
  };

  // Area form reset
  const resetAreaForm = () => {
    setAreaForm({ area: '', primary: '', primaryName: '', backup: '', backupName: '' });
    setEditingArea(null);
    setShowAddArea(false);
  };

  const handleEditArea = (mapping) => {
    setEditingArea(mapping);
    setAreaForm({
      area: mapping.area,
      primary: mapping.primary,
      primaryName: mapping.primaryName,
      backup: mapping.backup,
      backupName: mapping.backupName,
    });
    setShowAddArea(true);
  };

  const handleSaveArea = () => {
    const primaryPerson = deliveryPersonnel.find((p) => p.id === areaForm.primary);
    const backupPerson = deliveryPersonnel.find((p) => p.id === areaForm.backup);

    const mappingData = {
      area: areaForm.area,
      primary: areaForm.primary,
      primaryName: primaryPerson?.name || '',
      backup: areaForm.backup,
      backupName: backupPerson?.name || '',
    };

    if (editingArea) {
      dispatch(updateAreaMapping({ area: editingArea.area, updates: mappingData }));
    } else {
      dispatch(addAreaMapping(mappingData));
    }
    resetAreaForm();
  };

  const handleDeleteArea = (area) => {
    if (window.confirm(`Remove area mapping for "${area}"?`)) {
      dispatch(removeAreaMapping(area));
    }
  };

  // Toggle delivery role for existing staff
  const handleAssignDeliveryRole = (staff) => {
    const newPerson = {
      id: `DP-${String(deliveryPersonnel.length + 1).padStart(3, '0')}`,
      staffId: staff.id,
      name: staff.name,
      phone: staff.phone,
      email: '',
      role: 'STAFF',
      isDeliveryPerson: true,
      availability: DELIVERY_AVAILABILITY.AVAILABLE,
      areas: [],
      isPrimary: false,
      activeLeave: null,
      totalDeliveries: 0,
      todayDeliveries: 0,
      rating: 0,
      vehicle: '',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    dispatch(addDeliveryPerson(newPerson));
  };

  // Filter personnel by search
  const filteredPersonnel = useMemo(() => {
    if (!search) return deliveryPersonnel;
    return deliveryPersonnel.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.areas.some((a) => a.toLowerCase().includes(search.toLowerCase()))
    );
  }, [deliveryPersonnel, search]);

  // Filter areas by search
  const filteredAreas = useMemo(() => {
    if (!search) return areaMappings;
    return areaMappings.filter(
      (m) =>
        m.area.toLowerCase().includes(search.toLowerCase()) ||
        m.primaryName.toLowerCase().includes(search.toLowerCase()) ||
        m.backupName.toLowerCase().includes(search.toLowerCase())
    );
  }, [areaMappings, search]);

  // Stats
  const availableCount = deliveryPersonnel.filter(
    (p) => p.availability === DELIVERY_AVAILABILITY.AVAILABLE
  ).length;
  const onLeaveCount = deliveryPersonnel.filter(
    (p) => p.availability === DELIVERY_AVAILABILITY.ON_LEAVE
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <FiTruck className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Delivery Manager</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Manage delivery personnel, area assignments, and backup configurations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Personnel</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryPersonnel.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Available</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">On Leave</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{onLeaveCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Areas Covered</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{areaMappings.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Sync Notice */}
      {onLeaveCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {onLeaveCount} delivery person{onLeaveCount > 1 ? 'nel' : ''} currently on leave
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Status auto-synced with Leave Module. Backup personnel will be assigned automatically.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab(TABS.PERSONNEL)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === TABS.PERSONNEL
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              Delivery Personnel ({deliveryPersonnel.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab(TABS.AREAS)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === TABS.AREAS
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Area Mapping ({areaMappings.length})
            </span>
          </button>
        </nav>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === TABS.PERSONNEL ? 'Search personnel or areas...' : 'Search areas or names...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        {activeTab === TABS.PERSONNEL && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setShowAddPersonnel(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiUserPlus className="w-4 h-4" />
              Add Delivery Person
            </button>
          </div>
        )}
        {activeTab === TABS.AREAS && (
          <button
            onClick={() => setShowAddArea(true)}
            className="btn btn-primary flex items-center gap-2 ml-4"
          >
            <FiPlus className="w-4 h-4" />
            Add Area Mapping
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === TABS.PERSONNEL && (
        <div className="space-y-3">
          {filteredPersonnel.length === 0 ? (
            <div className="card p-8 text-center">
              <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No delivery personnel found</p>
            </div>
          ) : (
            filteredPersonnel.map((person) => (
              <div key={person.id} className="card hover:shadow-md transition-all">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUsers className="w-6 h-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{person.name}</h4>
                        <AvailabilityBadge status={person.availability} />
                        {person.isPrimary && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                            Primary
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiPhone className="w-3 h-3" />
                          <span>{person.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiMail className="w-3 h-3" />
                          <span>{person.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiMapPin className="w-3 h-3" />
                          <span>Areas: {person.areas.join(', ') || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiTruck className="w-3 h-3" />
                          <span>{person.vehicle || 'No vehicle'}</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{person.totalDeliveries}</span> total
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{person.todayDeliveries}</span> today
                        </div>
                        {person.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FiStar className="w-3 h-3 text-yellow-500" />
                            <span className="font-medium text-gray-700">{person.rating}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 ml-auto">
                          Joined: {new Date(person.joinedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Active Leave Info */}
                      {person.activeLeave && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          On Leave: {person.activeLeave.startDate} to {person.activeLeave.endDate} ({person.activeLeave.leaveType})
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditPerson(person)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Assign Delivery Role from Staff */}
          {mockAvailableStaff.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                Available Staff — Assign Delivery Role
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mockAvailableStaff.map((staff) => (
                  <div key={staff.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.phone}</p>
                    </div>
                    <button
                      onClick={() => handleAssignDeliveryRole(staff)}
                      className="btn btn-outline text-xs py-1.5 px-3"
                    >
                      <FiToggleLeft className="w-3.5 h-3.5 mr-1" />
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === TABS.AREAS && (
        <div className="space-y-3">
          {filteredAreas.length === 0 ? (
            <div className="card p-8 text-center">
              <FiMapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No area mappings found</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Primary Delivery</th>
                    <th>Backup Delivery</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.map((mapping) => {
                    const primary = deliveryPersonnel.find((p) => p.id === mapping.primary);
                    const backup = deliveryPersonnel.find((p) => p.id === mapping.backup);

                    return (
                      <tr key={mapping.area}>
                        <td>
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{mapping.area}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{mapping.primaryName}</span>
                            {primary && <AvailabilityBadge status={primary.availability} />}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{mapping.backupName}</span>
                            {backup && <AvailabilityBadge status={backup.availability} />}
                          </div>
                        </td>
                        <td>
                          {primary?.availability === DELIVERY_AVAILABILITY.AVAILABLE ? (
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Using Backup</span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditArea(mapping)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArea(mapping.area)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Add/Edit Personnel Modal ===== */}
      {showAddPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={resetPersonnelForm} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPerson ? 'Edit Delivery Person' : 'Add Delivery Person'}
              </h3>
              <button onClick={resetPersonnelForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={personnelForm.name}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, name: e.target.value })}
                  className="input"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  value={personnelForm.phone}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, phone: e.target.value })}
                  className="input"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={personnelForm.email}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, email: e.target.value })}
                  className="input"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="label">Vehicle</label>
                <input
                  type="text"
                  value={personnelForm.vehicle}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, vehicle: e.target.value })}
                  className="input"
                  placeholder="e.g., Bike - MH-30-XX-0000"
                />
              </div>
              <div>
                <label className="label">Assigned Areas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DELIVERY_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        const areas = personnelForm.areas.includes(area)
                          ? personnelForm.areas.filter((a) => a !== area)
                          : [...personnelForm.areas, area];
                        setPersonnelForm({ ...personnelForm, areas });
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        personnelForm.areas.includes(area)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={personnelForm.isPrimary}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Primary delivery person
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button onClick={resetPersonnelForm} className="btn btn-ghost">Cancel</button>
              <button
                onClick={handleSavePersonnel}
                disabled={!personnelForm.name || !personnelForm.phone}
                className="btn btn-primary"
              >
                {editingPerson ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Add/Edit Area Mapping Modal ===== */}
      {showAddArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAreaForm} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingArea ? 'Edit Area Mapping' : 'Add Area Mapping'}
              </h3>
              <button onClick={resetAreaForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Area</label>
                {editingArea ? (
                  <input
                    type="text"
                    value={areaForm.area}
                    className="input bg-gray-50"
                    disabled
                  />
                ) : (
                  <select
                    value={areaForm.area}
                    onChange={(e) => setAreaForm({ ...areaForm, area: e.target.value })}
                    className="input"
                  >
                    <option value="">Select area</option>
                    {DELIVERY_AREAS.filter(
                      (a) => !areaMappings.find((m) => m.area === a)
                    ).map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="label">Primary Delivery Person</label>
                <select
                  value={areaForm.primary}
                  onChange={(e) => {
                    const person = deliveryPersonnel.find((p) => p.id === e.target.value);
                    setAreaForm({ ...areaForm, primary: e.target.value, primaryName: person?.name || '' });
                  }}
                  className="input"
                >
                  <option value="">Select primary</option>
                  {deliveryPersonnel.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Backup Delivery Person</label>
                <select
                  value={areaForm.backup}
                  onChange={(e) => {
                    const person = deliveryPersonnel.find((p) => p.id === e.target.value);
                    setAreaForm({ ...areaForm, backup: e.target.value, backupName: person?.name || '' });
                  }}
                  className="input"
                >
                  <option value="">Select backup</option>
                  {deliveryPersonnel
                    .filter((p) => p.id !== areaForm.primary)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button onClick={resetAreaForm} className="btn btn-ghost">Cancel</button>
              <button
                onClick={handleSaveArea}
                disabled={!areaForm.area || !areaForm.primary || !areaForm.backup}
                className="btn btn-primary"
              >
                {editingArea ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManager;
