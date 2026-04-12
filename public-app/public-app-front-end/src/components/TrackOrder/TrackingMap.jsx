import React, { useState, useEffect } from 'react';

/**
 * TrackingMap Component
 * 
 * Displays mock map showing:
 * - Pharmacy location (origin)
 * - Delivery location (destination)
 * - Current delivery vehicle location
 * - Route between them
 * - Distance and ETA
 * 
 * Note: This is a mock implementation
 * In production, integrate with Google Maps API or similar
 */
const TrackingMap = ({ order }) => {
  const [deliveryLocation, setDeliveryLocation] = useState({
    latitude: 19.076,
    longitude: 72.8479,
    name: 'Delivery Location',
  });

  const [pharmacyLocation] = useState({
    latitude: 19.0760,
    longitude: 72.8479,
    name: 'Pharmacy',
  });

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 19.0755,
    longitude: 72.8474,
  });

  // Simulate vehicle movement
  useEffect(() => {
    if (order.status === 'OUT_FOR_DELIVERY') {
      const interval = setInterval(() => {
        setCurrentLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [order.status]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Mock Map Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 h-96 flex items-center justify-center">
        {/* Map background with grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map content */}
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-8 p-8">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {order.status === 'OUT_FOR_DELIVERY'
                ? 'Live Tracking'
                : 'Delivery Route'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {order.status === 'OUT_FOR_DELIVERY'
                ? 'Vehicle location updates every 30 seconds'
                : 'Route map showing delivery destination'}
            </p>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            {/* Pharmacy Location */}
            <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏥</span>
                <span className="font-semibold text-gray-900">Start</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Pharmacy
              </p>
              <p className="text-xs text-gray-500 mt-2">
                📍 {pharmacyLocation.latitude.toFixed(4)}, {pharmacyLocation.longitude.toFixed(4)}
              </p>
            </div>

            {/* Current Location (if out for delivery) */}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl animate-bounce">🚚</span>
                  <span className="font-semibold text-gray-900">Current</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Delivery Vehicle
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  📍 {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}

            {/* Delivery Location */}
            <div className={`bg-white rounded-lg p-4 border-2 ${
              order.status === 'OUT_FOR_DELIVERY' ? 'border-gray-300' : 'border-green-300'
            } shadow-lg hover:shadow-xl transition`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📍</span>
                <span className="font-semibold text-gray-900">Destination</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Delivery Location
              </p>
              <p className="text-xs text-gray-500 mt-2">
                📍 {deliveryLocation.latitude.toFixed(4)}, {deliveryLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Route Info */}
          <div className="w-full max-w-2xl bg-white rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">2.3</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                  km away
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {order.status === 'OUT_FOR_DELIVERY' ? '15' : '45'} min
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                  ETA
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">30</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                  km/h avg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Indicator (if out for delivery) */}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-lg">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">LIVE</span>
          </div>
        )}
      </div>

      {/* Map Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {order.status === 'OUT_FOR_DELIVERY' && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Driver Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {order.driverName || 'Raj Kumar'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Vehicle
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {order.vehicleNumber || 'MH-01-AB-1234'}
                </p>
              </div>
            </>
          )}

          {order.status !== 'OUT_FOR_DELIVERY' && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Distance
                </p>
                <p className="text-sm font-medium text-gray-900">
                  2.3 km from delivery location
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Next Update
                </p>
                <p className="text-sm font-medium text-gray-900">
                  When shipped
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Note for Mock Implementation */}
      <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">ℹ️</span>
          <span>
            <strong>Mock Implementation:</strong> This map shows sample data. In production, integrate with Google Maps API for real-time tracking.
          </span>
        </p>
      </div>
    </div>
  );
};

export default TrackingMap;
