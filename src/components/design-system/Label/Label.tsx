import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const labelVariants = cva(
  // Base styles
  "block font-medium transition-colors duration-200 ease-in-out",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
      state: {
        default: "text-neu-700",
        error: "text-error-600",
        success: "text-success-600",
        warning: "text-warning-600",
      },
      required: {
        true: "after:content-['*'] after:ml-1 after:text-error-500",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
      required: false,
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  /** Label text content */
  children: React.ReactNode;
  /** HTML for attribute to associate with an input */
  htmlFor?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  size,
  state,
  required,
  className,
  children,
  htmlFor,
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(labelVariants({ size, state, required }), className)}
      {...props}
    >
      {children}
    </label>
  );
};