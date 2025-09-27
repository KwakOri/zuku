import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const tooltipVariants = cva(
  // Base styles
  "absolute z-50 px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out rounded-lg pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-neu-800 shadow-lg",
        dark: "bg-gray-900 shadow-lg",
        light: "bg-white text-neu-800 shadow-neu border border-neu-300",
      },
      position: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-neu-800",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2 before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-neu-800",
        left: "right-full top-1/2 -translate-y-1/2 mr-2 before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-neu-800",
        right: "left-full top-1/2 -translate-y-1/2 ml-2 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-neu-800",
      },
    },
    compoundVariants: [
      {
        variant: "light",
        position: "top",
        class: "before:border-t-white",
      },
      {
        variant: "light",
        position: "bottom",
        class: "before:border-b-white",
      },
      {
        variant: "light",
        position: "left",
        class: "before:border-l-white",
      },
      {
        variant: "light",
        position: "right",
        class: "before:border-r-white",
      },
    ],
    defaultVariants: {
      variant: "default",
      position: "top",
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  /** Content to display in the tooltip */
  content: string | React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip position relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Tooltip variant */
  variant?: 'default' | 'dark' | 'light';
  /** Additional CSS class for tooltip */
  className?: string;
  /** Delay in milliseconds before showing tooltip */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  variant = 'default',
  className,
  delay = 500,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && !disabled && (
        <div
          className={cn(
            tooltipVariants({ variant, position }),
            "opacity-100 scale-100",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};