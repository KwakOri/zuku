import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../utils';

const chipVariants = cva(
  // Base styles
  "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 ease-in-out border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "flat-card-sm text-gray-700 hover:shadow-neu",
        primary: "bg-primary-500 text-white shadow-md hover:shadow-lg hover:bg-primary-600",
        secondary: "bg-secondary-500 text-white shadow-md hover:shadow-lg hover:bg-secondary-600",
        success: "bg-success-500 text-white shadow-md hover:shadow-lg hover:bg-success-600",
        warning: "bg-warning-500 text-white shadow-md hover:shadow-lg hover:bg-warning-600",
        error: "bg-error-500 text-white shadow-md hover:shadow-lg hover:bg-error-600",
        outline: "bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50",
        neumorphic: "flat-card-sm text-gray-700 hover:shadow-neu",
      },
      size: {
        sm: "px-2.5 py-1 text-xs h-6",
        md: "px-3 py-1.5 text-sm h-8",
        lg: "px-4 py-2 text-base h-10",
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95",
        false: "cursor-default",
      },
      deletable: {
        true: "pr-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
      deletable: false,
    },
  }
);

const deleteButtonVariants = cva(
  "flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current",
  {
    variants: {
      size: {
        sm: "w-4 h-4 ml-1",
        md: "w-5 h-5 ml-1.5",
        lg: "w-6 h-6 ml-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface ChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof chipVariants> {
  children: React.ReactNode;
  className?: string;
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  as?: 'button' | 'div' | 'span';
}


export const Chip: React.FC<ChipProps> = ({
  variant,
  size,
  interactive,
  deletable,
  className,
  children,
  onDelete,
  deleteIcon,
  startIcon,
  as = 'button',
  disabled,
  ...props
}) => {
  const Component = as as React.ElementType;
  const isClickable = interactive || !!props.onClick;

  const chipClasses = cn(
    chipVariants({
      variant,
      size,
      interactive: isClickable,
      deletable: deletable || !!onDelete
    }),
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <Component
      className={chipClasses}
      disabled={disabled}
      {...(as === 'button' ? props : {})}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      <span>{children}</span>
      {(deletable || onDelete) && (
        <button
          type="button"
          className={cn(deleteButtonVariants({ size }), "text-current")}
          onClick={handleDelete}
          disabled={disabled}
          aria-label="Remove"
        >
          {deleteIcon || <X className="w-full h-full" />}
        </button>
      )}
    </Component>
  );
};