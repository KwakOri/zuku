"use client";

import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const pageLayoutVariants = cva("min-h-screen", {
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

const mainVariants = cva("", {
  variants: {
    variant: {
      default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      inset: "flex flex-col",
    },
    hasHeader: {
      true: "pt-16",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    hasHeader: true,
  },
});

const insetContainerVariants = cva("px-4 sm:px-6 lg:px-8");

const spacerVariants = cva("h-8");

export interface PageLayoutProps
  extends VariantProps<typeof pageLayoutVariants> {
  /** 페이지 컨텐츠 */
  children: ReactNode;
  /** 레이아웃 변형
   * - default: 일반적인 컨테이너 레이아웃 (max-w-7xl, padding)
   * - inset: 화면 전체를 사용하는 레이아웃 (패딩 없음)
   */
  variant?: "default" | "inset";
  /** PageHeader 사용 시 상단 여백 추가 (기본: true) */
  hasHeader?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export default function PageLayout({
  children,
  variant = "default",
  hasHeader = true,
  background = "default",
  className,
}: PageLayoutProps) {
  return (
    <div className={cn(pageLayoutVariants({ background }), className)}>
      <main className={mainVariants({ variant, hasHeader })}>
        {variant === "inset" ? (
          <>
            {/* 상단 여백 */}
            <div className={spacerVariants()} />
            {/* 좌우 여백을 위한 컨테이너 */}
            <div className={insetContainerVariants()}>{children}</div>
            {/* 하단 여백 */}
            <div className={spacerVariants()} />
          </>
        ) : (
          <>
            {/* 상단 여백 */}
            <div className={spacerVariants()} />
            {children}
            {/* 하단 여백 */}
            <div className={spacerVariants()} />
          </>
        )}
      </main>
    </div>
  );
}
