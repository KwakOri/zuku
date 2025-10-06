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

    // 툴팁 예상 크기 (px)
    const tooltipWidth = 280; // max-w-[280px]
    const tooltipHeight = 80; // 대략적인 높이
    const margin = 16; // 여백

    // 각 방향에 대한 공간 체크
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // 우선순위: bottom -> top -> right -> left
    if (spaceBottom >= tooltipHeight + margin) {
      // 하단에 충분한 공간 체크 (좌우 경계도 고려)
      const centerX = triggerRect.left + triggerRect.width / 2;
      if (centerX - tooltipWidth / 2 >= margin && centerX + tooltipWidth / 2 <= viewportWidth - margin) {
        return "bottom";
      }
    }

    if (spaceTop >= tooltipHeight + margin) {
      // 상단에 충분한 공간 체크 (좌우 경계도 고려)
      const centerX = triggerRect.left + triggerRect.width / 2;
      if (centerX - tooltipWidth / 2 >= margin && centerX + tooltipWidth / 2 <= viewportWidth - margin) {
        return "top";
      }
    }

    if (spaceRight >= tooltipWidth + margin) {
      // 우측에 충분한 공간 체크 (상하 경계도 고려)
      const centerY = triggerRect.top + triggerRect.height / 2;
      if (centerY - tooltipHeight / 2 >= margin && centerY + tooltipHeight / 2 <= viewportHeight - margin) {
        return "right";
      }
    }

    if (spaceLeft >= tooltipWidth + margin) {
      // 좌측에 충분한 공간 체크 (상하 경계도 고려)
      const centerY = triggerRect.top + triggerRect.height / 2;
      if (centerY - tooltipHeight / 2 >= margin && centerY + tooltipHeight / 2 <= viewportHeight - margin) {
        return "left";
      }
    }

    // 모든 방향에 충분한 공간이 없으면 가장 넓은 공간이 있는 방향 선택
    const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
    if (maxSpace === spaceBottom) return "bottom";
    if (maxSpace === spaceTop) return "top";
    if (maxSpace === spaceRight) return "right";
    return "left";
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

  const getTooltipStyle = () => {
    if (!triggerRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const tooltipWidth = 200;
    const tooltipHeight = 80; // 대략적인 높이
    const margin = 16;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      backgroundColor: '#111827', // gray-900
      color: 'white',
      border: '2px solid #4b5563', // gray-600
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      maxWidth: '280px',
      width: '200px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl
      pointerEvents: 'none',
    };

    switch (dynamicPosition) {
      case "top":
        style.top = triggerRect.top - tooltipHeight - 8;
        style.left = Math.max(margin, Math.min(
          triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
          viewportWidth - tooltipWidth - margin
        ));
        break;
      case "bottom":
        style.top = triggerRect.bottom + 8;
        style.left = Math.max(margin, Math.min(
          triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
          viewportWidth - tooltipWidth - margin
        ));
        break;
      case "left":
        style.top = Math.max(margin, Math.min(
          triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
          viewportHeight - tooltipHeight - margin
        ));
        style.left = triggerRect.left - tooltipWidth - 8;
        break;
      case "right":
        style.top = Math.max(margin, Math.min(
          triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
          viewportHeight - tooltipHeight - margin
        ));
        style.left = triggerRect.right + 8;
        break;
      default:
        style.top = triggerRect.top - tooltipHeight - 8;
        style.left = Math.max(margin, Math.min(
          triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
          viewportWidth - tooltipWidth - margin
        ));
    }

    return style;
  };

  return (
    <>
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
          className="animate-tooltip-fade-in"
          style={getTooltipStyle()}
        >
          {content}
          <TooltipArrow position={dynamicPosition} />
        </div>
      )}
    </>
  );
}
