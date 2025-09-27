import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "../utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium leading-none transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-95",
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-500 text-white shadow-md hover:shadow-lg hover:bg-primary-600",
          "disabled:bg-neu-300 disabled:text-neu-500 disabled:cursor-not-allowed disabled:shadow-none"
        ],
        secondary: [
          "bg-secondary-500 text-white shadow-md hover:shadow-lg hover:bg-secondary-600",
          "disabled:bg-neu-300 disabled:text-neu-500 disabled:cursor-not-allowed disabled:shadow-none"
        ],
        outline: [
          "bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50",
          "disabled:bg-transparent disabled:border-neu-300 disabled:text-neu-400 disabled:cursor-not-allowed"
        ],
        ghost: [
          "bg-transparent text-primary-600 hover:bg-primary-50",
          "disabled:bg-transparent disabled:text-neu-400 disabled:cursor-not-allowed"
        ],
        neumorphic: [
          "neu-raised text-neu-700 hover:shadow-neu-lg hover:text-primary-600",
          "active:neu-pressed",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-neu disabled:hover:text-neu-700"
        ],
      },
      size: {
        sm: "px-3 py-2 text-sm h-8 rounded-lg",
        md: "px-4 py-2.5 text-base h-10 rounded-xl",
        lg: "px-6 py-3 text-lg h-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "neumorphic",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
