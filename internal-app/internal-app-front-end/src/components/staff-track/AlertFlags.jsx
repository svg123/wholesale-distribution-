import React from 'react';
import { FiAlertTriangle, FiClock, FiZap } from 'react-icons/fi';

export default function AlertFlags({ employees, attendance }) {
  const idleAlerts = employees.filter((e) => e.status === 'IDLE').map((e) => {
    const att = attendance[e.id] || {};
    return { ...e, loginTime: att.loginTime, totalHours: att.totalHours || 0 };
  });

  const overworkAlerts = employees.filter((e) => {
    const att = attendance[e.id] || {};
    return att.totalHours >= 7;
  }).map((e) => {
    const att = attendance[e.id] || {};
    return { ...e, totalHours: att.totalHours };
  });

  if (idleAlerts.length === 0 && overworkAlerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Idle Employees */}
      {idleAlerts.length > 0 && (
        <div className="card border-l-4 border-l-yellow-400">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-yellow-700">Idle Employees ({idleAlerts.length})</h4>
            </div>
            <div className="space-y-2">
              {idleAlerts.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-semibold">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.department} • {emp.role}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                    {emp.totalHours > 0 ? `${emp.totalHours.toFixed(1)}h idle` : 'Not logged in'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overworked Employees */}
      {overworkAlerts.length > 0 && (
        <div className="card border-l-4 border-l-red-400">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="w-4 h-4 text-red-500" />
              <h4 className="text-sm font-semibold text-red-700">Overworked ({overworkAlerts.length})</h4>
            </div>
            <div className="space-y-2">
              {overworkAlerts.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-semibold">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.department}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {emp.totalHours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
