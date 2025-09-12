"use client";

import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
      top: "tooltip-arrow-top",
      bottom: "tooltip-arrow-bottom",
      left: "tooltip-arrow-left",
      right: "tooltip-arrow-right",
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
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updateTooltipPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If tooltip hasn't been measured yet (first render), use estimated dimensions
    const tooltipWidth = tooltipRect.width || 280; // fallback width
    const tooltipHeight = tooltipRect.height || 80; // fallback height

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipHeight - 8;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2;
        left = triggerRect.left - tooltipWidth - 8;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Keep tooltip within viewport bounds
    if (left < 8) left = 8;
    if (left + tooltipWidth > viewportWidth - 8) {
      left = viewportWidth - tooltipWidth - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipHeight > viewportHeight - 8) {
      top = viewportHeight - tooltipHeight - 8;
    }

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      // Re-position after DOM has had time to render and measure the tooltip
      const timeoutId = setTimeout(updateTooltipPosition, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        updateTooltipPosition();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

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

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            style={tooltipStyle}
            className={cn(tooltipVariants({ position }))}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
          >
            <div className="bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm leading-relaxed max-w-[280px] shadow-2xl backdrop-blur-sm border border-white border-opacity-10">
              {content}
            </div>
            <TooltipArrow position={position} />
          </div>,
          document.body
        )}
    </div>
  );
}
