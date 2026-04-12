import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount) {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ===== Order Time Tracking Utilities =====

/**
 * Time thresholds for order urgency (in milliseconds)
 */
export const URGENCY_THRESHOLDS = {
  NORMAL: 2 * 60 * 60 * 1000,     // 2 hours
  WARNING: 3 * 60 * 60 * 1000,    // 3 hours
  DELAYED: 4 * 60 * 60 * 1000,    // 4 hours
};

/**
 * Get urgency level based on elapsed time since status change
 * Returns: 'normal' | 'warning' | 'delayed'
 */
export function getUrgencyLevel(statusChangedAt) {
  if (!statusChangedAt) return 'normal';
  const elapsed = Date.now() - new Date(statusChangedAt).getTime();
  if (elapsed >= URGENCY_THRESHOLDS.DELAYED) return 'delayed';
  if (elapsed >= URGENCY_THRESHOLDS.WARNING) return 'warning';
  return 'normal';
}

/**
 * Calculate elapsed time since a given timestamp
 * Returns { hours, minutes, seconds, totalMs }
 */
export function getElapsedTime(timestamp) {
  if (!timestamp) return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, totalMs: diff };
}

/**
 * Format elapsed time as a compact string (e.g., "2h 15m", "45m 12s", "12s")
 */
export function formatElapsedTime(timestamp) {
  const { hours, minutes, seconds } = getElapsedTime(timestamp);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Get urgency styling config
 */
export function getUrgencyStyle(urgencyLevel) {
  switch (urgencyLevel) {
    case 'delayed':
      return {
        borderColor: 'border-l-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        badgeBg: 'bg-red-100 text-red-700',
        dotColor: 'bg-red-500',
        animation: 'animate-pulse-delayed',
      };
    case 'warning':
      return {
        borderColor: 'border-l-amber-400',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-700',
        dotColor: 'bg-amber-400',
        animation: 'animate-pulse-warning',
      };
    default:
      return {
        borderColor: 'border-l-green-400',
        bgColor: 'bg-white',
        textColor: 'text-gray-700',
        badgeBg: 'bg-gray-100 text-gray-600',
        dotColor: 'bg-green-400',
        animation: '',
      };
  }
}
