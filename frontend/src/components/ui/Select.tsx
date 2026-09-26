import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      placeholder,
      options,
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
          <select
            ref={ref}
            id={id}
            className={clsx(
              'input-base appearance-none bg-no-repeat bg-right pr-10',
              'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%2364748B%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")]',
              error && 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20',
              disabled && 'bg-bg-elevated cursor-not-allowed',
              className
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={clsx(error && errorId, hint && !error && hintId)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-caption text-brand-danger flex items-center gap-1" role="alert">
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

Select.displayName = 'Select';