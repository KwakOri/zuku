import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const progressVariants = cva(
  // Base styles - Container
  "relative overflow-hidden transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "flat-surface bg-neu-200",
        outline: "border border-neu-400 bg-transparent",
        filled: "bg-gray-300",
      },
      size: {
        sm: "h-2 rounded-full",
        md: "h-3 rounded-full",
        lg: "h-4 rounded-lg",
        xl: "h-6 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const progressBarVariants = cva(
  // Base styles - Progress bar
  "h-full transition-all duration-500 ease-out",
  {
    variants: {
      color: {
        primary: "bg-primary-500 shadow-sm",
        secondary: "bg-secondary-500 shadow-sm",
        success: "bg-success-500 shadow-sm",
        warning: "bg-warning-500 shadow-sm",
        error: "bg-error-500 shadow-sm",
        neumorphic: "flat-card-sm bg-neu-100",
      },
      size: {
        sm: "rounded-full",
        md: "rounded-full",
        lg: "rounded-md",
        xl: "rounded-md",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
    },
  }
);

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size' | 'color'>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  color?: VariantProps<typeof progressBarVariants>['color'];
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  variant,
  size,
  color = 'primary',
  value = 0,
  max = 100,
  showLabel = false,
  label,
  className,
  animated = false,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {typeof label === 'string' ? label : 'Progress'}
          </span>
          <span className="text-sm text-gray-600">
            {displayLabel}
          </span>
        </div>
      )}

      <div
        className={cn(progressVariants({ variant, size }), className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={cn(
            progressBarVariants({ color, size }),
            animated && "animate-pulse"
          )}
          style={{
            width: `${percentage}%`,
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
};