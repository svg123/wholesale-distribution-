import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Pharma Wholesale</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* KPI Cards */}
          <div className="card">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Completed Orders</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/order-placement')}
              className="btn-primary w-full">
              Place New Order
            </button>
            <button 
              onClick={() => navigate('/order-history')}
              className="btn-secondary w-full">
              View Order History
            </button>
            <button 
              onClick={() => navigate('/track-order')}
              className="btn-secondary w-full">
              Track Order
            </button>
            <button 
              onClick={() => navigate('/outstanding')}
              className="btn-secondary w-full">
              Outstanding & Credits
            </button>
            <button 
              onClick={() => navigate('/offers')}
              className="btn-secondary w-full">
              🎉 Offers & Promotions
            </button>
            <button 
              onClick={() => navigate('/communication')}
              className="btn-secondary w-full">
              💬 Communication
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="btn-secondary w-full">
              View Profile
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mt-8 card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-4">
            This is your pharmaceutical wholesale ordering portal. You can:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Place new orders for pharmaceutical products</li>
            <li>Track your order status in real-time</li>
            <li>View order history and details</li>
            <li>Manage your account settings</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
