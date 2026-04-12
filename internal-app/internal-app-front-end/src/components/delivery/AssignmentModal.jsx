import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiSearch, FiUser, FiMapPin, FiCheck } from 'react-icons/fi';
import AvailabilityBadge from './AvailabilityBadge';
import { DELIVERY_AVAILABILITY } from '../../utils/constants';

const AssignmentModal = ({ task, personnel, areaMappings, onClose, onAssign }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(task.assignedTo?.id || null);

  // Filter personnel by search and availability
  const availablePersonnel = personnel.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Sort: available first, then by name
  const sortedPersonnel = [...availablePersonnel].sort((a, b) => {
    if (a.availability === DELIVERY_AVAILABILITY.AVAILABLE && b.availability !== DELIVERY_AVAILABILITY.AVAILABLE) return -1;
    if (a.availability !== DELIVERY_AVAILABILITY.AVAILABLE && b.availability === DELIVERY_AVAILABILITY.AVAILABLE) return 1;
    return a.name.localeCompare(b.name);
  });

  // Find recommended person (from area mapping)
  const areaMapping = areaMappings.find((m) => m.area === task.area);
  const recommendedId = areaMapping?.primary;

  const handleAssign = () => {
    const person = personnel.find((p) => p.id === selectedPersonId);
    if (person) {
      onAssign({
        taskId: task.id,
        personnelId: person.id,
        personnelName: person.name,
        assignedBy: user?.name || 'Manual',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {task.assignedTo ? 'Reassign Delivery' : 'Assign Delivery Person'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {task.orderId} — {task.pharmacy}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <FiMapPin className="w-3 h-3" />
              <span>{task.pharmacyAddress} (Area: {task.area})</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search delivery personnel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Personnel List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedPersonnel.length === 0 ? (
            <div className="text-center py-8">
              <FiUser className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No delivery personnel found</p>
            </div>
          ) : (
            sortedPersonnel.map((person) => {
              const isSelected = selectedPersonId === person.id;
              const isRecommended = person.id === recommendedId;
              const isAvailable = person.availability === DELIVERY_AVAILABILITY.AVAILABLE;

              return (
                <button
                  key={person.id}
                  onClick={() => isAvailable && setSelectedPersonId(person.id)}
                  disabled={!isAvailable}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : isAvailable
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary-200' : 'bg-gray-200'
                    }`}>
                      <FiUser className={`w-5 h-5 ${isSelected ? 'text-primary-700' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{person.name}</p>
                        <AvailabilityBadge status={person.availability} />
                        {isRecommended && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                            ⭐ Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{person.vehicle}</p>
                      <p className="text-xs text-gray-400">
                        Areas: {person.areas.join(', ')} • Today: {person.todayDeliveries} deliveries
                      </p>
                    </div>
                    {isSelected && (
                      <FiCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedPersonId}
            className="btn btn-primary"
          >
            {task.assignedTo ? 'Reassign' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
