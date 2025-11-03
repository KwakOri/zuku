import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentIds, // 학생 ID 배열
      sourceCompositionId,
      targetCompositionId,
      isPermanent, // true: 영구 변경, false: 일회성 변경
      reason, // 일회성 변경 사유 (선택사항)
      weekStartDate, // 주의 시작 날짜 (월요일, YYYY-MM-DD)
    } = body;

    if (!studentIds || !sourceCompositionId || !targetCompositionId) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (isPermanent) {
      // 영구 변경: compositions_students 테이블의 composition_id 업데이트
      for (const studentId of studentIds) {
        const { error } = await supabase
          .from("relations_compositions_students")
          .update({ composition_id: targetCompositionId })
          .eq("student_id", studentId)
          .eq("composition_id", sourceCompositionId)
          .eq("status", "active");

        if (error) {
          console.error("학생 이동 실패:", error);
          return NextResponse.json(
            { error: "학생 이동 중 오류가 발생했습니다." },
            { status: 500 }
          );
        }
      }
    } else {
      // 일회성 변경: composition_students_exceptions 테이블 사용
      if (!weekStartDate) {
        return NextResponse.json(
          { error: "일회성 변경의 경우 주의 시작 날짜가 필요합니다." },
          { status: 400 }
        );
      }

      // 각 학생별로 예외 등록
      for (const studentId of studentIds) {
        // 기존 예외 삭제 (같은 주의 같은 학생의 모든 예외)
        // 1. 원본 수업에서 이동한 경우 (composition_id_from = source)
        // 2. 이미 예외로 이동된 수업에서 다시 이동하는 경우 (composition_id_to = source)
        const { error: deleteError } = await supabase
          .from("composition_students_exceptions")
          .delete()
          .eq("student_id", studentId)
          .eq("week_start_date", weekStartDate)
          .or(`composition_id_from.eq.${sourceCompositionId},composition_id_to.eq.${sourceCompositionId}`);

        if (deleteError) {
          console.error("기존 학생 예외 삭제 실패:", deleteError);
          return NextResponse.json(
            { error: "기존 예외 삭제 중 오류가 발생했습니다." },
            { status: 500 }
          );
        }

        // 새로운 예외 등록
        const { error: insertError } = await supabase
          .from("composition_students_exceptions")
          .insert({
            composition_id_from: sourceCompositionId,
            composition_id_to: targetCompositionId,
            student_id: studentId,
            week_start_date: weekStartDate,
            reason: reason || "학생 일회성 이동",
          });

        if (insertError) {
          console.error("학생 예외 등록 실패:", insertError);
          return NextResponse.json(
            { error: "학생 예외 등록 중 오류가 발생했습니다." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "학생이 이동되었습니다.",
    });
  } catch (error) {
    console.error("학생 이동 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
