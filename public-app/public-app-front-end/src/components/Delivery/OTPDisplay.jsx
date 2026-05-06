import React, { useState, useEffect, useCallback } from 'react';
import { OTP_CONFIG } from '../../services/deliveryService';

/**
 * OTPDisplay Component
 * 
 * Shows the OTP for delivery verification with:
 * - Large OTP display with copy functionality
 * - Expiry countdown timer
 * - Regenerate OTP button (with limit tracking)
 * - Mask/unmask toggle for security
 * 
 * Only shown for deliveries that are DISPATCHED or OUT_FOR_DELIVERY.
 */
const OTPDisplay = ({ delivery, onRegenerateOTP }) => {
  const [otpData, setOtpData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch OTP data on mount
  useEffect(() => {
    fetchOTP();
  }, [delivery.id]);

  // Countdown timer
  useEffect(() => {
    if (!otpData?.expiresAt || otpData.isExpired) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(otpData.expiresAt);
      const diffMs = expires - now;

      if (diffMs <= 0) {
        setTimeLeft(0);
        setOtpData((prev) => ({ ...prev, isExpired: true }));
        return;
      }

      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${mins}:${String(secs).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otpData?.expiresAt, otpData?.isExpired]);

  const fetchOTP = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await onRegenerateOTP.getOTP(delivery.id);
      setOtpData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [delivery.id]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const data = await onRegenerateOTP.regenerateOTP(delivery.id);
      setOtpData(data);
      setIsMasked(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyOTP = () => {
    if (otpData?.otp) {
      navigator.clipboard.writeText(otpData.otp).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const canRegenerate =
    otpData && otpData.regenerationCount < otpData.maxRegenerations;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Delivery OTP</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !otpData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Delivery OTP</h3>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🔐 Delivery OTP</h3>
        {timeLeft !== null && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              timeLeft === 0
                ? 'bg-red-100 text-red-700'
                : parseInt(timeLeft) <= 3
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {timeLeft === 0 ? '⏰ Expired' : `⏱ ${timeLeft}`}
          </div>
        )}
      </div>

      {/* OTP Display */}
      {otpData && (
        <>
          {otpData.isExpired ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-600 font-medium mb-2">
                This OTP has expired
              </p>
              {canRegenerate ? (
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="btn-primary text-sm"
                >
                  {isRegenerating ? 'Generating...' : '🔄 Regenerate OTP'}
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  Max regeneration limit reached. Contact support.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Share this OTP with the delivery agent
              </p>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="flex items-center gap-1.5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-5 py-3"
                  onClick={() => setIsMasked(!isMasked)}
                >
                  {(isMasked ? otpData.otp.split('').map(() => '•') : otpData.otp.split('')).map(
                    (char, i) => (
                      <span
                        key={i}
                        className="text-2xl font-mono font-bold text-gray-800 w-4 text-center"
                      >
                        {char}
                      </span>
                    )
                  )}
                </div>
                <button
                  onClick={handleCopyOTP}
                  className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
                  title="Copy OTP"
                >
                  {copied ? '✅' : '📋'}
                </button>
                <button
                  onClick={() => setIsMasked(!isMasked)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
                  title={isMasked ? 'Show OTP' : 'Hide OTP'}
                >
                  {isMasked ? '👁' : '🙈'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Tap OTP to {isMasked ? 'reveal' : 'hide'}</p>
            </div>
          )}

          {/* Regeneration Info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Regenerated {otpData.regenerationCount}/{otpData.maxRegenerations} times
            </p>
            {canRegenerate && !otpData.isExpired && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isRegenerating ? 'Generating...' : '🔄 Regenerate'}
              </button>
            )}
          </div>
        </>
      )}

      {/* Error */}
      {error && otpData && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> OTP is valid for {OTP_CONFIG.OTP_VALIDITY_MINUTES} minutes and can only be used once. 
          Do not share it with anyone other than the assigned delivery agent.
        </p>
      </div>
    </div>
  );
};

export default OTPDisplay;
