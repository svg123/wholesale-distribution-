import React from 'react';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

const colorClasses = {
  info: 'badge-info',
  warning: 'badge-warning',
  danger: 'badge-danger',
  success: 'badge-success',
  primary: 'badge-info',
  gray: 'badge-gray',
};

export default function StatusBadge({ status, config = ORDER_STATUS_CONFIG, size = 'sm' }) {
  const statusInfo = config[status] || { label: status, color: 'gray' };
  const badgeClass = colorClasses[statusInfo.color] || 'badge-gray';
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : '';

  return <span className={`${badgeClass} ${sizeClass}`}>{statusInfo.label}</span>;
}

export function SimpleBadge({ children, color = 'gray' }) {
  return <span className={colorClasses[color] || 'badge-gray'}>{children}</span>;
}
