import React, { useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../utils';

const modalVariants = cva(
  // Base styles
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      animation: {
        fade: "animate-in fade-in-0",
        scale: "animate-in fade-in-0 zoom-in-95",
        slide: "animate-in slide-in-from-bottom-4 fade-in-0",
      },
    },
    defaultVariants: {
      animation: "scale",
    },
  }
);

const overlayVariants = cva(
  "fixed inset-0 bg-black/50 backdrop-blur-sm"
);

const panelVariants = cva(
  // Base styles
  "relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col",
  {
    variants: {
      size: {
        sm: "w-full max-w-md",
        md: "w-full max-w-lg",
        lg: "w-full max-w-2xl",
        xl: "w-full max-w-4xl",
        full: "w-full max-w-7xl h-full max-h-[95vh]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (usually buttons) */
  footerContent?: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Additional CSS class for the modal panel */
  className?: string;
  /** Additional CSS class for the modal content */
  contentClassName?: string;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Animation type */
  animation?: 'fade' | 'scale' | 'slide';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  headerContent,
  animation = "scale",
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className={modalVariants({ animation })}>
      {/* Overlay */}
      <div
        className={overlayVariants()}
        onClick={handleOverlayClick}
      />

      {/* Modal Panel */}
      <div className={cn(panelVariants({ size }), className)}>
        {/* Header */}
        {(title || headerContent || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neu-200">
            <div className="flex-1">
              {headerContent || (
                title && (
                  <h2 className="text-xl font-semibold text-neu-800">
                    {title}
                  </h2>
                )
              )}
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 p-2 h-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6",
          (!title && !headerContent && !showCloseButton) && "pt-6",
          contentClassName
        )}>
          {children}
        </div>

        {/* Footer */}
        {footerContent && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neu-200 bg-neu-50">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};