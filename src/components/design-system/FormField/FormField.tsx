import React, { forwardRef } from 'react';
import { Input, type InputProps } from '../Input';
import { Label, type LabelProps } from '../Label';
import { cn } from '../utils';

export interface FormFieldProps extends Omit<InputProps, 'label' | 'error' | 'success' | 'warning'> {
  /** Label text for the field */
  label?: string;
  /** Field name (useful for react-hook-form) */
  name?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Warning message to display */
  warningMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS class for the container */
  containerClassName?: string;
  /** Label props */
  labelProps?: Partial<LabelProps>;
  /** Helper text (displayed when no error/success/warning) */
  helperText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    label,
    name,
    errorMessage,
    successMessage,
    warningMessage,
    required,
    containerClassName,
    labelProps,
    helperText,
    className,
    ...inputProps
  }, ref) => {
    // Determine the current state
    const currentState = errorMessage ? 'error' : successMessage ? 'success' : warningMessage ? 'warning' : 'default';
    const currentMessage = errorMessage || successMessage || warningMessage || helperText;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <Label
            htmlFor={name}
            required={required}
            state={currentState}
            className="mb-1.5"
            {...labelProps}
          >
            {label}
          </Label>
        )}

        <Input
          ref={ref}
          id={name}
          name={name}
          error={errorMessage}
          success={successMessage}
          warning={warningMessage}
          helperText={currentMessage}
          className={className}
          {...inputProps}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';