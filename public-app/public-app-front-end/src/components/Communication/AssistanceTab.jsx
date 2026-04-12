import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitRequestStart,
  submitRequestSuccess,
  submitRequestFailure,
  clearRequestStatus,
} from '../../redux/slices/communicationSlice';
import { submitAssistanceRequest, fetchRequestHistory } from '../../services/mockCommunicationData';

const AssistanceTab = () => {
  const dispatch = useDispatch();
  const { isSubmittingRequest, requestSuccess, requestError, requests } =
    useSelector((state) => state.communication);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1000;

  // Fetch request history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await fetchRequestHistory();
        setHistory(data);
      } catch {
        // Silently fail — history is optional
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  // Auto-dismiss success/error after 5 seconds
  useEffect(() => {
    if (requestSuccess) {
      const timer = setTimeout(() => dispatch(clearRequestStatus()), 5000);
      return () => clearTimeout(timer);
    }
  }, [requestSuccess, dispatch]);

  const handleMessageChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setMessage(val);
      setCharCount(val.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    dispatch(submitRequestStart());

    try {
      const newRequest = await submitAssistanceRequest({ subject, message });
      dispatch(submitRequestSuccess(newRequest));

      // Add to local history
      setHistory((prev) => [newRequest, ...prev]);

      // Reset form
      setSubject('');
      setMessage('');
      setCharCount(0);
    } catch (err) {
      dispatch(submitRequestFailure(err.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
    };
    const labels = { open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved' };
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {requestSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl animate-toast-in">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-800 text-sm">Request Submitted Successfully</p>
            <p className="text-green-600 text-xs mt-0.5">Our team will get back to you shortly.</p>
          </div>
          <button
            onClick={() => dispatch(clearRequestStatus())}
            className="text-green-500 hover:text-green-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {requestError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl animate-toast-in">
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 text-sm flex-1">{requestError}</p>
          <button
            onClick={() => dispatch(clearRequestStatus())}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Assistance Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Request Assistance</h3>
            <p className="text-sm text-gray-500">Describe your issue and our team will help you</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="input-field"
              disabled={isSubmittingRequest}
              maxLength={150}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="Describe your issue in detail — include order numbers, product names, or screenshots if applicable..."
              rows={5}
              className="input-field resize-none"
              disabled={isSubmittingRequest}
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">Please be as specific as possible for faster resolution</p>
              <p className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{MAX_CHARS}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setSubject(''); setMessage(''); setCharCount(0); }}
              className="btn-secondary text-sm"
              disabled={isSubmittingRequest}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmittingRequest || !message.trim()}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isSubmittingRequest || !message.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200'
                }
              `}
            >
              {isSubmittingRequest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Request History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Previous Requests</h3>
              <p className="text-sm text-gray-500">{history.length} request{history.length !== 1 ? 's' : ''} submitted</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {loadingHistory ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading request history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 font-medium">No previous requests</p>
              <p className="text-sm text-gray-400 mt-1">Your submitted requests will appear here</p>
            </div>
          ) : (
            history.map((req) => (
              <div key={req.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{req.id}</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{req.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(req.date)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistanceTab;
