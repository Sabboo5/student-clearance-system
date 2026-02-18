import React from 'react';
import { getStatusColor, capitalize } from '../../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${getStatusColor(status)} ${sizeClass}`}>
      {capitalize(status)}
    </span>
  );
};

export default StatusBadge;
