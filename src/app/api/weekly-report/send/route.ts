/**
 * 주간 보고서 알림톡 발송 API (발송 + 로그 저장 통합)
 * POST /api/weekly-report/send
 */

import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { sendBulkAlimtalk } from "@/services/server/alimtalkService";
import { NextRequest, NextResponse } from "next/server";

// 서버에서 템플릿 ID 가져오기
const SOLAPI_TEMPLATE_ID = process.env.SOLAPI_TEMPLATE_ID;

interface WeeklyReportSendRequest {
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
    console.log("body", body);

    // 템플릿 ID 확인
    if (!SOLAPI_TEMPLATE_ID) {
      return NextResponse.json(
        {
          success: false,
          message: "서버 템플릿 ID가 설정되지 않았습니다.",
        },
        { status: 500 }
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

    const supabase = createAdminSupabaseClient();

    // 1. weekly_reports 테이블에 리포트 먼저 생성
    console.log("[WeeklyReportSend] weekly_reports 생성 시작");
    console.log(
      "[WeeklyReportSend] Recipients:",
      body.recipients.map((r) => ({
        studentId: r.studentId,
        studentName: r.studentName,
      }))
    );

    // 학생별로 weekly_report 생성 (upsert 사용하여 중복 방지)
    const weeklyReportsToCreate = body.recipients.map((recipient) => ({
      student_id: recipient.studentId,
      week_of: body.weekOf,
      expired_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 발송일로부터 7일 후
    }));

    console.log(
      "[WeeklyReportSend] Creating weekly_reports:",
      weeklyReportsToCreate
    );

    const { data: weeklyReports, error: weeklyReportError } = await supabase
      .from("weekly_reports")
      .upsert(weeklyReportsToCreate, {
        onConflict: "student_id,week_of",
        ignoreDuplicates: false,
      })
      .select("id, student_id");

    if (weeklyReportError) {
      console.error(
        "[WeeklyReportSend] weekly_reports 생성 실패:",
        weeklyReportError
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "weekly_reports 생성에 실패했습니다: " + weeklyReportError.message,
        },
        { status: 500 }
      );
    }

    console.log("[WeeklyReportSend] weekly_reports 생성 완료:", weeklyReports);
    console.log(
      "[WeeklyReportSend] Created report IDs:",
      weeklyReports?.map((r) => r.id)
    );

    // 학생 ID와 report ID 매핑
    const studentReportMap = new Map<string, string>();
    weeklyReports?.forEach((report) => {
      studentReportMap.set(report.student_id, report.id);
    });

    // 2. 알림톡 발송 (report_id를 variables에 포함)
    const alimtalkRecipients = body.recipients.map((recipient) => {
      const studentId = recipient.studentId;
      const reportId = studentReportMap.get(studentId);

      if (!reportId) {
        console.warn(
          `학생 ${recipient.studentName}의 report_id를 찾을 수 없습니다.`
        );
      }

      return {
        to: recipient.phone,
        variables: {
          ...recipient.variables,
          report_id: reportId || "", // report_id 추가
          student_id: studentId || "",
        },
      };
    });

    console.log("[WeeklyReportSend] 알림톡 발송 시작");
    const sendResult = await sendBulkAlimtalk(
      SOLAPI_TEMPLATE_ID,
      alimtalkRecipients,
      body.fallbackType || "NONE",
      body.smsSender
    );

    // 발송 실패 시 조기 리턴
    if (!sendResult.success) {
      console.error("[WeeklyReportSend] 알림톡 발송 실패:", sendResult.message);
      return NextResponse.json(
        {
          success: false,
          message: sendResult.message || "알림톡 발송에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    console.log("[WeeklyReportSend] 알림톡 발송 완료");

    // 3. 발송 성공 시 로그 저장

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
      .insert(logsToInsert).select(`
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
