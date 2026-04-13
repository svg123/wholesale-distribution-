import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiPackage, FiFileText, FiActivity } from 'react-icons/fi';

export default function DailySummary({ employees, productivity, attendance }) {
  const todaySummary = employees.map((emp) => {
    const prod = productivity[emp.id] || {};
    const att = attendance[emp.id] || {};
    return {
      id: emp.id,
      name: emp.name,
      department: emp.department,
      status: emp.status,
      loginTime: att.loginTime || null,
      logoutTime: att.logoutTime || null,
      totalHours: att.totalHours || 0,
      billsProcessed: prod.billsProcessed || 0,
      ordersHandled: prod.ordersHandled || 0,
      tasksCompleted: prod.tasksCompleted || 0,
    };
  });

  const activeCount = todaySummary.filter((s) => s.status === 'WORKING').length;
  const totalBills = todaySummary.reduce((sum, s) => sum + s.billsProcessed, 0);
  const totalOrders = todaySummary.reduce((sum, s) => sum + s.ordersHandled, 0);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Daily Summary</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} of {todaySummary.length} employees active
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FiFileText className="w-3.5 h-3.5" />
            {totalBills} bills
          </span>
          <span className="flex items-center gap-1">
            <FiPackage className="w-3.5 h-3.5" />
            {totalOrders} orders
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Shift</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Hours</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Bills</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Orders</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todaySummary.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        emp.status === 'WORKING' ? 'bg-green-100 text-green-700' :
                        emp.status === 'IDLE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FiClock className="w-3 h-3 text-gray-400" />
                      {emp.loginTime ? (
                        <span>{emp.loginTime}{emp.logoutTime ? ` - ${emp.logoutTime}` : ' • Active'}</span>
                      ) : (
                        <span className="text-gray-400">Not logged in</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      emp.totalHours >= 7 ? 'bg-red-50 text-red-700' :
                      emp.totalHours >= 4 ? 'bg-green-50 text-green-700' :
                      emp.totalHours > 0 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {emp.totalHours > 0 ? `${emp.totalHours.toFixed(1)}h` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                    <span className="text-sm text-gray-700 font-medium">{emp.billsProcessed}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center hidden xl:table-cell">
                    <span className="text-sm text-gray-700 font-medium">{emp.ordersHandled}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-sm text-gray-700 font-medium">{emp.tasksCompleted}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      emp.status === 'WORKING'
                        ? 'bg-green-50 text-green-700'
                        : emp.status === 'IDLE'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {emp.status === 'WORKING' ? <FiCheckCircle className="w-3 h-3" /> :
                       emp.status === 'IDLE' ? <FiActivity className="w-3 h-3" /> :
                       <FiXCircle className="w-3 h-3" />}
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
