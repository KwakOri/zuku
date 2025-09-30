import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const cardVariants = cva(
  // Base styles
  "rounded-lg transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        flat: "bg-white",
        elevated: "bg-gray-50",
        surface: "bg-gray-100",
        primary: "bg-primary-50",
        secondary: "bg-secondary-50",
        outlined: "bg-transparent border border-gray-300",
        bordered: "bg-white border border-gray-200 hover:border-gray-300",
        borderless: "bg-white hover:bg-gray-50",
        subtle: "bg-gray-50 hover:bg-gray-100",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "flat",
      size: "md",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant,
  size,
  interactive,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(cardVariants({ variant, size, interactive }), className)}
      {...props}
    >
      {children}
    </div>
  );
};