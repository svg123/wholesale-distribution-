import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasSubstationAccess } from '../utils/permissions';
import { SUBSTATIONS, SUBSTATION_STATUS_CONFIG } from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';
import { getOrdersForSubstation, getSubstationStats } from '../services/orderService';
import SubStationCard from '../components/substation/SubStationCard';
import VoiceSearchInput from '../components/common/VoiceSearchInput';

export default function SubStationList() {
  const navigate = useNavigate();
  const { stationId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('stations');
  const [searchQuery, setSearchQuery] = useState('');

  const accessibleSubstations = user ? SUBSTATIONS.filter(s => hasSubstationAccess(user, s.name)) : SUBSTATIONS;

  // Filter substations by search query
  const filteredSubstations = useMemo(() => {
    if (!searchQuery.trim()) return accessibleSubstations;
    const q = searchQuery.toLowerCase().trim();
    return accessibleSubstations.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q))
    );
  }, [accessibleSubstations, searchQuery]);

  useEffect(() => {
    loadStats();
  }, [stationId]);

  const loadStats = async () => {
    try {
      const substation = SUBSTATIONS.find(s => s.id === stationId);
      if (substation) {
        const stats = await getSubstationStats(substation.id);
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStationAccess = async (substation) => {
    try {
      const orders = await getOrdersForSubstation(substation.id);
      console.log(`Accessing ${substation.displayName}: ${orders.length} orders`);
    } catch (error) {
      console.error('Error accessing station:', error);
    }
  };

  const currentSubstation = SUBSTATIONS.find(s => s.id === stationId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-80 lg:min-h-screen border-r border-gray-200 bg-white p-4 overflow-y-auto flex-shrink-0">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sub-Stations</h1>
        <p className="text-sm text-gray-500 mb-6">Select a sub-station to work with</p>

        {/* Search */}
        <div className="mb-6">
          <VoiceSearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations..."
            inputWidth="w-full"
          />
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Stations</span>
              <span className="text-sm font-semibold text-gray-900">{SUBSTATIONS.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Today</span>
              <span className="text-sm font-semibold text-primary-600">{SUBSTATIONS.filter(s => s.status === 'ACTIVE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Idle</span>
              <span className="text-sm font-semibold text-yellow-600">{SUBSTATIONS.filter(s => s.status === 'IDLE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-semibold text-red-600">{SUBSTATIONS.filter(s => s.status === 'MAINTENANCE').length}</span>
            </div>
          </div>
        </div>

        {/* Active Sub-Station */}
        {currentSubstation && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-primary-700 mb-2">Current Station</h3>
            <p className="text-base font-semibold text-primary-900">{currentSubstation.displayName}</p>
            <p className="text-sm text-primary-600 mt-1">{currentSubstation.location}</p>
          </div>
        )}

        {/* Sub-Station List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Available Stations</h3>
          {filteredSubstations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No stations match your search' : 'No accessible sub-stations found'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredSubstations.map(substation => (
              <SubStationCard
                key={substation.id}
                substation={substation}
                onAccess={handleStationAccess}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => setActiveTab('stations')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'stations'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Stations
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Pending Orders ({stats.pending || 0})
            </button>
          </div>

          {activeTab === 'stations' ? (
            <div className="space-y-3">
              {filteredSubstations.map(substation => (
                <SubStationCard
                  key={substation.id}
                  substation={substation}
                  onAccess={handleStationAccess}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending Orders</h3>
              <p className="text-sm text-gray-500">Loading pending orders for all sub-stations...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
