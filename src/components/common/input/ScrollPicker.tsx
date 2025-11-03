"use client";

import { useEffect, useRef } from "react";

export interface ScrollPickerOption {
  value: number | string;
  label: string;
}

interface ScrollPickerProps {
  /** 선택 가능한 옵션 목록 */
  options: ScrollPickerOption[];
  /** 현재 선택된 값 */
  value: number | string;
  /** 값 변경 핸들러 */
  onChange: (value: number | string) => void;
  /** 높이 (기본값: 128px = h-32) */
  height?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 자동 스크롤 활성화 (모달 열릴 때 등) */
  autoScroll?: boolean;
  /** 포맷 함수 - 값을 표시할 때 사용 (예: value => `${value}월`) */
  formatLabel?: (option: ScrollPickerOption) => string;
}

/**
 * 스크롤 가능한 피커 컴포넌트
 *
 * iOS 스타일의 스크롤 선택기로, 시간/날짜/일반 텍스트 등 다양한 용도로 사용 가능
 *
 * @example
 * // 월 선택
 * <ScrollPicker
 *   options={Array.from({ length: 12 }, (_, i) => ({
 *     value: i + 1,
 *     label: `${i + 1}월`
 *   }))}
 *   value={selectedMonth}
 *   onChange={setSelectedMonth}
 * />
 *
 * @example
 * // 시간 선택
 * <ScrollPicker
 *   options={Array.from({ length: 24 }, (_, i) => ({
 *     value: i,
 *     label: `${i}시`
 *   }))}
 *   value={selectedHour}
 *   onChange={setSelectedHour}
 * />
 *
 * @example
 * // 텍스트 선택
 * <ScrollPicker
 *   options={[
 *     { value: 'morning', label: '오전' },
 *     { value: 'afternoon', label: '오후' },
 *     { value: 'evening', label: '저녁' }
 *   ]}
 *   value={selectedPeriod}
 *   onChange={setSelectedPeriod}
 * />
 */
export default function ScrollPicker({
  options,
  value,
  onChange,
  height = "h-32",
  disabled = false,
  autoScroll = true,
  formatLabel,
}: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to selected value when component mounts or value changes
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      if (selectedIndex !== -1) {
        setTimeout(() => {
          if (containerRef.current) {
            const element = containerRef.current.children[0].children[
              selectedIndex
            ] as HTMLElement;
            if (element) {
              element.scrollIntoView({ block: "center", behavior: "smooth" });
            }
          }
        }, 100);
      }
    }
  }, [autoScroll, value, options]);

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll with debounce to find closest centered item
  const handleScroll = () => {
    if (!containerRef.current || disabled) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      const children = container.children[0].children;
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childRect = child.getBoundingClientRect();
        const childCenter = childRect.top + childRect.height / 2;
        const distance = Math.abs(containerCenter - childCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      onChange(options[closestIndex].value);
    }, 150);
  };

  const getDisplayLabel = (option: ScrollPickerOption) => {
    if (formatLabel) {
      return formatLabel(option);
    }
    return option.label;
  };

  return (
    <div
      className={`relative ${height} overflow-hidden border border-gray-300 rounded-lg bg-white ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative"
      >
        <div className="py-10">
          {options.map((option) => (
            <div
              key={String(option.value)}
              onClick={() => !disabled && onChange(option.value)}
              className={`h-10 flex items-center justify-center cursor-pointer snap-center transition-all ${
                value === option.value
                  ? "font-bold text-gray-900"
                  : "text-gray-300 font-normal"
              }`}
            >
              {getDisplayLabel(option)}
            </div>
          ))}
        </div>
      </div>
      {/* Selection indicator */}
      <div className="absolute inset-x-0 pointer-events-none top-1/2 -translate-y-1/2">
        <div className="h-10 border-y-2 border-primary-300/40"></div>
      </div>
    </div>
  );
}
