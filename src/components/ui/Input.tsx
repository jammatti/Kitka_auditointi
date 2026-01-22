/* ============================================================================
   Input Component
   Kela Design System - Accessible text input with validation
   ============================================================================ */

import React, { useId } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Error message - when present, shows error state */
  error?: string;
  /** Mark field as required (adds asterisk to label) */
  required?: boolean;
  /** Input type */
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Full width input */
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      type = 'text',
      fullWidth = true,
      disabled,
      className = '',
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    // Build aria-describedby
    const describedByIds = [
      helperText && helperId,
      error && errorId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    // Build class names
    const inputClasses = [
      'kela-input',
      error && 'kela-input-error',
      !fullWidth && 'kela-input-inline',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fullWidth ? 'kela-form-group' : 'kela-form-group-inline'}>
        {label && (
          <label
            htmlFor={id}
            className={required ? 'kela-label kela-label-required' : 'kela-label'}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedByIds || undefined}
          aria-required={required}
          {...props}
        />

        {helperText && !error && (
          <span id={helperId} className="kela-form-help">
            {helperText}
          </span>
        )}

        {error && (
          <span id={errorId} className="kela-form-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ============================================================================
   Textarea Component
   ============================================================================ */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string;
  /** Helper text shown below textarea */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Mark field as required */
  required?: boolean;
  /** Full width textarea */
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      fullWidth = true,
      disabled,
      className = '',
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const describedByIds = [
      helperText && helperId,
      error && errorId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [
      'kela-textarea',
      error && 'kela-textarea-error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fullWidth ? 'kela-form-group' : 'kela-form-group-inline'}>
        {label && (
          <label
            htmlFor={id}
            className={required ? 'kela-label kela-label-required' : 'kela-label'}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          className={textareaClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedByIds || undefined}
          aria-required={required}
          {...props}
        />

        {helperText && !error && (
          <span id={helperId} className="kela-form-help">
            {helperText}
          </span>
        )}

        {error && (
          <span id={errorId} className="kela-form-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
