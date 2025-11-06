# 알림톡 발송 및 로그 저장 가이드

## 개요

주간 보고서 알림톡 발송 시 자동으로 발송 기록을 `weekly_report_logs` 테이블에 저장하는 통합 API입니다.

## 아키텍처

```
Component
  ↓
React Query Hook (useWeeklyReport.ts)
  ↓
Client Service (weeklyReportApi.ts)
  ↓
API Route (/api/weekly-report/send)
  ↓
1. 알림톡 발송 (alimtalkService.ts)
2. 로그 저장 (Supabase)
```

## 사용 방법

### 1. 컴포넌트에서 사용 (권장)

```tsx
'use client';

import { useSendWeeklyReport } from '@/queries/useWeeklyReport';
import { useSession } from 'next-auth/react';

export default function WeeklyReportSender() {
  const session = useSession();
  const sendWeeklyReport = useSendWeeklyReport();

  const handleSend = async () => {
    try {
      const result = await sendWeeklyReport.mutateAsync({
        templateId: 'TEMPLATE_ID',
        recipients: [
          {
            studentId: 'student-uuid-1',
            studentName: '홍길동',
            phone: '01012345678',
            subjectIds: ['subject-uuid-1', 'subject-uuid-2'], // 수강 과목들
            variables: {
              studentName: '홍길동',
              weekNumber: '1주차',
              attendance: '출석',
              homework: '완료',
              classProgress: '1단원 완료',
              teacherComment: '잘하고 있습니다',
              nextWeekPlan: '2단원 진행 예정',
            },
          },
          {
            studentId: 'student-uuid-2',
            studentName: '김철수',
            phone: '01087654321',
            subjectIds: ['subject-uuid-3'],
            variables: {
              studentName: '김철수',
              weekNumber: '1주차',
              // ...
            },
          },
        ],
        weekOf: '2025-01-06', // 월요일 날짜
        sentBy: session.data?.user?.id || '',
        fallbackType: 'SMS', // 실패 시 SMS 대체 발송
        smsSender: '0212345678', // SMS 발신번호
      });

      console.log('발송 완료:', result);
      // result.data.totalSent: 발송된 학생 수
      // result.data.totalLogs: 저장된 로그 수
    } catch (error) {
      console.error('발송 실패:', error);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sendWeeklyReport.isPending}
    >
      {sendWeeklyReport.isPending ? '발송 중...' : '주간 보고서 발송'}
    </button>
  );
}
```

### 2. 단일 학생 발송

```tsx
import { useSendSingleWeeklyReport } from '@/queries/useWeeklyReport';

export default function SingleStudentReport({ studentId }: { studentId: string }) {
  const sendReport = useSendSingleWeeklyReport();

  const handleSend = async () => {
    try {
      await sendReport.mutateAsync({
        templateId: 'TEMPLATE_ID',
        recipient: {
          studentId: studentId,
          studentName: '홍길동',
          phone: '01012345678',
          subjectIds: ['subject-uuid-1', 'subject-uuid-2'],
          variables: {
            studentName: '홍길동',
            // ...
          },
        },
        weekOf: '2025-01-06',
        sentBy: 'user-id',
      });
    } catch (error) {
      console.error('발송 실패:', error);
    }
  };

  return <button onClick={handleSend}>발송</button>;
}
```

## 발송 로그 조회

발송 기록은 `useWeeklyReportLogs` Hook을 사용하여 조회할 수 있습니다.

```tsx
import { useWeeklyReportLogs } from '@/queries/useWeeklyReportLogs';

export default function WeeklyReportHistory() {
  // 특정 주차의 발송 기록 조회
  const { data: logs, isLoading } = useWeeklyReportLogs({
    week_of: '2025-01-06',
  });

  // 특정 학생의 발송 기록 조회
  const { data: studentLogs } = useWeeklyReportLogs({
    student_id: 'student-uuid-1',
  });

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      <h2>발송 기록</h2>
      <ul>
        {logs?.map((log) => (
          <li key={log.id}>
            {log.student?.name} - {log.subject?.subject_name} - {log.sent_at}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 중복 발송 방지

`weekly_report_logs` 테이블에는 `UNIQUE(week_of, student_id, subject_id)` 제약조건이 있어서
같은 주, 같은 학생, 같은 과목에 대해 중복 발송 시 에러가 발생합니다.

발송 전에 로그를 조회하여 이미 발송되었는지 확인하는 로직을 추가하는 것을 권장합니다:

```tsx
const { data: existingLogs } = useWeeklyReportLogs({
  week_of: '2025-01-06',
});

// 발송 전 중복 체크
const isAlreadySent = existingLogs?.some(
  log => log.student_id === studentId && log.subject_id === subjectId
);

if (isAlreadySent) {
  alert('이미 발송된 기록이 있습니다.');
  return;
}
```

## 데이터 구조

### WeeklyReportRecipient

```typescript
{
  studentId: string;        // 학생 ID (UUID)
  studentName: string;      // 학생 이름
  phone: string;            // 학부모 전화번호 (하이픈 없이)
  subjectIds: string[];     // 수강 과목 ID 배열
  variables: Record<string, string>; // 템플릿 변수
}
```

### WeeklyReportSendRequest

```typescript
{
  templateId: string;       // 알림톡 템플릿 ID
  recipients: WeeklyReportRecipient[]; // 수신자 배열
  weekOf: string;           // 주의 시작일 (월요일, YYYY-MM-DD)
  sentBy: string;           // 발송자 ID
  fallbackType?: 'NONE' | 'SMS' | 'LMS' | 'MMS'; // 대체 발송 타입
  smsSender?: string;       // SMS 발신번호
}
```

### WeeklyReportSendResponse

```typescript
{
  success: boolean;
  data?: {
    groupId?: string;       // 알림톡 그룹 ID
    logs?: any[];           // 저장된 로그
    totalSent: number;      // 발송된 학생 수
    totalLogs: number;      // 저장된 로그 수
  };
  message?: string;
  warning?: string;         // 경고 메시지 (발송 성공, 로그 저장 실패)
}
```

## 에러 처리

### 1. 알림톡 발송 실패

알림톡 발송이 실패하면 로그가 저장되지 않고 에러를 반환합니다.

```typescript
try {
  await sendWeeklyReport.mutateAsync({ ... });
} catch (error) {
  // 발송 실패
  console.error('발송 실패:', error);
}
```

### 2. 로그 저장 실패

알림톡 발송은 성공했지만 로그 저장이 실패한 경우 `warning` 필드가 포함됩니다.

```typescript
const result = await sendWeeklyReport.mutateAsync({ ... });

if (result.warning) {
  console.warn('로그 저장 실패:', result.warning);
  // 알림톡은 발송되었지만 기록은 저장되지 않음
}
```

## 파일 구조

```
src/
├── app/api/
│   └── weekly-report/
│       └── send/
│           └── route.ts              # 통합 API (발송 + 로그 저장)
├── services/
│   ├── server/
│   │   └── alimtalkService.ts        # 알림톡 서버 서비스
│   └── client/
│       ├── alimtalkApi.ts            # 알림톡 클라이언트 API
│       ├── weeklyReportApi.ts        # 주간 보고서 클라이언트 API
│       └── weeklyReportLogApi.ts     # 로그 조회 API
├── queries/
│   ├── useAlimtalk.ts                # 알림톡 React Query Hooks
│   ├── useWeeklyReport.ts            # 주간 보고서 발송 Hooks
│   └── useWeeklyReportLogs.ts        # 로그 조회 Hooks
└── types/
    └── alimtalk.ts                   # 알림톡 타입 정의
```

## 주의사항

1. **전화번호 형식**: 하이픈 없이 숫자만 입력 (예: `01012345678`)
2. **weekOf 날짜**: 반드시 월요일 날짜를 사용 (`YYYY-MM-DD` 형식)
3. **템플릿 변수**: 템플릿에 정의된 변수명과 정확히 일치해야 함
4. **과목 ID 배열**: 학생이 수강하는 모든 과목의 ID를 포함
5. **중복 발송 방지**: 발송 전 로그 조회로 중복 여부 확인 권장
