import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  markMessageRead,
  markAllMessagesRead,
} from '../../redux/slices/communicationSlice';
import { fetchMessages } from '../../services/mockCommunicationData';

const MessagesTab = () => {
  const dispatch = useDispatch();
  const { messages, isLoadingMessages, messagesError, unreadCount } =
    useSelector((state) => state.communication);

  // Fetch messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      dispatch(fetchMessagesStart());
      try {
        const data = await fetchMessages();
        dispatch(fetchMessagesSuccess(data));
      } catch (err) {
        dispatch(fetchMessagesFailure(err.message || 'Failed to load messages.'));
      }
    };
    loadMessages();
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markMessageRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllMessagesRead());
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500" title="High Priority" />
        );
      case 'medium':
        return (
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-yellow-500" title="Medium Priority" />
        );
      default:
        return (
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-blue-400" title="Low Priority" />
        );
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFullDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Loading state ──
  if (isLoadingMessages) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading messages...</p>
      </div>
    );
  }

  // ── Error state ──
  if (messagesError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-700 font-semibold mb-1">Failed to Load Messages</p>
        <p className="text-sm text-red-500 mb-4">{messagesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with unread count and Mark All Read */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Messages</h3>
            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800
                       hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 13l4 4L19 7" />
            </svg>
            Mark all as read
          </button>
        )}
      </div>

      {/* Messages list */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 font-medium">No messages yet</p>
          <p className="text-sm text-gray-400 mt-1">Messages from the admin will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => !msg.isRead && handleMarkRead(msg.id)}
              className={`
                bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer
                transition-all duration-200 hover:shadow-md
                ${!msg.isRead
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/40'
                  : 'border border-gray-200'
                }
              `}
            >
              <div className="p-4 sm:p-5">
                {/* Top row: priority dot, title, date */}
                <div className="flex items-start gap-3">
                  {getPriorityIcon(msg.priority)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm sm:text-base ${!msg.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {msg.title}
                      </h4>
                      {!msg.isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                       bg-blue-500 text-white uppercase tracking-wide">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      From {msg.from} · {formatDate(msg.date)}
                    </p>
                  </div>
                </div>

                {/* Message content */}
                <p className={`mt-3 text-sm leading-relaxed ${!msg.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                  {msg.content}
                </p>

                {/* Footer: full date + mark as read */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{formatFullDate(msg.date)}</p>
                  {!msg.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(msg.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600
                                 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesTab;
