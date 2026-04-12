import React from 'react';
import { DELIVERY_AVAILABILITY_CONFIG } from '../../utils/constants';

const AvailabilityBadge = ({ status }) => {
  const config = DELIVERY_AVAILABILITY_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
};

export default AvailabilityBadge;
