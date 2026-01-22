/* ============================================================================
   Select Component
   Kela Design System - Accessible dropdown select
   ============================================================================ */

import React, { useId } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;
  /** Helper text shown below select */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Mark field as required */
  required?: boolean;
  /** Placeholder option */
  placeholder?: string;
  /** Options array */
  options?: SelectOption[];
  /** Option groups array */
  optionGroups?: SelectOptionGroup[];
  /** Full width select */
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      placeholder,
      options = [],
      optionGroups = [],
      fullWidth = true,
      disabled,
      className = '',
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      children,
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

    const selectClasses = [
      'kela-select',
      error && 'kela-select-error',
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

        <select
          ref={ref}
          id={id}
          className={selectClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedByIds || undefined}
          aria-required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Render option groups if provided */}
          {optionGroups.length > 0 &&
            optionGroups.map((group, groupIndex) => (
              <optgroup key={groupIndex} label={group.label}>
                {group.options.map((option, optionIndex) => (
                  <option
                    key={`${groupIndex}-${optionIndex}`}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}

          {/* Render flat options if no groups */}
          {optionGroups.length === 0 &&
            options.map((option, index) => (
              <option key={index} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}

          {/* Allow custom children for more control */}
          {children}
        </select>

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

Select.displayName = 'Select';
