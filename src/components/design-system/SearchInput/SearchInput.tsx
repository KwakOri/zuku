import React, { useState, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from '../Input';
import { Button } from '../Button';
import { cn } from '../utils';

const searchInputVariants = cva(
  // Base styles
  "relative",
  {
    variants: {
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SearchInputProps
  extends Omit<InputProps, 'startIcon' | 'endIcon' | 'type'>,
    VariantProps<typeof searchInputVariants> {
  /** Search handler function */
  onSearch?: (query: string) => void;
  /** Clear handler function */
  onClear?: () => void;
  /** Whether to show the clear button */
  showClearButton?: boolean;
  /** Search placeholder text */
  placeholder?: string;
  /** Additional CSS class for the container */
  containerClassName?: string;
  /** Delay in milliseconds before triggering onSearch */
  searchDelay?: number;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    onSearch,
    onClear,
    showClearButton = true,
    placeholder = "Search...",
    containerClassName,
    searchDelay = 300,
    size,
    value: controlledValue,
    onChange,
    className,
    ...inputProps
  }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = typeof value === 'string' && value.length > 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Update internal state if not controlled
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      // Call external onChange if provided
      if (onChange) {
        onChange(e);
      }

      // Handle search with delay
      if (onSearch) {
        // Clear existing timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
          onSearch(newValue);
        }, searchDelay);

        setSearchTimeout(timeoutId);
      }
    };

    const handleClear = () => {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Update internal state if not controlled
      if (controlledValue === undefined) {
        setInternalValue('');
      }

      // Call external onChange if provided
      if (onChange) {
        onChange(event);
      }

      // Call onClear handler
      if (onClear) {
        onClear();
      }

      // Trigger search with empty value
      if (onSearch) {
        onSearch('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        // Clear timeout and search immediately
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        onSearch(typeof value === 'string' ? value : '');
      }

      // Call external onKeyDown if provided
      if (inputProps.onKeyDown) {
        inputProps.onKeyDown(e);
      }
    };

    return (
      <div className={cn(searchInputVariants({ size }), containerClassName)}>
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          startIcon={<Search className="w-4 h-4" />}
          endIcon={
            hasValue && showClearButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="p-0 h-auto min-h-0 w-4 h-4"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </Button>
            ) : undefined
          }
          className={className}
          {...inputProps}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';