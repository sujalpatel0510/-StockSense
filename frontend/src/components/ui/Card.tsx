import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantStyles = {
  default: 'bg-bg-surface border border-border-subtle shadow-xs',
  elevated: 'bg-bg-surface border border-border-subtle shadow-md',
  outlined: 'bg-bg-surface border-2 border-border-emphasis shadow-none',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'card-base rounded-xl',
          variantStyles[variant],
          paddingStyles[padding],
          hoverable && 'transition-all duration-base cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={clsx('text-h3 text-text-primary font-semibold', className)} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx('text-body-sm text-text-muted mt-1', className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('mt-4 pt-4 border-t border-border-subtle flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'neutral' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-primary',
  iconBg = 'bg-brand-primary/10',
  badge,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      variant="default"
      padding="md"
      hoverable={!!onClick}
      className="flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-micro font-bold uppercase tracking-wider text-text-muted">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary font-mono tracking-tight">
              {value}
            </span>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-caption">
        <span className="text-text-muted truncate">{subtitle || 'Updated real-time'}</span>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-micro font-bold font-mono ${
              badge.variant === 'positive'
                ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
                : badge.variant === 'warning'
                ? 'bg-status-warning-bg text-status-warning-text border border-status-warning-border'
                : badge.variant === 'info'
                ? 'bg-status-info-bg text-status-info-text border border-status-info-border'
                : 'bg-status-neutral-bg text-status-neutral-text border border-status-neutral-border'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </Card>
  );
};