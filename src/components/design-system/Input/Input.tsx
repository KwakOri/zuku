import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const inputVariants = cva(
  // Base styles
  "w-full font-medium transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: [
          "bg-white border border-gray-200 text-gray-800 placeholder:text-gray-500",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:text-primary-700",
          "hover:border-gray-300"
        ],
        outline: [
          "bg-transparent border border-gray-300 text-gray-800",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "hover:border-gray-400"
        ],
        filled: [
          "bg-gray-100 border-0 text-gray-800",
          "focus:bg-gray-50 focus:ring-2 focus:ring-primary-500/20",
          "hover:bg-gray-200"
        ],
      },
      size: {
        sm: "px-3 py-2 text-sm h-8 rounded-lg",
        md: "px-4 py-2.5 text-base h-10 rounded-xl",
        lg: "px-5 py-3 text-lg h-12 rounded-xl",
      },
      state: {
        default: "",
        error: "border-error-500 text-error-700 focus:border-error-500 focus:ring-error-500/20",
        success: "border-success-500 text-success-700 focus:border-success-500 focus:ring-success-500/20",
        warning: "border-warning-500 text-warning-700 focus:border-warning-500 focus:ring-warning-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

const labelVariants = cva(
  "block font-medium mb-1.5",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
      state: {
        default: "text-gray-700",
        error: "text-error-600",
        success: "text-success-600",
        warning: "text-warning-600",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);

const helperTextVariants = cva(
  "mt-1.5 text-sm",
  {
    variants: {
      state: {
        default: "text-gray-600",
        error: "text-error-600",
        success: "text-success-600",
        warning: "text-warning-600",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  warning?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    variant,
    size,
    state,
    label,
    helperText,
    error,
    success,
    warning,
    startIcon,
    endIcon,
    className,
    containerClassName,
    disabled,
    ...props
  }, ref) => {
    // Determine the state based on props
    const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : state || 'default';
    const currentHelperText = error || success || warning || helperText;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label className={labelVariants({ size, state: currentState })}>
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              inputVariants({ variant, size, state: currentState }),
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            disabled={disabled}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>

        {currentHelperText && (
          <p className={helperTextVariants({ state: currentState })}>
            {currentHelperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';