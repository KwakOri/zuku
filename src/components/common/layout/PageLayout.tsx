"use client";

import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const pageLayoutVariants = cva("absolute inset-0 flex flex-col", {
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

const mainVariants = cva("h-full shrink flex flex-col", {
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

const insetContainerVariants = cva("h-full px-4 sm:px-6 lg:px-8 shrink");

const spacerVariants = cva("h-8 shrink-0");

export interface PageLayoutProps
  extends VariantProps<typeof pageLayoutVariants> {
  /** 페이지 컨텐츠 */
  children: ReactNode;
  /** PageHeader 사용 시 상단 여백 추가 (기본: true) */
  hasHeader?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export default function PageLayout({
  children,
  hasHeader = true,
  background = "default",
  className,
}: PageLayoutProps) {
  return (
    <div className={cn(pageLayoutVariants({ background }), className)}>
      <main className={mainVariants({ hasHeader })}>
        {/* 상단 여백 */}
        <div className={spacerVariants()} />
        {/* 좌우 여백을 위한 컨테이너 */}
        <div className={insetContainerVariants()}>{children}</div>
        {/* 하단 여백 */}
        <div className={spacerVariants()} />
      </main>
    </div>
  );
}
