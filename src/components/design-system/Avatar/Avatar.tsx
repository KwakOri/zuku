import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const avatarVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-semibold text-white overflow-hidden transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        neumorphic: "neu-raised hover:shadow-neu-lg",
        flat: "bg-primary-500",
        outline: "border-2 border-primary-500 bg-transparent text-primary-500",
      },
      size: {
        xs: "w-6 h-6 text-xs rounded-full",
        sm: "w-8 h-8 text-sm rounded-full",
        md: "w-10 h-10 text-base rounded-full",
        lg: "w-12 h-12 text-lg rounded-xl",
        xl: "w-16 h-16 text-xl rounded-xl",
        "2xl": "w-20 h-20 text-2xl rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "neumorphic",
      size: "md",
    },
  }
);

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  variant,
  size,
  src,
  alt,
  fallback,
  className,
  children,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const displayFallback = fallback || (typeof children === 'string' ? children.slice(0, 2).toUpperCase() : 'U');

  return (
    <div
      className={cn(avatarVariants({ variant, size }), className)}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className={cn(
          variant === 'neumorphic' && 'text-neu-700',
          variant === 'outline' && 'text-primary-500',
          variant === 'flat' && 'text-white'
        )}>
          {children || displayFallback}
        </span>
      )}
    </div>
  );
};