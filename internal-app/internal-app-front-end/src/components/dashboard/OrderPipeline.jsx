import React, { useState } from 'react';
import { ORDER_STATUSES } from '../../utils/constants';
import { getUrgencyLevel } from '../../utils/formatters';

const PIPELINE_STAGES = [
  { key: ORDER_STATUSES.PLACED, label: 'Placed', icon: '📥' },
  { key: ORDER_STATUSES.PROCESSING, label: 'Processing', icon: '⚙️' },
  { key: ORDER_STATUSES.DISPATCHING, label: 'Dispatching', icon: '📦' },
  { key: ORDER_STATUSES.DISPATCHED, label: 'Dispatched', icon: '🚚' },
  { key: ORDER_STATUSES.COMPLETED, label: 'Completed', icon: '✅' },
];

export default function OrderPipeline({ orders, activeFilter, onFilterChange }) {
  // Count orders per stage
  const stageCounts = {};
  PIPELINE_STAGES.forEach((stage) => {
    stageCounts[stage.key] = orders.filter((o) => o.status === stage.key).length;
  });

  // Check if any order in a stage is delayed
  const stageHasDelayed = {};
  PIPELINE_STAGES.forEach((stage) => {
    stageHasDelayed[stage.key] = orders
      .filter((o) => o.status === stage.key)
      .some((o) => getUrgencyLevel(o.statusChangedAt) === 'delayed');
  });

  // Check if any order in a stage is warning
  const stageHasWarning = {};
  PIPELINE_STAGES.forEach((stage) => {
    stageHasWarning[stage.key] = orders
      .filter((o) => o.status === stage.key)
      .some((o) => getUrgencyLevel(o.statusChangedAt) === 'warning');
  });

  const totalCount = orders.length;

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Order Pipeline</h3>
          {activeFilter && (
            <button
              onClick={() => onFilterChange(null)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-1">
          {PIPELINE_STAGES.map((stage, index) => {
            const count = stageCounts[stage.key] || 0;
            const isActive = activeFilter === stage.key;
            const hasDelayed = stageHasDelayed[stage.key];
            const hasWarning = stageHasWarning[stage.key];
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

            return (
              <React.Fragment key={stage.key}>
                {/* Stage Node */}
                <button
                  onClick={() => onFilterChange(isActive ? null : stage.key)}
                  className={`relative flex flex-col items-center min-w-0 flex-1 group transition-all duration-200 ${
                    isActive ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Stage Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 border-2 ${
                      isActive
                        ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-200'
                        : hasDelayed
                        ? 'bg-red-50 border-red-300 group-hover:border-red-400'
                        : hasWarning
                        ? 'bg-amber-50 border-amber-300 group-hover:border-amber-400'
                        : count > 0
                        ? 'bg-primary-50 border-primary-200 group-hover:border-primary-400'
                        : 'bg-gray-50 border-gray-200 group-hover:border-gray-300'
                    }`}
                  >
                    {/* Urgency dot */}
                    {(hasDelayed || hasWarning) && !isActive && (
                      <span
                        className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          hasDelayed ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                    )}
                    <span className={isActive ? 'grayscale brightness-200' : ''}>{stage.icon}</span>
                  </div>

                  {/* Count */}
                  <span
                    className={`mt-1.5 text-lg font-bold ${
                      isActive
                        ? 'text-primary-700'
                        : hasDelayed
                        ? 'text-red-600'
                        : hasWarning
                        ? 'text-amber-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {count}
                  </span>

                  {/* Label */}
                  <span
                    className={`text-xs font-medium truncate w-full text-center ${
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary-600" />
                  )}
                </button>

                {/* Connector Arrow */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="flex items-center pt-[-20px] mx-0.5">
                    <div
                      className={`w-6 h-0.5 rounded ${
                        stageCounts[PIPELINE_STAGES[index + 1].key] > 0
                          ? 'bg-primary-300'
                          : 'bg-gray-200'
                      }`}
                    />
                    <svg
                      className={`w-3 h-3 -ml-0.5 ${
                        stageCounts[PIPELINE_STAGES[index + 1].key] > 0
                          ? 'text-primary-300'
                          : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-5 flex h-2 rounded-full overflow-hidden bg-gray-100">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageCounts[stage.key] || 0;
              const percentage = (count / totalCount) * 100;
              if (percentage === 0) return null;

              const colorMap = {
                [ORDER_STATUSES.PLACED]: 'bg-blue-400',
                [ORDER_STATUSES.PROCESSING]: 'bg-amber-400',
                [ORDER_STATUSES.DISPATCHING]: 'bg-purple-500',
                [ORDER_STATUSES.DISPATCHED]: 'bg-indigo-400',
                [ORDER_STATUSES.COMPLETED]: 'bg-green-400',
              };

              return (
                <div
                  key={stage.key}
                  className={`${colorMap[stage.key]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                  title={`${stage.label}: ${count} (${Math.round(percentage)}%)`}
                />
              );
            })}
          </div>
        )}

        {/* Filter info */}
        {activeFilter && (
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-500">
              Showing <strong className="text-primary-600">{stageCounts[activeFilter] || 0}</strong> orders in{' '}
              <strong className="text-primary-600">
                {PIPELINE_STAGES.find((s) => s.key === activeFilter)?.label}
              </strong>{' '}
              stage
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
