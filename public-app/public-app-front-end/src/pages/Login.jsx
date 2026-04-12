import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    dispatch(loginStart());

    // Mock login - replace with API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (userId && pin === '123456') {
      const mockUser = {
        id: userId,
        name: 'Pharmacist User',
        email: `${userId}@pharma.com`,
        role: 'PHARMACIST',
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      dispatch(
        loginSuccess({
          user: mockUser,
          token: mockToken,
        })
      );
      setLoading(false);
      navigate('/dashboard');
    } else {
      const errorMsg = 'Invalid credentials. Use PIN: 123456';
      dispatch(loginFailure(errorMsg));
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pharma Wholesale</h1>
          <p className="text-gray-600 mt-2">Pharmacist Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="input-field"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Try: PHARM001</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="input-field"
              maxLength="6"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Try: 123456</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <ul className="space-y-1">
            <li>• User ID: PHARM001</li>
            <li>• PIN: 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
