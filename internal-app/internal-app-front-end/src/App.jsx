import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuth } from './redux/slices/authSlice';
import { restoreSidebar } from './redux/slices/uiSlice';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import OrderTrackingPage from './pages/OrderTracking';
import BarcodeGeneratorPage from './pages/BarcodeGenerator';
import SubStationStatusPage from './pages/SubStationStatus';
import SubStationListPage from './pages/SubStationList';
import SubStationDetailPage from './pages/SubStationDetail';
import SubStationManagementPage from './pages/SubStationManagement';
import RequestManagementPage from './pages/RequestManagement';
import RequestRaiserPage from './pages/RequestRaiser';
import UserManagementPage from './pages/UserManagement';
import AnalyticsPage from './pages/Analytics';
import AuditLogsPage from './pages/AuditLogs';
import SystemConfigPage from './pages/SystemConfig';
import NotFoundPage from './pages/NotFound';

// Utility Module Pages
import UtilityDashboard from './pages/utility/UtilityDashboard';
import PharmacistEntry from './pages/utility/submodules/PharmacistEntry';
import SupplierEntry from './pages/utility/submodules/SupplierEntry';
import BrandEntry from './pages/utility/submodules/BrandEntry';
import ProductImport from './pages/utility/submodules/ProductImport';
import SchemeEntry from './pages/utility/submodules/SchemeEntry';
import AreaEntry from './pages/utility/submodules/AreaEntry';
import UtilityManager from './pages/utility/submodules/UtilityManager';

// Staff Module Pages
import MyPortal from './pages/staff/MyPortal';
import PaymentReminder from './pages/staff/PaymentReminder';
import MyTask from './pages/staff/MyTask';
import LeaveApplication from './pages/staff/LeaveApplication';
import StockChecking from './pages/staff/StockChecking';
import RaiseRequest from './pages/staff/RaiseRequest';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreAuth());
    dispatch(restoreSidebar());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected Routes - All wrapped in Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/barcode-generator" element={<BarcodeGeneratorPage />} />
            <Route path="/substation-status" element={<SubStationStatusPage />} />
            <Route path="/sub-stations" element={<SubStationListPage />} />
            <Route path="/substation/:stationId" element={<SubStationDetailPage />} />
            <Route path="/substation-management" element={<ProtectedRoute requiredRoles={['MANAGEMENT', 'ADMIN']}><SubStationManagementPage /></ProtectedRoute>} />
            <Route path="/requests" element={<RequestManagementPage />} />
            <Route path="/request-raiser" element={<RequestRaiserPage />} />

            {/* Management+ Routes */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredRoles={['MANAGEMENT', 'ADMIN']}><AnalyticsPage /></ProtectedRoute>
              }
            />

            {/* Staff Module Routes */}
            <Route
              path="/my-portal"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><MyPortal /></ProtectedRoute>
              }
            />
            <Route
              path="/payment-reminder"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><PaymentReminder /></ProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><MyTask /></ProtectedRoute>
              }
            />
            <Route
              path="/leave-application"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><LeaveApplication /></ProtectedRoute>
              }
            />
            <Route
              path="/stock-checking"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><StockChecking /></ProtectedRoute>
              }
            />
            <Route
              path="/raise-request"
              element={
                <ProtectedRoute requiredRoles={['STAFF']}><RaiseRequest /></ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}><AuditLogsPage /></ProtectedRoute>
              }
            />
            <Route
              path="/system-config"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}><SystemConfigPage /></ProtectedRoute>
              }
            />

            {/* Utility Module Routes */}
            <Route
              path="/utility"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><UtilityDashboard /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/pharmacist"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><PharmacistEntry /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/supplier"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><SupplierEntry /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/brand"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><BrandEntry /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/product"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><ProductImport /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/scheme"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><SchemeEntry /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/area"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><AreaEntry /></ProtectedRoute>
              }
            />
            <Route
              path="/utility/manager"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGEMENT']}><UtilityManager /></ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Default & 404 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
