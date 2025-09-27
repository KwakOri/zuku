import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const badgeVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-semibold text-white rounded-full transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 shadow-md",
        secondary: "bg-secondary-500 shadow-md",
        success: "bg-success-500 shadow-md",
        warning: "bg-warning-500 shadow-md",
        error: "bg-error-500 shadow-md",
        neumorphic: "neu-raised-sm text-neu-700",
        outline: "bg-transparent border border-primary-500 text-primary-500",
      },
      size: {
        sm: "min-w-[1rem] h-4 px-1 text-xs",
        md: "min-w-[1.25rem] h-5 px-1.5 text-xs",
        lg: "min-w-[1.5rem] h-6 px-2 text-sm",
      },
      position: {
        static: "relative",
        "top-right": "absolute -top-1 -right-1 transform",
        "top-left": "absolute -top-1 -left-1 transform",
        "bottom-right": "absolute -bottom-1 -right-1 transform",
        "bottom-left": "absolute -bottom-1 -left-1 transform",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      position: "static",
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'size'>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size,
  position,
  count,
  max = 99,
  showZero = false,
  dot = false,
  className,
  children,
  ...props
}) => {
  const hasCount = typeof count === 'number';
  const displayCount = hasCount && count > max ? `${max}+` : count;
  const shouldShow = dot || (hasCount && (showZero || count > 0));

  if (!shouldShow && !children) {
    return null;
  }

  return (
    <span
      className={cn(
        badgeVariants({ variant, size, position }),
        dot && "w-2 h-2 min-w-0 p-0",
        className
      )}
      {...props}
    >
      {dot ? null : children || displayCount}
    </span>
  );
};