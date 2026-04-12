import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiX, FiUser, FiMapPin, FiTruck, FiPhone } from 'react-icons/fi';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { DELIVERY_STATUSES, DELIVERY_AVAILABILITY } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { formatDeliveryTime } from '../../services/deliveryService';

const DeliveryTaskCard = ({ task, onAssign, onStatusUpdate, onViewDetails, compact = false }) => {
  const { user } = useSelector((state) => state.auth);
  const [showActions, setShowActions] = useState(false);

  const priorityConfig = {
    HIGH: { label: 'High', class: 'bg-red-100 text-red-700 border-red-200' },
    MEDIUM: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    LOW: { label: 'Low', class: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const canAssign = ['ADMIN', 'MANAGEMENT', 'OPERATOR'].includes(user?.role);
  const canUpdateStatus = ['ADMIN', 'MANAGEMENT', 'OPERATOR'].includes(user?.role) ||
    task.assignedTo?.id === user?.id;

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case DELIVERY_STATUSES.READY_FOR_DISPATCH:
        return DELIVERY_STATUSES.ASSIGNED;
      case DELIVERY_STATUSES.ASSIGNED:
        return DELIVERY_STATUSES.IN_PROGRESS;
      case DELIVERY_STATUSES.IN_PROGRESS:
        return DELIVERY_STATUSES.DELIVERED;
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case DELIVERY_STATUSES.READY_FOR_DISPATCH:
        return 'Assign';
      case DELIVERY_STATUSES.ASSIGNED:
        return 'Start Delivery';
      case DELIVERY_STATUSES.IN_PROGRESS:
        return 'Mark Delivered';
      default:
        return null;
    }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  return (
    <div className="card hover:shadow-md transition-all">
      <div className="card-body p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono font-semibold text-primary-600">{task.orderId}</span>
              <DeliveryStatusBadge status={task.status} />
              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${priority.class}`}>
                {priority.label}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{task.pharmacy}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <FiMapPin className="w-3 h-3" />
              <span>{task.pharmacyAddress}</span>
            </div>
          </div>
          <div className="text-right ml-3">
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(task.totalAmount)}</p>
            <p className="text-xs text-gray-500">{task.items} items</p>
          </div>
        </div>

        {/* Assignment Info */}
        {task.assignedTo && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{task.assignedTo.name}</p>
              <p className="text-xs text-gray-500">Assigned by {task.assignedBy}</p>
            </div>
            {task.assignedTo.phone && (
              <a href={`tel:${task.assignedTo.phone}`} className="text-primary-600 hover:text-primary-700">
                <FiPhone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Created: {formatDeliveryTime(task.createdAt)}</span>
          {task.dispatchedAt && <span>Dispatched: {formatDeliveryTime(task.dispatchedAt)}</span>}
          {task.deliveredAt && <span>Delivered: {formatDeliveryTime(task.deliveredAt)}</span>}
        </div>

        {/* Notes */}
        {task.notes && (
          <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            📝 {task.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {canAssign && !task.assignedTo && task.status === DELIVERY_STATUSES.READY_FOR_DISPATCH && (
            <button
              onClick={() => onAssign && onAssign(task)}
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              Assign Delivery
            </button>
          )}

          {canUpdateStatus && task.assignedTo && getNextStatus(task.status) && (
            <button
              onClick={() => onStatusUpdate && onStatusUpdate(task, getNextStatus(task.status))}
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              {getNextStatusLabel(task.status)}
            </button>
          )}

          {task.assignedTo && canAssign && task.status !== DELIVERY_STATUSES.DELIVERED && (
            <button
              onClick={() => onAssign && onAssign(task)}
              className="btn btn-outline text-xs py-1.5 px-3"
            >
              Reassign
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(task)}
              className="btn btn-ghost text-xs py-1.5 px-3 ml-auto"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTaskCard;
