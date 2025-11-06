/**
 * 알림톡 관련 타입 정의
 */

// 템플릿 버튼 타입
export interface AlimtalkButton {
  name: string;
  ordering: number;
  type: string; // "WL" (웹링크), "AL" (앱링크), "DS" (배송조회), "BK" (봇키워드), "MD" (메시지전달), "BC" (상담톡전환), "BT" (봇전환), "AC" (채널추가)
  urlMobile?: string;
  urlPc?: string;
}

// 템플릿 정보
export interface AlimtalkTemplate {
  id: string;
  status: string; // "APPROVED", "PENDING", "REJECTED"
  templateName: string;
  templateCode: string;
  templateContent: string;
  buttons?: AlimtalkButton[];
}

// 템플릿 목록 응답
export interface AlimtalkTemplatesResponse {
  success: boolean;
  data: {
    templates: AlimtalkTemplate[];
    total: number;
  };
}

// 발송 프로필 정보
export interface SendProfile {
  id: string;
  name: string;
  status: string; // "ACTIVE", "INACTIVE"
}

// 발송 프로필 목록 응답
export interface SendProfilesResponse {
  success: boolean;
  data: {
    sendProfiles: SendProfile[];
    total: number;
  };
}

// 단일 발송 수신자 정보
export interface AlimtalkRecipient {
  phone: string; // 전화번호
  variables: Record<string, string>; // 템플릿 변수 (예: { studentName: "홍길동", report_id: "xxx", student_id: "yyy" })
}

// 대체 발송 설정
export interface FallbackConfig {
  fallbackType: "NONE" | "SMS" | "LMS" | "MMS";
  from?: string; // SMS 발신번호 (fallbackType이 NONE이 아닐 때 필수)
  subject?: string; // LMS/MMS 제목
  imageId?: string; // MMS 이미지 ID
}

// 단일/다중 발송 요청
export interface AlimtalkSendRequest {
  templateId: string;
  to: AlimtalkRecipient[];
  fallback?: FallbackConfig;
}

// 발송 응답
export interface AlimtalkSendResponse {
  success: boolean;
  data?: {
    groupId: string;
  };
  message?: string;
}

// 일괄 발송 결과
export interface BulkSendResult {
  success: number;
  failed: number;
  errors: Array<{
    to: string;
    error: string;
  }>;
}

// 일괄 발송 응답
export interface AlimtalkBulkResponse {
  success: boolean;
  data: BulkSendResult;
}

// 주간 보고서 데이터
export interface WeeklyReportData {
  studentName: string;
  parentPhone: string;
  weekNumber: number;
  attendance: string;
  homework: string;
  classProgress: string;
  teacherComment: string;
  nextWeekPlan: string;
}

// 주간 보고서 발송 요청
export interface WeeklyReportRequest {
  templateId: string;
  reportData: WeeklyReportData;
  smsSender?: string;
}

// 주간 보고서 일괄 발송 요청
export interface BulkWeeklyReportRequest {
  templateId: string;
  reports: WeeklyReportData[];
  smsSender?: string;
}
