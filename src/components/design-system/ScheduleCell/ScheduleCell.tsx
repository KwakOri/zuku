import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '../Badge';
import { cn } from '../utils';

const scheduleCellVariants = cva(
  // Base styles
  "p-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "neu-raised hover:shadow-neu-lg",
        flat: "bg-white border border-neu-300 hover:border-neu-400 shadow-sm hover:shadow-md",
        outline: "border-2 border-dashed border-neu-300 hover:border-primary-400 bg-transparent",
      },
      state: {
        default: "",
        selected: "ring-2 ring-primary-500 ring-offset-2",
        disabled: "opacity-50 cursor-not-allowed",
        booked: "bg-primary-50 border-primary-200",
        conflict: "bg-error-50 border-error-200",
      },
      size: {
        sm: "p-2 text-sm",
        md: "p-3 text-base",
        lg: "p-4 text-lg",
      },
    },
    compoundVariants: [
      {
        state: "disabled",
        class: "hover:shadow-neu hover:border-neu-300",
      },
    ],
    defaultVariants: {
      variant: "default",
      state: "default",
      size: "md",
    },
  }
);

export interface ClassInfo {
  id: string;
  title: string;
  subject?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  room?: string;
  color?: string;
  maxStudents?: number;
  currentStudents?: number;
}

export interface ScheduleCellProps extends VariantProps<typeof scheduleCellVariants> {
  /** Class information to display */
  classInfo?: ClassInfo;
  /** Whether the cell is booked/occupied */
  isBooked?: boolean;
  /** Whether the cell is selectable */
  isSelectable?: boolean;
  /** Whether the cell is currently selected */
  isSelected?: boolean;
  /** Whether there's a scheduling conflict */
  hasConflict?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Double click handler */
  onDoubleClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Time slot information for empty cells */
  timeSlot?: {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  };
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({
  classInfo,
  isBooked = false,
  isSelectable = true,
  isSelected = false,
  hasConflict = false,
  onClick,
  onDoubleClick,
  className,
  timeSlot,
  variant = "default",
  state,
  size = "md",
}) => {
  // Determine the cell state
  const cellState =
    !isSelectable ? 'disabled' :
    isSelected ? 'selected' :
    hasConflict ? 'conflict' :
    isBooked ? 'booked' :
    state || 'default';

  const handleClick = () => {
    if (!isSelectable) return;
    onClick?.();
  };

  const handleDoubleClick = () => {
    if (!isSelectable) return;
    onDoubleClick?.();
  };

  // Empty cell
  if (!classInfo) {
    return (
      <div
        className={cn(
          scheduleCellVariants({ variant: "outline", state: cellState, size }),
          "min-h-[80px] flex items-center justify-center text-neu-500",
          className
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {timeSlot && (
          <div className="text-center">
            <div className="text-xs">
              {timeSlot.startTime} - {timeSlot.endTime}
            </div>
            <div className="text-xs mt-1 opacity-75">
              Click to add class
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        scheduleCellVariants({ variant, state: cellState, size }),
        "min-h-[80px]",
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundColor: classInfo.color ? `${classInfo.color}20` : undefined,
        borderColor: classInfo.color ? `${classInfo.color}40` : undefined,
      }}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-neu-800 leading-tight flex-1">
            {classInfo.title}
          </h4>
          {classInfo.maxStudents && (
            <Badge
              variant="outline"
              count={classInfo.currentStudents || 0}
              className="text-xs"
            />
          )}
        </div>

        {classInfo.subject && (
          <p className="text-sm text-neu-600">{classInfo.subject}</p>
        )}

        <div className="flex items-center justify-between text-xs text-neu-500">
          <span>{classInfo.startTime} - {classInfo.endTime}</span>
          {classInfo.room && <span>{classInfo.room}</span>}
        </div>

        {classInfo.teacherName && (
          <p className="text-xs text-neu-500">{classInfo.teacherName}</p>
        )}

        {classInfo.maxStudents && (
          <div className="text-xs text-neu-500">
            {classInfo.currentStudents || 0} / {classInfo.maxStudents} students
          </div>
        )}
      </div>
    </div>
  );
};