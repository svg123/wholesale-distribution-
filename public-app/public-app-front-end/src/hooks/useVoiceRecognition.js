import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Error type constants for voice recognition errors.
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
 * Maps raw Web Speech API error codes to user-friendly messages and types.
 */
const ERROR_MAP = {
  'not-allowed': {
    type: VOICE_ERRORS.NOT_ALLOWED,
    title: 'Microphone Access Denied',
    message: 'Please allow microphone access in your browser settings to use voice search.',
    icon: 'shield',
    retryable: false,
  },
  'no-speech': {
    type: VOICE_ERRORS.NO_SPEECH,
    title: 'No Speech Detected',
    message: "We couldn't hear anything. Please try again and speak clearly near your microphone.",
    icon: 'mic-off',
    retryable: true,
  },
  'audio-capture': {
    type: VOICE_ERRORS.AUDIO_CAPTURE,
    title: 'No Microphone Found',
    message: 'Please connect a microphone and try again.',
    icon: 'hardware',
    retryable: false,
  },
  'network': {
    type: VOICE_ERRORS.NETWORK,
    title: 'Network Error',
    message: 'Voice recognition requires an internet connection. Please check and try again.',
    icon: 'wifi',
    retryable: true,
  },
  'service-not-allowed': {
    type: VOICE_ERRORS.NOT_SUPPORTED,
    title: 'Service Unavailable',
    message: 'Voice recognition service is not available. Please try again later.',
    icon: 'cloud-off',
    retryable: true,
  },
};

/**
 * Custom hook for voice recognition using the Web Speech API.
 * Provides start/stop recording, interim & final transcribed text,
 * browser compatibility checks, and comprehensive error handling.
 */
const useVoiceRecognition = ({
  onResult,
  onInterim,
  lang = 'en-US',
  continuous = false,
  interimResults = true,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [listenCount, setListenCount] = useState(0);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);

  // Keep callback refs up to date without re-creating recognition
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice recognition is not supported in this browser.');
      setErrorDetail({
        type: VOICE_ERRORS.NOT_SUPPORTED,
        title: 'Browser Not Supported',
        message: 'Voice search requires Google Chrome or Microsoft Edge. Please switch to a supported browser.',
        icon: 'browser',
        retryable: false,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setErrorDetail(null);
      setInterimTranscript('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      // Update interim transcript in real-time
      if (interimText) {
        setInterimTranscript(interimText.trim());
        if (onInterimRef.current) {
          onInterimRef.current(interimText.trim());
        }
      }

      // If we have a final transcript, commit it and trigger search
      if (finalTranscript) {
        const cleanedTranscript = finalTranscript.trim();
        setTranscript(cleanedTranscript);
        setInterimTranscript('');
        if (onResultRef.current) {
          onResultRef.current(cleanedTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);

      // User aborted — no error
      if (event.error === 'aborted') {
        setError(null);
        setErrorDetail(null);
        return;
      }

      const mapped = ERROR_MAP[event.error] || {
        type: VOICE_ERRORS.UNKNOWN,
        title: 'Voice Error',
        message: `Something went wrong: ${event.error}. Please try again.`,
        icon: 'alert',
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
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
      clearTimeout(timeoutRef.current);
    };
  }, [lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setError(null);
    setErrorDetail(null);
    setTranscript('');
    setInterimTranscript('');
    setListenCount((c) => c + 1);

    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => { recognitionRef.current?.start(); }, 150);
      } catch {
        setError('Failed to start voice recognition. Please try again.');
        setErrorDetail({
          type: VOICE_ERRORS.FAILED_TO_START,
          title: 'Start Failed',
          message: 'Could not start voice recognition. Please try again.',
          icon: 'alert',
          retryable: true,
        });
      }
    }

    // Auto-stop after 10 seconds to prevent hanging
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
    }, 10000);
  }, []);

  const stopListening = useCallback(() => {
    clearTimeout(timeoutRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
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
    listenCount,
    startListening,
    stopListening,
    toggleListening,
    clearError,
  };
};

export default useVoiceRecognition;
