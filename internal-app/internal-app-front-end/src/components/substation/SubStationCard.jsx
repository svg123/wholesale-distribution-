import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasSubstationAccess } from '../../utils/permissions';
import { SUBSTATIONS, SUBSTATION_STATUS_CONFIG } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';

export default function SubStationCard({ substation, onAccess }) {
  const navigate = useNavigate();
  const statusConfig = SUBSTATION_STATUS_CONFIG[substation.status];

  const handleClick = () => {
    navigate(`/substation/${substation.id}`);
    if (onAccess) onAccess(substation);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full card hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Station Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
          statusConfig.color === 'success'
            ? 'bg-green-50'
            : statusConfig.color === 'warning'
            ? 'bg-yellow-50'
            : 'bg-red-50'
        }`}>
          <span>{statusConfig.icon}</span>
        </div>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {substation.displayName}
          </h3>
          <p className="text-sm text-gray-500">{substation.location}</p>

          {/* Status */}
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                statusConfig.color === 'success'
                  ? 'bg-green-100 text-green-700'
                  : statusConfig.color === 'warning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {statusConfig.label}
            </span>
            <span className="text-xs text-gray-400">{formatRelativeTime(substation.lastUpdated || Date.now())}</span>
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="flex-shrink-0 w-5 h-5 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

export function SubStationList({ user: propUser, onStationAccess }) {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const user = propUser || reduxUser;
  const accessibleSubstations = user ? SUBSTATIONS.filter(s => hasSubstationAccess(user, s.name)) : SUBSTATIONS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sub-Stations</h2>
          <p className="text-sm text-gray-500">Select a sub-station to work</p>
        </div>
        <div className="text-sm text-gray-500">
          {accessibleSubstations.length} of {SUBSTATIONS.length} available
        </div>
      </div>

      <div className="space-y-3">
        {accessibleSubstations.map(substation => (
          <SubStationCard
            key={substation.id}
            substation={substation}
            onAccess={onStationAccess}
          />
        ))}
      </div>

      {accessibleSubstations.length === 0 && (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Access</h3>
          <p className="text-sm text-gray-500">You don't have permission to access any sub-stations.</p>
        </div>
      )}
    </div>
  );
}
