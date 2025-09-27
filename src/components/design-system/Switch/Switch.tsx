import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const switchVariants = cva(
  // Base styles - Track
  "relative inline-flex items-center cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: [
          "bg-neu-300 neu-inset",
          "data-[checked=true]:bg-primary-500 data-[checked=true]:shadow-md"
        ],
        outline: [
          "border-2 border-neu-400 bg-transparent",
          "data-[checked=true]:border-primary-500 data-[checked=true]:bg-primary-500"
        ],
      },
      size: {
        sm: "w-9 h-5 rounded-full",
        md: "w-11 h-6 rounded-full",
        lg: "w-14 h-7 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const thumbVariants = cva(
  // Base styles - Thumb
  "absolute bg-white transition-all duration-200 ease-in-out neu-raised-sm",
  {
    variants: {
      size: {
        sm: "w-3 h-3 rounded-full top-1 left-1 data-[checked=true]:translate-x-4",
        md: "w-4 h-4 rounded-full top-1 left-1 data-[checked=true]:translate-x-5",
        lg: "w-5 h-5 rounded-full top-1 left-1 data-[checked=true]:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof switchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  variant,
  size,
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  className,
  disabled,
  ...props
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const checkedState = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;

    const newChecked = !checkedState;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  };

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checkedState}
      data-checked={checkedState}
      className={cn(switchVariants({ variant, size }), className)}
      onClick={handleToggle}
      disabled={disabled}
      {...props}
    >
      <span
        data-checked={checkedState}
        className={thumbVariants({ size })}
        aria-hidden="true"
      />
    </button>
  );

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <label
              className={cn(
                "text-sm font-medium cursor-pointer",
                disabled ? "text-neu-400" : "text-neu-700"
              )}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-xs mt-0.5",
              disabled ? "text-neu-400" : "text-neu-500"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
};