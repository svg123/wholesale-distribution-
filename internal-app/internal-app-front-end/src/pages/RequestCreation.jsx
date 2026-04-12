import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiUsers } from 'react-icons/fi';

export default function RequestCreation() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Creation</h1>
        <p className="text-sm text-gray-500 mt-1">Choose the type of request you want to create</p>
      </div>

      {/* Two Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">

        {/* User Ticket */}
        <button
          onClick={() => navigate('/raise-request')}
          className="card p-6 text-left hover:shadow-md hover:border-primary-200 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <FiUsers className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">User Ticket</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Raise tickets for inquiries, task transfers, conveyor issues, and other staff coordination requests.
          </p>
          <div className="mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
            Open User Ticket
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Stock Ticket */}
        <button
          onClick={() => navigate('/request-raiser')}
          className="card p-6 text-left hover:shadow-md hover:border-primary-200 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <FiPackage className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Stock Ticket</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Create modification or mismatch tickets for sub-station stock updates, batch changes, and delivery issues.
          </p>
          <div className="mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
            Open Stock Ticket
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

      </div>
    </div>
  );
}
