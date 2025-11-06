/**
 * 주간 보고서 알림톡 발송 API (발송 + 로그 저장 통합)
 * POST /api/weekly-report/send
 */

import { NextRequest, NextResponse } from "next/server";
import { sendBulkAlimtalk } from "@/services/server/alimtalkService";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

interface WeeklyReportSendRequest {
  templateId: string;
  recipients: Array<{
    studentId: string;
    studentName: string;
    phone: string;
    subjectIds: string[]; // 해당 학생이 수강하는 과목 ID 배열
    variables: Record<string, string>;
  }>;
  weekOf: string; // 주의 시작일 (월요일 날짜, YYYY-MM-DD)
  sentBy: string; // 발송자 ID
  fallbackType?: "NONE" | "SMS" | "LMS" | "MMS";
  smsSender?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WeeklyReportSendRequest = await request.json();

    // 유효성 검사
    if (!body.templateId) {
      return NextResponse.json(
        {
          success: false,
          message: "템플릿 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!body.recipients || body.recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "수신자 정보가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!body.weekOf) {
      return NextResponse.json(
        {
          success: false,
          message: "주차 정보(week_of)가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!body.sentBy) {
      return NextResponse.json(
        {
          success: false,
          message: "발송자 정보(sent_by)가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // 1. 알림톡 발송
    const alimtalkRecipients = body.recipients.map((recipient) => ({
      to: recipient.phone,
      variables: recipient.variables,
    }));

    const sendResult = await sendBulkAlimtalk(
      body.templateId,
      alimtalkRecipients,
      body.fallbackType || "NONE",
      body.smsSender
    );

    // 발송 실패 시 조기 리턴
    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: sendResult.message || "알림톡 발송에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    // 2. 발송 성공 시 로그 저장
    const supabase = createAdminSupabaseClient();

    // 모든 학생의 모든 과목에 대해 로그 생성
    const logsToInsert = body.recipients.flatMap((recipient) =>
      recipient.subjectIds.map((subjectId) => ({
        week_of: body.weekOf,
        student_id: recipient.studentId,
        subject_id: subjectId,
        sent_by: body.sentBy,
        sent_at: new Date().toISOString(),
      }))
    );

    const { data: logData, error: logError } = await supabase
      .from("weekly_report_logs")
      .insert(logsToInsert)
      .select(`
        *,
        student:students(id, name),
        subject:subjects(id, subject_name)
      `);

    // 로그 저장 실패는 경고만 하고 성공 응답 반환
    if (logError) {
      console.error("발송 로그 저장 실패:", logError);
      return NextResponse.json({
        success: true,
        data: sendResult.data,
        warning: "알림톡은 발송되었으나 로그 저장에 실패했습니다.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        groupId: sendResult.data?.groupId,
        logs: logData,
        totalSent: body.recipients.length,
        totalLogs: logsToInsert.length,
      },
      message: `${body.recipients.length}명에게 알림톡을 발송하고 ${logsToInsert.length}개의 로그를 저장했습니다.`,
    });
  } catch (error) {
    console.error("주간 보고서 발송 실패:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "주간 보고서 발송에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
