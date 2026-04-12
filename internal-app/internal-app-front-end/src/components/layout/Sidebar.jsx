import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import {
  collapseSidebar,
  saveSidebarState,
} from '../../redux/slices/uiSlice';
import { filterNavByRole } from '../../utils/permissions';
import { NAV_ITEMS } from '../../utils/constants';
import {
  FiHome,
  FiTarget,
  FiGrid,
  FiMonitor,
  FiEdit3,
  FiInbox,
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiUser,
  FiDollarSign,
  FiClipboard,
  FiCalendar,
  FiPackage,
  FiSend,
  FiTruck,
} from 'react-icons/fi';

const iconMap = {
  dashboard: FiHome,
  tracking: FiTarget,
  barcode: FiGrid,
  substation: FiMonitor,
  substations: FiEdit3,
  request: FiEdit3,
  requests: FiInbox,
  bill: FiFileText,
  analytics: FiBarChart2,
  users: FiUsers,
  audit: FiFileText,
  config: FiSettings,
  utility: FiDatabase,
  user: FiUser,
  dollar: FiDollarSign,
  clipboard: FiClipboard,
  calendar: FiCalendar,
  package: FiPackage,
  send: FiSend,
  truck: FiTruck,
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { sidebarCollapsed } = useSelector((state) => state.ui);

  const userRole = user?.role || 'STAFF';
  const visibleNavItems = filterNavByRole(NAV_ITEMS, userRole);

  const handleCollapse = () => {
    dispatch(collapseSidebar());
    dispatch(saveSidebarState());
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Central</h1>
              <p className="text-[10px] text-gray-500 leading-tight">Command</p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        {visibleNavItems.map((item) => {
          if (item.isDivider) {
            return (
              <div
                key={item.id}
                className={`border-t border-gray-100 my-3 ${sidebarCollapsed ? 'mx-0' : ''}`}
              />
            );
          }

          const Icon = iconMap[item.icon] || FiHome;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-0 left-0 right-0 h-12 border-t border-gray-100 flex items-center justify-center">
        <button
          onClick={handleCollapse}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <FiChevronRight className="w-4 h-4" />
          ) : (
            <FiChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
