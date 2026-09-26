import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles = {
  success: 'bg-status-success-bg text-status-success-text border border-status-success-border',
  warning: 'bg-status-warning-bg text-status-warning-text border border-status-warning-border',
  danger: 'bg-status-danger-bg text-status-danger-text border border-status-danger-border',
  info: 'bg-status-info-bg text-status-info-text border border-status-info-border',
  neutral: 'bg-status-neutral-bg text-status-neutral-text border border-status-neutral-border',
  primary: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-micro gap-1',
  md: 'px-2.5 py-0.5 text-caption gap-1.5',
  lg: 'px-3 py-1 text-body-sm gap-2',
};

const dotColors = {
  success: 'bg-status-success-text',
  warning: 'bg-status-warning-text',
  danger: 'bg-status-danger-text',
  info: 'bg-status-info-text',
  neutral: 'bg-status-neutral-text',
  primary: 'bg-brand-primary',
  purple: 'bg-purple-600',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'badge-base inline-flex items-center',
        variantStyles[variant],
        sizeStyles[size],
        removable && 'pr-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={clsx(
            'ml-1 p-0.5 rounded transition-colors',
            'hover:bg-black/10 focus:bg-black/10',
            'text-current opacity-70 hover:opacity-100'
          )}
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';
  size?: 'sm' | 'md';
}> = ({ status, size = 'sm' }) => {
  const statusConfig = {
    IN_STOCK: { label: 'In Stock', variant: 'success' as const, dot: true },
    LOW_STOCK: { label: 'Low Stock', variant: 'warning' as const, dot: true },
    OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger' as const, dot: true },
    DRAFT: { label: 'Draft', variant: 'neutral' as const, dot: true },
    WAITING: { label: 'Waiting', variant: 'info' as const, dot: true },
    READY: { label: 'Ready', variant: 'info' as const, dot: true },
    DONE: { label: 'Done', variant: 'success' as const, dot: true },
    CANCELED: { label: 'Canceled', variant: 'danger' as const, dot: true },
  };

  const config = statusConfig[status] || { label: status, variant: 'neutral' as const };

  return <Badge variant={config.variant} size={size} dot={config.dot}>{config.label}</Badge>;
};