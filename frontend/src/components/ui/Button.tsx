import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-hover/90 shadow-sm',
  secondary: 'bg-bg-elevated text-text-primary border border-border-subtle hover:bg-border-subtle active:bg-border-emphasis shadow-sm',
  outline: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/10',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-elevated active:bg-border-subtle',
  danger: 'bg-brand-danger text-white hover:bg-brand-danger/90 active:bg-brand-danger shadow-sm',
  success: 'bg-status-success-bg text-status-success-text border border-status-success-border hover:bg-status-success-bg/80 shadow-sm',
  warning: 'bg-status-warning-bg text-status-warning-text border border-status-warning-border hover:bg-status-warning-bg/80 shadow-sm',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-body-sm gap-1.5',
  md: 'px-4 py-2.5 text-body gap-2',
  lg: 'px-6 py-3 text-body-lg gap-2.5',
  icon: 'p-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      style,
      whileTap,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={clsx(
          'btn-base',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'cursor-not-allowed',
          className
        )}
        style={style}
        disabled={isDisabled}
        whileTap={whileTap ?? { scale: 0.98 }}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <motion.span
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <svg
              className="animate-spin w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.span>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';