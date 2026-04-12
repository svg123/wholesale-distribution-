import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatElapsedTime, getUrgencyLevel, getUrgencyStyle } from '../../utils/formatters';

export default function OrderTimerRow({ order }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Force re-render every 1 second to update timer
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const urgency = getUrgencyLevel(order.statusChangedAt);
  const style = getUrgencyStyle(urgency);

  const handleClick = () => {
    navigate(`/order-tracking/${order.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative border-l-4 ${style.borderColor} ${style.bgColor} rounded-r-lg px-5 py-3.5 
        cursor-pointer transition-all duration-200 hover:shadow-md ${style.animation}`}
    >
      {/* Urgency indicator strip */}
      {urgency === 'delayed' && (
        <div className="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold uppercase tracking-wide">
          Delayed
        </div>
      )}
      {urgency === 'warning' && (
        <div className="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-2.5 py-0.5 bg-amber-400 text-white text-xs font-bold uppercase tracking-wide">
          Warning
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Left: Order info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Order ID + Pharmacy */}
          <div className="min-w-0 flex-shrink-0 w-36">
            <p className="text-sm font-semibold text-primary-600 truncate">{order.id}</p>
            <p className="text-xs text-gray-500 truncate">{order.pharmacy}</p>
          </div>

          {/* Items count */}
          <div className="hidden sm:block flex-shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {order.items} items
            </span>
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            <StatusBadge status={order.status} />
          </div>

          {/* Amount */}
          <div className="flex-shrink-0 hidden md:block">
            <span className="text-sm font-medium text-gray-700">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Right: Timer */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Elapsed Time */}
          <div className="flex items-center gap-2">
            {/* Clock icon */}
            <svg
              className={`w-4 h-4 ${
                urgency === 'delayed'
                  ? 'text-red-500'
                  : urgency === 'warning'
                  ? 'text-amber-500'
                  : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`text-sm font-mono font-semibold min-w-[60px] text-right ${
                urgency === 'delayed'
                  ? 'text-red-600'
                  : urgency === 'warning'
                  ? 'text-amber-600'
                  : 'text-gray-600'
              }`}
            >
              {formatElapsedTime(order.statusChangedAt)}
            </span>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
