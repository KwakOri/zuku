"use client";

import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import React, { useEffect, useRef, useState } from "react";
import "./Tooltip.css";

const tooltipVariants = cva("animate-tooltip-fade-in pointer-events-auto", {
  variants: {
    position: {
      top: "",
      bottom: "",
      left: "",
      right: "",
    },
  },
  defaultVariants: {
    position: "top",
  },
});

const arrowVariants = cva("absolute w-0 h-0", {
  variants: {
    position: {
      top: "tooltip-arrow-bottom top-full left-1/2 transform -translate-x-1/2",
      bottom:
        "tooltip-arrow-top bottom-full left-1/2 transform -translate-x-1/2",
      left: "tooltip-arrow-right left-full top-1/2 transform -translate-y-1/2",
      right: "tooltip-arrow-left right-full top-1/2 transform -translate-y-1/2",
    },
  },
  defaultVariants: {
    position: "top",
  },
});

interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const TooltipArrow = ({
  position,
}: {
  position: "top" | "bottom" | "left" | "right";
}) => {
  return <div className={cn(arrowVariants({ position }))} />;
};

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dynamicPosition, setDynamicPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 동적 위치 계산 함수
  const calculateOptimalPosition = () => {
    if (!triggerRef.current) return position;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 트리거 요소의 중심점
    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;

    // 뷰포트를 9분면으로 나누기
    const colSection =
      centerX < viewportWidth / 3
        ? 1
        : centerX < (viewportWidth * 2) / 3
        ? 2
        : 3;
    const rowSection =
      centerY < viewportHeight / 3
        ? 1
        : centerY < (viewportHeight * 2) / 3
        ? 2
        : 3;

    const section = (rowSection - 1) * 3 + colSection;

    // 분면에 따른 최적 위치 매핑
    const sectionToPosition: Record<
      number,
      "top" | "bottom" | "left" | "right"
    > = {
      1: "bottom", // 왼쪽 위 → 아래로
      2: "bottom", // 위쪽 중앙 → 아래로
      3: "bottom", // 오른쪽 위 → 아래로
      4: "right", // 왼쪽 중앙 → 오른쪽으로
      5: "top", // 가운데 → 위로 (기본값)
      6: "left", // 오른쪽 중앙 → 왼쪽으로
      7: "top", // 왼쪽 아래 → 위로
      8: "top", // 아래쪽 중앙 → 위로
      9: "top", // 오른쪽 아래 → 위로
    };

    return sectionToPosition[section] || position;
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const optimalPosition = calculateOptimalPosition();
      setDynamicPosition(optimalPosition);
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses =
      "absolute z-50 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm leading-relaxed max-w-[280px] shadow-2xl border-2 border-gray-600 w-[200px]";

    switch (dynamicPosition) {
      case "top":
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case "bottom":
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case "left":
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case "right":
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  return (
    <div className="relative inline-block w-full h-full">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="w-full h-full "
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            getTooltipClasses(),
            "animate-tooltip-fade-in pointer-events-none"
          )}
        >
          {content}
          <TooltipArrow position={dynamicPosition} />
        </div>
      )}
    </div>
  );
}
