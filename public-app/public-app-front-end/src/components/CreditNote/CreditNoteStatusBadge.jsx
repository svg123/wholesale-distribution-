import React from 'react';
import { CN_STATUS_CONFIG } from '../../redux/slices/creditNoteSlice';

export default function CreditNoteStatusBadge({ status }) {
  const config = CN_STATUS_CONFIG[status] || CN_STATUS_CONFIG.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bgClass} ${config.textClass}`}>
      {config.label}
    </span>
  );
}
