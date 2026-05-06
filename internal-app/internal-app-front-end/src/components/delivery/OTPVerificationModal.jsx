import React, { useState, useRef, useEffect } from 'react';

/**
 * OTPVerificationModal Component
 * 
 * Modal for delivery agents to verify OTP at delivery time.
 * 
 * Features:
 * - 6-digit OTP input with auto-focus
 * - Verify button
 * - Error handling for wrong/expired OTP
 * - Success state with auto-close
 * 
 * Used in: Internal App delivery task cards / My Delivery Tasks
 */
const OTPVerificationModal = ({ delivery, onVerify, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      setError('');
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await onVerify(delivery.id, otpValue);
      setIsSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onClose(true);
      }, 2000);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in">
        {/* Close button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
        >
          ✕
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">OTP Verified!</h3>
            <p className="text-sm text-green-600">
              Delivery has been marked as completed successfully.
            </p>
          </div>
        ) : (
          /* Verification Form */
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Verify Delivery OTP</h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter the OTP provided by the pharmacist
              </p>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Order</span>
                <span className="font-mono font-semibold text-blue-600">
                  {delivery.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Pharmacy</span>
                <span className="font-medium text-gray-800">{delivery.pharmacy}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Address</span>
                <span className="text-gray-700 text-right max-w-[200px] truncate">
                  {delivery.pharmacyAddress}
                </span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      error
                        ? 'border-red-300 bg-red-50'
                        : digit
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">❌ {error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onClose(false)}
                className="flex-1 btn-secondary"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.join('').length !== 6}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerificationModal;
