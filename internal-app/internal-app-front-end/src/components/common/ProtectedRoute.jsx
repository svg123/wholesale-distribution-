import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasAccess } from '../../utils/permissions';
import ReauthModal from './ReauthModal';

export default function ProtectedRoute({ requiredRoles, children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { reauthRequired } = useSelector((state) => state.ui);

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check - if specific roles required
  if (requiredRoles && !hasAccess(user?.role, requiredRoles)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Access Restricted</h3>
          <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {reauthRequired && <ReauthModal />}
      {children || <Outlet />}
    </>
  );
}
