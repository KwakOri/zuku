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
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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

    switch (position) {
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
        className="w-full h-full"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            getTooltipClasses(),
            "animate-tooltip-fade-in pointer-events-auto"
          )}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {content}
          <TooltipArrow position={position} />
        </div>
      )}
    </div>
  );
}
