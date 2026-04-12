import React from 'react';

/**
 * Error icon map for toast notifications.
 */
const ErrorIcons = {
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'mic-off': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  hardware: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 9v6m-2-3h4M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  wifi: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
    </svg>
  ),
  'cloud-off': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  browser: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

/**
 * Waveform bars — animated bars simulating audio levels when listening.
 */
const WaveformBars = () => (
  <div className="flex items-center justify-center gap-[3px] h-6 w-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`voice-wave-bar-${i} w-[3px] min-h-[4px] rounded-full bg-red-300`}
      />
    ))}
  </div>
);

/**
 * VoiceSearchButton — Reusable microphone button for voice search.
 * Shows animated waveform, pulsing glow rings, and bounce feedback.
 * Fully responsive with touch-friendly sizing.
 */
const VoiceSearchButton = ({ isListening, onClick, isSupported }) => {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center justify-center flex-shrink-0
        w-10 h-10 sm:w-11 sm:h-11 rounded-full
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-1
        active:scale-95
        ${
          isListening
            ? 'bg-red-500 text-white focus:ring-red-300 animate-voice-glow'
            : 'bg-transparent text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-300'
        }
      `}
      title={isListening ? 'Stop voice search' : 'Start voice search'}
      aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
      aria-pressed={isListening}
    >
      {/* Microphone SVG Icon or Waveform */}
      {isListening ? (
        <span className="animate-mic-bounce flex items-center justify-center">
          <WaveformBars />
        </span>
      ) : (
        <svg className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Pulsing ring layers when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 animate-voice-pulse-ring pointer-events-none" />
          <span className="absolute inset-0 rounded-full bg-red-300 animate-voice-ripple pointer-events-none" />
        </>
      )}
    </button>
  );
};

/**
 * VoiceErrorToast — Toast notification for voice recognition errors.
 * Supports auto-dismiss, retry action, and different error icons.
 */
export const VoiceErrorToast = ({ error, errorDetail, onRetry, onDismiss }) => {
  if (!error || !errorDetail) return null;

  const { title, message, icon, retryable } = errorDetail;

  return (
    <div
      className="animate-toast-in mb-3 px-4 py-3 bg-white border border-red-200 rounded-xl shadow-lg
                 flex items-start gap-3 text-sm"
      role="alert"
    >
      {/* Icon */}
      <span className="flex-shrink-0 mt-0.5 text-red-500">
        {ErrorIcons[icon] || ErrorIcons.alert}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800 text-sm">{title}</p>
        <p className="text-red-600 text-xs mt-0.5 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {retryable && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium
                         bg-red-50 text-red-700 rounded-lg hover:bg-red-100
                         transition-colors border border-red-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium
                       text-gray-500 hover:text-gray-700 hover:bg-gray-50
                       rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Close X */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
        title="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * BrowserCompatBanner — Shows when voice recognition is not supported.
 * Informs the user and suggests alternative browsers.
 */
export const BrowserCompatBanner = ({ onDismiss }) => (
  <div
    className="animate-banner-fade-in mb-3 px-4 py-3 bg-blue-50 border border-blue-200
               rounded-xl flex items-start gap-3 text-sm"
    role="info"
  >
    <span className="flex-shrink-0 mt-0.5 text-blue-500">
      {ErrorIcons.browser}
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-blue-800 text-sm">Voice Search Unavailable</p>
      <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
        Your browser doesn't support voice recognition. For the best experience, please use{' '}
        <span className="font-semibold">Google Chrome</span> or <span className="font-semibold">Microsoft Edge</span>.
      </p>
    </div>
    <button
      onClick={onDismiss}
      className="flex-shrink-0 p-0.5 text-blue-400 hover:text-blue-600 rounded transition-colors"
      title="Dismiss"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export default VoiceSearchButton;
