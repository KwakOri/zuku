"use client";

import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const pageLayoutVariants = cva("absolute inset-0", {
  variants: {
    background: {
      default: "bg-gray-50",
      white: "bg-white",
      transparent: "bg-transparent",
    },
  },
  defaultVariants: {
    background: "default",
  },
});

const mainVariants = cva("h-screen flex flex-col", {
  variants: {
    hasHeader: {
      true: "pt-16",
      false: "",
    },
  },
  defaultVariants: {
    hasHeader: true,
  },
});

const insetContainerVariants = cva(
  "w-full flex-1 min-h-0 px-4 sm:px-6 lg:px-8 flex flex-col overflow-y-auto",
  {
    variants: {
      maxWidth: {
        default: "mx-auto max-w-7xl",
        inset: "",
        full: "max-w-full",
        "2xl": "mx-auto max-w-2xl",
        "4xl": "mx-auto max-w-4xl",
        "5xl": "mx-auto max-w-5xl",
        "6xl": "mx-auto max-w-6xl",
        screen: "mx-auto max-w-screen-2xl",
      },
    },
    defaultVariants: {
      maxWidth: "default",
    },
  }
);

const spacerVariants = cva("h-8 shrink-0");

export interface PageLayoutProps
  extends VariantProps<typeof pageLayoutVariants>,
    VariantProps<typeof insetContainerVariants> {
  /** 페이지 컨텐츠 */
  children: ReactNode;
  /** PageHeader 사용 시 상단 여백 추가 (기본: true) */
  hasHeader?: boolean;
  /** 상단 여백 표시 여부 (기본: true) */
  hasTopSpacer?: boolean;
  /** 하단 여백 표시 여부 (기본: true) */
  hasBottomSpacer?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export default function PageLayout({
  children,
  hasHeader = true,
  background = "default",
  maxWidth = "default",
  hasTopSpacer = true,
  hasBottomSpacer = true,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn(pageLayoutVariants({ background }), className)}>
      <main className={mainVariants({ hasHeader })}>
        {/* 상단 여백 */}
        {hasTopSpacer && <div className={spacerVariants()} />}
        {/* 좌우 여백을 위한 컨테이너 */}
        <div className={insetContainerVariants({ maxWidth })}>{children}</div>
        {/* 하단 여백 */}
        {hasBottomSpacer && <div className={spacerVariants()} />}
      </main>
    </div>
  );
}
