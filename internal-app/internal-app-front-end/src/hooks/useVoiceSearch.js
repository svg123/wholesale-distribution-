import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Error type constants for voice search errors.
 */
export const VOICE_ERRORS = {
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NOT_ALLOWED: 'NOT_ALLOWED',
  NO_SPEECH: 'NO_SPEECH',
  AUDIO_CAPTURE: 'AUDIO_CAPTURE',
  NETWORK: 'NETWORK',
  ABORTED: 'ABORTED',
  FAILED_TO_START: 'FAILED_TO_START',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Maps raw Web Speech API error codes to user-friendly messages.
 */
const ERROR_MAP = {
  'not-allowed': {
    type: VOICE_ERRORS.NOT_ALLOWED,
    title: 'Microphone Access Denied',
    message: 'Please allow microphone access in your browser settings to use voice search.',
    retryable: false,
  },
  'no-speech': {
    type: VOICE_ERRORS.NO_SPEECH,
    title: 'No Speech Detected',
    message: "We couldn't hear anything. Please try again and speak clearly.",
    retryable: true,
  },
  'audio-capture': {
    type: VOICE_ERRORS.AUDIO_CAPTURE,
    title: 'No Microphone Found',
    message: 'Please connect a microphone and try again.',
    retryable: false,
  },
  network: {
    type: VOICE_ERRORS.NETWORK,
    title: 'Network Error',
    message: 'Voice recognition requires an internet connection. Please check and try again.',
    retryable: true,
  },
  'service-not-allowed': {
    type: VOICE_ERRORS.NOT_SUPPORTED,
    title: 'Service Unavailable',
    message: 'Voice recognition service is not available. Please try again later.',
    retryable: true,
  },
};

/**
 * Custom hook for voice search using the Web Speech API.
 *
 * Provides a simple interface:
 *  - `toggleListening()` — start / stop mic
 *  - `transcript` — final recognised text (auto-set into search input via `onResult`)
 *  - `interimTranscript` — live partial text while speaking
 *  - `isListening` — boolean mic-active indicator
 *  - `isSupported` — browser support flag
 *  - `error` / `errorDetail` — human-readable errors
 *  - `clearError()` — dismiss error banner
 *
 * @param {Object}  opts
 * @param {Function} opts.onResult   — called with the final transcript string
 * @param {Function} opts.onInterim   — called with interim (partial) transcript
 * @param {string}   opts.lang        — BCP-47 language tag (default 'en-US')
 * @param {number}   opts.timeout     — auto-stop after this many ms (default 8000)
 */
const useVoiceSearch = ({
  onResult,
  onInterim,
  lang = 'en-US',
  timeout = 8000,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);

  // Keep callback refs up-to-date without re-creating the recognition instance
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

  // Initialize SpeechRecognition (once)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice search is not supported in this browser.');
      setErrorDetail({
        type: VOICE_ERRORS.NOT_SUPPORTED,
        title: 'Browser Not Supported',
        message: 'Voice search requires Google Chrome or Microsoft Edge.',
        retryable: false,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setErrorDetail(null);
      setInterimTranscript('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText.trim());
        if (onInterimRef.current) onInterimRef.current(interimText.trim());
      }

      if (finalText) {
        const cleaned = finalText.trim();
        setTranscript(cleaned);
        setInterimTranscript('');
        if (onResultRef.current) onResultRef.current(cleaned);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);

      if (event.error === 'aborted') {
        setError(null);
        setErrorDetail(null);
        return;
      }

      const mapped = ERROR_MAP[event.error] || {
        type: VOICE_ERRORS.UNKNOWN,
        title: 'Voice Error',
        message: `Something went wrong: ${event.error}. Please try again.`,
        retryable: true,
      };

      setError(mapped.message);
      setErrorDetail(mapped);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
      clearTimeout(timeoutRef.current);
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setError(null);
    setErrorDetail(null);
    setTranscript('');
    setInterimTranscript('');

    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => { recognitionRef.current?.start(); }, 150);
      } catch {
        setError('Failed to start voice search. Please try again.');
        setErrorDetail({
          type: VOICE_ERRORS.FAILED_TO_START,
          title: 'Start Failed',
          message: 'Could not start voice recognition.',
          retryable: true,
        });
      }
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
    }, timeout);
  }, [timeout]);

  const stopListening = useCallback(() => {
    clearTimeout(timeoutRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetail(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    errorDetail,
    toggleListening,
    clearError,
  };
};

export default useVoiceSearch;
