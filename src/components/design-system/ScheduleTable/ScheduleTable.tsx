import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ScheduleCell, type ClassInfo } from '../ScheduleCell';
import { cn } from '../utils';

const scheduleTableVariants = cva(
  // Base styles
  "w-full overflow-hidden rounded-xl",
  {
    variants: {
      variant: {
        default: "flat-card shadow-neu-lg",
        flat: "bg-white border border-gray-300 shadow-lg",
        minimal: "bg-transparent",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const headerVariants = cva(
  "sticky top-0 z-10 bg-neu-100 border-b border-gray-300",
  {
    variants: {
      size: {
        sm: "p-2 text-sm",
        md: "p-3 text-base",
        lg: "p-4 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  timeSlot: string; // "09:00-10:00"
  classInfo?: ClassInfo;
}

export interface Cell {
  dayOfWeek: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  classInfo?: ClassInfo;
}

export interface ScheduleTableProps extends VariantProps<typeof scheduleTableVariants> {
  /** Schedule data to display */
  scheduleData: Schedule[];
  /** Cell click handler */
  onCellClick?: (cellInfo: Cell) => void;
  /** Cell double click handler */
  onCellDoubleClick?: (cellInfo: Cell) => void;
  /** Whether the schedule is editable */
  isEditable?: boolean;
  /** View mode for the schedule */
  viewMode?: 'weekly' | 'daily';
  /** Selected day for daily view (0-6) */
  selectedDay?: number;
  /** Time slots to display */
  timeSlots?: string[];
  /** Days of week labels */
  dayLabels?: string[];
  /** Additional CSS class */
  className?: string;
  /** Whether to show weekend columns */
  showWeekend?: boolean;
  /** Start hour for time slots */
  startHour?: number;
  /** End hour for time slots */
  endHour?: number;
  /** Time slot duration in minutes */
  slotDuration?: number;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  scheduleData,
  onCellClick,
  onCellDoubleClick,
  isEditable = false,
  viewMode = 'weekly',
  selectedDay = 1, // Monday
  timeSlots: customTimeSlots,
  dayLabels: customDayLabels,
  className,
  showWeekend = true,
  startHour = 9,
  endHour = 22,
  slotDuration = 60,
  variant = "default",
  size = "md",
}) => {
  // Default day labels
  const defaultDayLabels = showWeekend
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const dayLabels = customDayLabels || defaultDayLabels;

  // Generate time slots
  const timeSlots = customTimeSlots || (() => {
    const slots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + slotDuration;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;

        if (endHour <= endHour) {
          slots.push(`${startTime}-${endTime}`);
        }
      }
    }
    return slots;
  })();

  // Get days to display based on view mode
  const daysToShow = viewMode === 'daily'
    ? [selectedDay]
    : showWeekend
      ? [0, 1, 2, 3, 4, 5, 6]
      : [1, 2, 3, 4, 5];

  // Create a map for quick lookup of schedule data
  const scheduleMap = new Map<string, ClassInfo>();
  scheduleData.forEach(schedule => {
    if (schedule.classInfo) {
      const key = `${schedule.dayOfWeek}-${schedule.timeSlot}`;
      scheduleMap.set(key, schedule.classInfo);
    }
  });

  // Handle cell click
  const handleCellClick = (dayOfWeek: number, timeSlot: string) => {
    if (!onCellClick) return;

    const [startTime, endTime] = timeSlot.split('-');
    const classInfo = scheduleMap.get(`${dayOfWeek}-${timeSlot}`);

    onCellClick({
      dayOfWeek,
      timeSlot,
      startTime,
      endTime,
      classInfo,
    });
  };

  // Handle cell double click
  const handleCellDoubleClick = (dayOfWeek: number, timeSlot: string) => {
    if (!onCellDoubleClick) return;

    const [startTime, endTime] = timeSlot.split('-');
    const classInfo = scheduleMap.get(`${dayOfWeek}-${timeSlot}`);

    onCellDoubleClick({
      dayOfWeek,
      timeSlot,
      startTime,
      endTime,
      classInfo,
    });
  };

  return (
    <div className={cn(scheduleTableVariants({ variant, size }), className)}>
      {/* Header */}
      <div className="grid" style={{
        gridTemplateColumns: `80px repeat(${daysToShow.length}, 1fr)`
      }}>
        {/* Time column header */}
        <div className={headerVariants({ size })}>
          <div className="font-semibold text-gray-700">Time</div>
        </div>

        {/* Day headers */}
        {daysToShow.map(dayIndex => (
          <div key={dayIndex} className={headerVariants({ size })}>
            <div className="font-semibold text-gray-700 text-center">
              {dayLabels[showWeekend ? dayIndex : dayIndex - 1]}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[600px]">
        {timeSlots.map(timeSlot => (
          <div
            key={timeSlot}
            className="grid border-b border-neu-200 last:border-b-0"
            style={{
              gridTemplateColumns: `80px repeat(${daysToShow.length}, 1fr)`
            }}
          >
            {/* Time label */}
            <div className="p-3 bg-gray-50 border-r border-neu-200 flex items-center justify-center">
              <div className="text-sm font-medium text-gray-600">
                {timeSlot.split('-')[0]}
              </div>
            </div>

            {/* Schedule cells */}
            {daysToShow.map(dayIndex => {
              const classInfo = scheduleMap.get(`${dayIndex}-${timeSlot}`);
              const [startTime, endTime] = timeSlot.split('-');

              return (
                <div key={dayIndex} className="border-r border-neu-200 last:border-r-0">
                  <ScheduleCell
                    classInfo={classInfo}
                    isBooked={!!classInfo}
                    isSelectable={isEditable}
                    timeSlot={{
                      startTime,
                      endTime,
                      dayOfWeek: dayIndex,
                    }}
                    onClick={() => handleCellClick(dayIndex, timeSlot)}
                    onDoubleClick={() => handleCellDoubleClick(dayIndex, timeSlot)}
                    variant="flat"
                    size="sm"
                    className="rounded-none border-0 h-20"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};