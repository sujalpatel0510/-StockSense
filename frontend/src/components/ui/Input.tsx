import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      className,
      id: providedId,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="label-base">
            {label}
            {required && <span className="text-brand-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {(leftIcon || leftElement) && (
            <div
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted"
              aria-hidden="true"
            >
              {leftElement || leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={clsx(
              'input-base',
              (leftIcon || leftElement) && 'pl-10',
              (rightIcon || rightElement) && 'pr-10',
              error && 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20',
              disabled && 'bg-bg-elevated cursor-not-allowed',
              className
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={clsx(error && errorId, hint && !error && hintId)}
            {...props}
          />
          {(rightIcon || rightElement) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted z-10">
              {rightElement || rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-caption text-brand-danger flex items-center gap-1"
            role="alert"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-caption text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';