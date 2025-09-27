import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const cardVariants = cva(
  // Base styles
  "rounded-xl transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        raised: "neu-raised hover:shadow-neu-lg",
        flat: "bg-neu-100 border border-neu-300",
        outlined: "bg-transparent border border-neu-400",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98] active:neu-pressed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "raised",
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