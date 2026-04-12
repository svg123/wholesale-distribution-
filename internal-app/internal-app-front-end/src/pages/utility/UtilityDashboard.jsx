import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PharmacistEntry from './submodules/PharmacistEntry';
import SupplierEntry from './submodules/SupplierEntry';
import BrandEntry from './submodules/BrandEntry';
import ProductImport from './submodules/ProductImport';
import SchemeEntry from './submodules/SchemeEntry';
import AreaEntry from './submodules/AreaEntry';
import UtilityManager from './submodules/UtilityManager';

const SUB_MODULES = [
  {
    id: 'pharmacist',
    title: 'Pharmacist Entry',
    description: 'Register and manage pharmacy shops with ownership details, licensing, and payment terms.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 text-blue-600',
    component: PharmacistEntry,
  },
  {
    id: 'supplier',
    title: 'Supplier Entry',
    description: 'Register and manage suppliers/distributors with contact and payment details.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'bg-green-500',
    lightColor: 'bg-green-50 text-green-600',
    component: SupplierEntry,
  },
  {
    id: 'brand',
    title: 'Brand Entry',
    description: 'Manage pharmaceutical brands with type classification and performance categories.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 text-purple-600',
    component: BrandEntry,
  },
  {
    id: 'product',
    title: 'Product Import',
    description: 'Add products manually or via CSV import with brand, GST, and scheme associations.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50 text-indigo-600',
    component: ProductImport,
  },
  {
    id: 'scheme',
    title: 'Scheme Structure',
    description: 'Define promotional schemes with Buy X Get Y Free tiers for products.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50 text-orange-600',
    component: SchemeEntry,
  },
  {
    id: 'area',
    title: 'Area Structure',
    description: 'Define geographical areas with priority and grade for regional management.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50 text-teal-600',
    component: AreaEntry,
  },
];

export default function UtilityDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { pharmacists, suppliers, brands, products, schemes, areas } = useSelector((state) => state.utility);
  const navigate = useNavigate();
  const isAdminOrManager = ['ADMIN', 'MANAGEMENT'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utility Module</h1>
        <p className="text-sm text-gray-500 mt-1">
          Central data management for pharmacies, suppliers, brands, products, schemes, and areas.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Pharmacists', count: pharmacists.length, color: 'bg-blue-500' },
          { label: 'Suppliers', count: suppliers.length, color: 'bg-green-500' },
          { label: 'Brands', count: brands.length, color: 'bg-purple-500' },
          { label: 'Products', count: products.length, color: 'bg-indigo-500' },
          { label: 'Schemes', count: schemes.length, color: 'bg-orange-500' },
          { label: 'Areas', count: areas.length, color: 'bg-teal-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className={`w-2 h-8 ${stat.color} rounded-full mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Utility Manager (Admin/Manager only) */}
      {isAdminOrManager && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Utility Manager</h3>
                <p className="text-sm text-primary-100">Grant or revoke Utility Module access for staff members</p>
              </div>
            </div>
            <UtilityManagerInlineLink />
          </div>
        </div>
      )}

      {/* Sub-Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUB_MODULES.map((mod) => (
          <SubModuleCard key={mod.id} module={mod} />
        ))}
      </div>
    </div>
  );
}

function SubModuleCard({ module }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${module.lightColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            {module.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{module.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{module.description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <button
          onClick={() => navigate(`/utility/${module.id}`)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
        >
          Open Module
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function UtilityManagerInlineLink() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/utility/manager')}
      className="px-4 py-2 bg-white text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      Manage Access
    </button>
  );
}

// Export sub-modules for routing
export { PharmacistEntry, SupplierEntry, BrandEntry, ProductImport, SchemeEntry, AreaEntry, UtilityManager };
