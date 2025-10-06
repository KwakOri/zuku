"use client";

import { Clock } from "lucide-react";
import { useClassCompositions } from "@/queries/useClassComposition";

interface ClassCompositionBadgeProps {
  classId: string;
  compositionId?: string;
  splitType?: string; // "single" | "split"
  size?: "sm" | "md";
}

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function ClassCompositionBadge({
  classId,
  compositionId,
  splitType = "single",
  size = "sm",
}: ClassCompositionBadgeProps) {
  const { data: compositions = [] } = useClassCompositions(classId);

  if (splitType === "single" || !compositionId) {
    return null;
  }

  const composition = compositions.find((c) => c.id === compositionId);

  if (!composition) {
    return null;
  }

  const isClass = composition.type === "class";
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${
        isClass
          ? "bg-blue-100 text-blue-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      <Clock className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>
        {isClass ? "앞타임" : "뒤타임"} ({DAYS_OF_WEEK[composition.dayOfWeek]}{" "}
        {composition.startTime})
      </span>
    </div>
  );
}
