import React from 'react';
import { OperationStatus, MoveStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';

interface StatusBadgeProps {
  status: OperationStatus | MoveStatus | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  switch (status) {
    case 'DONE':
    case 'IN_STOCK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{status === 'IN_STOCK' ? 'In Stock' : 'Done'}</span>
        </span>
      );

    case 'READY':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Ready to Validate</span>
        </span>
      );

    case 'WAITING':
    case 'LOW_STOCK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>{status === 'LOW_STOCK' ? 'Low Stock' : 'Waiting'}</span>
        </span>
      );

    case 'DRAFT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Draft</span>
        </span>
      );

    case 'CANCELED':
    case 'OUT_OF_STOCK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>{status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Canceled'}</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};
