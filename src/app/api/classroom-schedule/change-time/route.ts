import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      compositionId,
      newStartTime, // HH:MM:SS 형식
      newEndTime, // HH:MM:SS 형식
      newDayOfWeek, // 0-6 (0=월, 6=일)
      isPermanent, // true: 영구 변경, false: 일회성 변경
      reason, // 일회성 변경 사유 (선택사항)
      weekStartDate, // 주의 시작 날짜 (월요일, YYYY-MM-DD)
    } = body;

    if (!compositionId || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (isPermanent) {
      // 영구 변경: class_composition 테이블 업데이트
      const updateData: {
        start_time: string;
        end_time: string;
        day_of_week?: number;
      } = {
        start_time: newStartTime,
        end_time: newEndTime,
      };

      if (newDayOfWeek !== undefined) {
        updateData.day_of_week = newDayOfWeek;
      }

      const { error } = await supabase
        .from("class_compositions")
        .update(updateData)
        .eq("id", compositionId);

      if (error) {
        console.error("시간대 변경 실패:", error);
        return NextResponse.json(
          { error: "시간대 변경 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    } else {
      // 일회성 변경: compositions_exceptions 테이블에 예외 등록
      if (!weekStartDate) {
        return NextResponse.json(
          { error: "일회성 변경의 경우 주의 시작 날짜가 필요합니다." },
          { status: 400 }
        );
      }

      const { data: compositionData } = await supabase
        .from("class_compositions")
        .select("class_id")
        .eq("id", compositionId)
        .single();

      if (!compositionData) {
        return NextResponse.json(
          { error: "수업 정보를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // compositions_exceptions 테이블에 예외 등록
      const { data: sourceComposition } = await supabase
        .from("class_compositions")
        .select("start_time, end_time")
        .eq("id", compositionId)
        .single();

      const { data: classData } = await supabase
        .from("classes")
        .select("room")
        .eq("id", compositionData.class_id)
        .single();

      // 기존 예외 삭제 (같은 주의 같은 composition의 기존 예외)
      const { error: deleteError } = await supabase
        .from("compositions_exceptions")
        .delete()
        .eq("composition_id", compositionId)
        .eq("week_start_date", weekStartDate);

      if (deleteError) {
        console.error("기존 예외 삭제 실패:", deleteError);
        return NextResponse.json(
          { error: "기존 예외 삭제 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      // 새로운 예외 등록
      const { error: insertError } = await supabase
        .from("compositions_exceptions")
        .insert({
          composition_id: compositionId,
          week_start_date: weekStartDate,
          start_time_from: sourceComposition?.start_time,
          end_time_from: sourceComposition?.end_time,
          start_time_to: newStartTime,
          end_time_to: newEndTime,
          room: classData?.room || "",
          reason: reason || "시간대 변경",
        });

      if (insertError) {
        console.error("예외 등록 실패:", insertError);
        return NextResponse.json(
          { error: "예외 등록 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: isPermanent
        ? "시간대가 영구적으로 변경되었습니다."
        : "일회성 변경이 등록되었습니다.",
    });
  } catch (error) {
    console.error("시간대 변경 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
