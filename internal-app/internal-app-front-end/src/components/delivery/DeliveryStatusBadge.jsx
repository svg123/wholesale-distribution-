import React from 'react';
import { DELIVERY_STATUS_CONFIG } from '../../utils/constants';

const statusConfig = DELIVERY_STATUS_CONFIG;

const DeliveryStatusBadge = ({ status, size = 'sm' }) => {
  const config = statusConfig[status];
  if (!config) return null;

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
};

export default DeliveryStatusBadge;
