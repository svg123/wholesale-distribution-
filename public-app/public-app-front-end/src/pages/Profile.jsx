import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    company: 'ABC Pharmacies Ltd.',
    address: '123, Medical Street, Healthcare City',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    gstNumber: 'GST123ABC456',
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // TODO: Replace with API call to update profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // Show success notification
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+91 98765 43210',
      company: 'ABC Pharmacies Ltd.',
      address: '123, Medical Street, Healthcare City',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      gstNumber: 'GST123ABC456',
    });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account and settings</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'P'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.id}</p>
                <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Active
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹48,560</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Member Since</p>
                  <p className="text-sm text-gray-900 font-medium">Jan 2025</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'company'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Company Details
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary text-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    {/* ZIP Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Display Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="text-lg font-medium text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email Address</p>
                        <p className="text-lg font-medium text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                        <p className="text-lg font-medium text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">User ID</p>
                        <p className="text-lg font-medium text-gray-900">{user?.id}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-lg font-medium text-gray-900">{formData.address}</p>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">City</p>
                          <p className="text-lg font-medium text-gray-900">{formData.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">State</p>
                          <p className="text-lg font-medium text-gray-900">{formData.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">ZIP Code</p>
                          <p className="text-lg font-medium text-gray-900">{formData.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Details Tab */}
            {activeTab === 'company' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Details</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company Name</p>
                    <p className="text-lg font-medium text-gray-900">{formData.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">GST Number</p>
                    <p className="text-lg font-medium text-gray-900">{formData.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Address</p>
                    <p className="text-lg font-medium text-gray-900">
                      {formData.address}, {formData.city}, {formData.state} - {formData.zipCode}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Account Status:</span> Active & Verified
                      </p>
                      <p className="text-sm text-blue-900 mt-1">
                        <span className="font-semibold">Verification Date:</span> January 15, 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="input-field w-full"
                      />
                    </div>
                    <button type="button" className="btn-primary">
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Two-Factor Authentication</h2>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-900 font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Secure your account with two-factor authentication</p>
                    </div>
                    <button className="btn-secondary">Enable</button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                      <div>
                        <p className="font-medium text-gray-900">Current Device</p>
                        <p className="text-sm text-gray-600">Chrome on Windows • Last active: Just now</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Current
                      </span>
                    </div>
                    <div className="flex justify-between items-start pt-4">
                      <div>
                        <p className="font-medium text-gray-900">Another Device</p>
                        <p className="text-sm text-gray-600">Safari on iPhone • Last active: 2 days ago</p>
                      </div>
                      <button className="text-red-600 text-sm font-medium hover:text-red-700">
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Login Activity</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div>
                      <p className="font-medium text-gray-900">Login successful</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • 192.168.1.100</p>
                    </div>
                    <p className="text-sm text-gray-500">Today, 10:30 AM</p>
                  </div>

                  <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div>
                      <p className="font-medium text-gray-900">Login successful</p>
                      <p className="text-sm text-gray-600">Safari on iPhone • 192.168.1.101</p>
                    </div>
                    <p className="text-sm text-gray-500">Yesterday, 3:45 PM</p>
                  </div>

                  <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div>
                      <p className="font-medium text-gray-900">Profile updated</p>
                      <p className="text-sm text-gray-600">Changed email address</p>
                    </div>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>

                  <div className="flex justify-between items-start pt-4">
                    <div>
                      <p className="font-medium text-gray-900">Password changed</p>
                      <p className="text-sm text-gray-600">Password was updated</p>
                    </div>
                    <p className="text-sm text-gray-500">5 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
