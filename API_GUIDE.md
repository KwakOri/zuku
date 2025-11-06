# Zuku Proxy API 사용 가이드

본 프로젝트에서 Zuku Proxy API를 호출하여 카카오톡 알림톡을 발송하는 방법을 안내합니다.

## 목차
1. [개요](#개요)
2. [인증](#인증)
3. [API 엔드포인트](#api-엔드포인트)
4. [JavaScript/TypeScript 사용 예시](#javascripttypescript-사용-예시)
5. [에러 처리](#에러-처리)
6. [실전 예시: 주간 보고서 발송](#실전-예시-주간-보고서-발송)

---

## 개요

Zuku Proxy는 카카오톡 알림톡을 발송하기 위한 프록시 서버입니다. Vercel 등 고정 IP가 없는 환경에서도 Sendon API를 통해 알림톡을 발송할 수 있도록 지원합니다.

**기본 URL:**
- 개발: `http://localhost:3000`
- 프로덕션: `https://your-app.fly.dev` (fly.io 배포 후)

**Swagger 문서:** `{BASE_URL}/api-docs`

---

## 인증

모든 API 요청에는 `x-api-key` 헤더가 필요합니다.

```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'your-api-key-here'
}
```

**API Key 확인:** `.env` 파일의 `API_KEY` 값 사용

---

## API 엔드포인트

### 1. 헬스체크
```
GET /api/alimtalk/health
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Alimtalk service is running",
  "timestamp": "2025-01-24T10:00:00.000Z"
}
```

### 2. 채널 목록 조회
```
GET /api/alimtalk/send-profiles
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "sendProfiles": [
      {
        "id": "231edu",
        "name": "학원 채널",
        "status": "ACTIVE"
      }
    ],
    "total": 1
  }
}
```

### 3. 템플릿 목록 조회
```
GET /api/alimtalk/templates
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "351J9e9RAH1GdhPQGVgM8HFpBgA",
        "status": "APPROVED",
        "templateName": "주간보고서 안내",
        "templateCode": "cJ5zg1eDBfnugGGE",
        "templateContent": "[231edu학원 주간보고서]\n\n학생명 : #{studentName}\n주차 : 제#{weekNumber}주차...",
        "buttons": [
          {
            "name": "이전 보고서 보러가기",
            "ordering": 1,
            "type": "WL",
            "urlMobile": "https://zuku.channel.io/lounge",
            "urlPc": "https://zuku.channel.io/lounge"
          }
        ]
      }
    ],
    "total": 1
  }
}
```

### 4. 템플릿 상세 조회
```
GET /api/alimtalk/templates/{templateId}
```

**응답:** 템플릿 목록과 동일한 구조의 단일 템플릿 정보

### 5. 알림톡 전송 (범용)
```
POST /api/alimtalk/send
```

**요청 Body:**
```json
{
  "templateId": "351J9e9RAH1GdhPQGVgM8HFpBgA",
  "to": [
    {
      "to": "01012345678",
      "variables": {
        "studentName": "홍길동",
        "weekNumber": "1",
        "attendance": "5일 출석",
        "homework": "모든 과제 제출 완료",
        "classProgress": "영어 문법 Unit 3 완료",
        "teacherComment": "수업 집중도가 높고 이해도가 우수합니다.",
        "nextWeekPlan": "Unit 4 진행 예정"
      }
    }
  ],
  "fallback": {
    "fallbackType": "NONE"
  }
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "groupId": "msg_group_12345"
  }
}
```

### 6. 주간 보고서 전송 (단일)
```
POST /api/alimtalk/weekly-report
```

**요청 Body:**
```json
{
  "templateId": "351J9e9RAH1GdhPQGVgM8HFpBgA",
  "reportData": {
    "studentName": "홍길동",
    "parentPhone": "010-1234-5678",
    "weekNumber": 1,
    "attendance": "5일 출석",
    "homework": "모든 과제 제출 완료",
    "classProgress": "영어 문법 Unit 3 완료",
    "teacherComment": "수업 집중도가 높고 이해도가 우수합니다.",
    "nextWeekPlan": "Unit 4 진행 예정"
  },
  "smsSender": "02-1234-5678"
}
```

### 7. 주간 보고서 일괄 전송
```
POST /api/alimtalk/weekly-report/bulk
```

**요청 Body:**
```json
{
  "templateId": "351J9e9RAH1GdhPQGVgM8HFpBgA",
  "reports": [
    {
      "studentName": "홍길동",
      "parentPhone": "010-1234-5678",
      "weekNumber": 1,
      "attendance": "5일 출석",
      "homework": "모든 과제 제출 완료",
      "classProgress": "영어 문법 Unit 3 완료",
      "teacherComment": "수업 집중도가 높습니다.",
      "nextWeekPlan": "Unit 4 진행 예정"
    },
    {
      "studentName": "김철수",
      "parentPhone": "010-8765-4321",
      "weekNumber": 1,
      "attendance": "5일 출석",
      "homework": "과제 제출 완료",
      "classProgress": "수학 Unit 2 완료",
      "teacherComment": "학습 태도가 우수합니다.",
      "nextWeekPlan": "Unit 3 진행 예정"
    }
  ],
  "smsSender": "02-1234-5678"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## JavaScript/TypeScript 사용 예시

### 1. 기본 설정

```typescript
// api/alimtalk.ts
const ALIMTALK_API_BASE_URL = process.env.ALIMTALK_API_BASE_URL || 'http://localhost:3000';
const ALIMTALK_API_KEY = process.env.ALIMTALK_API_KEY;

interface AlimtalkApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

async function callAlimtalkApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AlimtalkApiResponse<T>> {
  const response = await fetch(`${ALIMTALK_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ALIMTALK_API_KEY || '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 호출 실패: ${response.status}`);
  }

  return response.json();
}
```

### 2. 템플릿 조회

```typescript
// 템플릿 목록 가져오기
async function getTemplates() {
  const response = await callAlimtalkApi('/api/alimtalk/templates');
  return response.data?.templates || [];
}

// 사용 예시
const templates = await getTemplates();
console.log('사용 가능한 템플릿:', templates);
```

### 3. 단일 주간 보고서 발송

```typescript
interface WeeklyReportData {
  studentName: string;
  parentPhone: string;
  weekNumber: number;
  attendance: string;
  homework: string;
  classProgress: string;
  teacherComment: string;
  nextWeekPlan: string;
}

async function sendWeeklyReport(
  templateId: string,
  reportData: WeeklyReportData
) {
  return callAlimtalkApi('/api/alimtalk/weekly-report', {
    method: 'POST',
    body: JSON.stringify({
      templateId,
      reportData,
      smsSender: '02-1234-5678', // 선택사항
    }),
  });
}

// 사용 예시
const result = await sendWeeklyReport('351J9e9RAH1GdhPQGVgM8HFpBgA', {
  studentName: '홍길동',
  parentPhone: '010-1234-5678',
  weekNumber: 1,
  attendance: '5일 출석',
  homework: '모든 과제 제출 완료',
  classProgress: '영어 문법 Unit 3 완료',
  teacherComment: '수업 집중도가 높고 이해도가 우수합니다.',
  nextWeekPlan: 'Unit 4 진행 예정',
});

console.log('발송 결과:', result);
```

### 4. 일괄 주간 보고서 발송

```typescript
async function sendBulkWeeklyReports(
  templateId: string,
  reports: WeeklyReportData[]
) {
  return callAlimtalkApi('/api/alimtalk/weekly-report/bulk', {
    method: 'POST',
    body: JSON.stringify({
      templateId,
      reports,
      smsSender: '02-1234-5678', // 선택사항
    }),
  });
}

// 사용 예시
const students = [
  {
    studentName: '홍길동',
    parentPhone: '010-1234-5678',
    weekNumber: 1,
    attendance: '5일 출석',
    homework: '모든 과제 제출 완료',
    classProgress: '영어 문법 Unit 3 완료',
    teacherComment: '수업 집중도가 높습니다.',
    nextWeekPlan: 'Unit 4 진행 예정',
  },
  {
    studentName: '김철수',
    parentPhone: '010-8765-4321',
    weekNumber: 1,
    attendance: '5일 출석',
    homework: '과제 제출 완료',
    classProgress: '수학 Unit 2 완료',
    teacherComment: '학습 태도가 우수합니다.',
    nextWeekPlan: 'Unit 3 진행 예정',
  },
];

const result = await sendBulkWeeklyReports('351J9e9RAH1GdhPQGVgM8HFpBgA', students);
console.log(`성공: ${result.data.success}건, 실패: ${result.data.failed}건`);
```

### 5. React Hook 예시

```typescript
// hooks/useAlimtalk.ts
import { useState } from 'react';

export function useAlimtalk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendWeeklyReport = async (
    templateId: string,
    reportData: WeeklyReportData
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/alimtalk/weekly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ALIMTALK_API_KEY || '',
        },
        body: JSON.stringify({
          templateId,
          reportData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '발송 실패');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendWeeklyReport,
    loading,
    error,
  };
}

// 사용 예시
function WeeklyReportForm() {
  const { sendWeeklyReport, loading, error } = useAlimtalk();

  const handleSubmit = async (formData: WeeklyReportData) => {
    try {
      await sendWeeklyReport('351J9e9RAH1GdhPQGVgM8HFpBgA', formData);
      alert('주간 보고서가 전송되었습니다.');
    } catch (err) {
      alert('전송 실패: ' + error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // formData 수집 로직
      handleSubmit(formData);
    }}>
      {/* 폼 필드들... */}
      <button type="submit" disabled={loading}>
        {loading ? '전송 중...' : '주간 보고서 전송'}
      </button>
    </form>
  );
}
```

### 6. Next.js API Route 예시

```typescript
// pages/api/send-report.ts (Next.js Pages Router)
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reportData } = req.body;

    const response = await fetch(
      `${process.env.ALIMTALK_API_BASE_URL}/api/alimtalk/weekly-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ALIMTALK_API_KEY || '',
        },
        body: JSON.stringify({
          templateId: '351J9e9RAH1GdhPQGVgM8HFpBgA',
          reportData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('알림톡 전송 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
}
```

```typescript
// app/api/send-report/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { reportData } = await request.json();

    const response = await fetch(
      `${process.env.ALIMTALK_API_BASE_URL}/api/alimtalk/weekly-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ALIMTALK_API_KEY || '',
        },
        body: JSON.stringify({
          templateId: '351J9e9RAH1GdhPQGVgM8HFpBgA',
          reportData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('알림톡 전송 실패:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
```

---

## 에러 처리

### 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

### HTTP 상태 코드

- `200`: 성공
- `400`: 잘못된 요청 (필수 파라미터 누락 등)
- `401`: 인증 실패 (API Key 오류)
- `500`: 서버 오류

### 에러 처리 예시

```typescript
async function safeSendWeeklyReport(
  templateId: string,
  reportData: WeeklyReportData
) {
  try {
    const response = await fetch(`${ALIMTALK_API_BASE_URL}/api/alimtalk/weekly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ALIMTALK_API_KEY || '',
      },
      body: JSON.stringify({
        templateId,
        reportData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // HTTP 에러 처리
      switch (response.status) {
        case 400:
          throw new Error(`잘못된 요청: ${data.message}`);
        case 401:
          throw new Error('API 인증 실패. API Key를 확인해주세요.');
        case 500:
          throw new Error(`서버 오류: ${data.message}`);
        default:
          throw new Error(`알 수 없는 오류: ${data.message}`);
      }
    }

    return data;
  } catch (error) {
    // 네트워크 오류 등
    if (error instanceof TypeError) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
}
```

---

## 실전 예시: 주간 보고서 발송

### 시나리오
학원 관리자가 매주 금요일에 학생들의 주간 보고서를 학부모님께 일괄 발송

### 완성 코드

```typescript
// lib/alimtalk/client.ts
const ALIMTALK_API_BASE_URL = process.env.ALIMTALK_API_BASE_URL;
const ALIMTALK_API_KEY = process.env.ALIMTALK_API_KEY;
const TEMPLATE_ID = '351J9e9RAH1GdhPQGVgM8HFpBgA';

interface Student {
  id: string;
  name: string;
  parentPhone: string;
}

interface WeeklyReport {
  studentId: string;
  weekNumber: number;
  attendance: string;
  homework: string;
  classProgress: string;
  teacherComment: string;
  nextWeekPlan: string;
}

export class AlimtalkClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${ALIMTALK_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ALIMTALK_API_KEY || '',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API 호출 실패');
    }

    return data;
  }

  async sendWeeklyReports(students: Student[], reports: WeeklyReport[]) {
    // 학생 정보와 보고서 데이터 매칭
    const reportData = reports.map(report => {
      const student = students.find(s => s.id === report.studentId);
      if (!student) {
        throw new Error(`학생을 찾을 수 없습니다: ${report.studentId}`);
      }

      return {
        studentName: student.name,
        parentPhone: student.parentPhone,
        weekNumber: report.weekNumber,
        attendance: report.attendance,
        homework: report.homework,
        classProgress: report.classProgress,
        teacherComment: report.teacherComment,
        nextWeekPlan: report.nextWeekPlan,
      };
    });

    // 일괄 전송
    return this.request('/api/alimtalk/weekly-report/bulk', {
      method: 'POST',
      body: JSON.stringify({
        templateId: TEMPLATE_ID,
        reports: reportData,
        smsSender: '02-1234-5678',
      }),
    });
  }
}

// 사용 예시
const client = new AlimtalkClient();

const students = [
  { id: '1', name: '홍길동', parentPhone: '010-1234-5678' },
  { id: '2', name: '김철수', parentPhone: '010-8765-4321' },
];

const reports = [
  {
    studentId: '1',
    weekNumber: 1,
    attendance: '5일 출석',
    homework: '모든 과제 제출 완료',
    classProgress: '영어 문법 Unit 3 완료',
    teacherComment: '수업 집중도가 높고 이해도가 우수합니다.',
    nextWeekPlan: 'Unit 4 진행 예정',
  },
  {
    studentId: '2',
    weekNumber: 1,
    attendance: '5일 출석',
    homework: '과제 제출 완료',
    classProgress: '수학 Unit 2 완료',
    teacherComment: '학습 태도가 우수합니다.',
    nextWeekPlan: 'Unit 3 진행 예정',
  },
];

// 발송 실행
const result = await client.sendWeeklyReports(students, reports);
console.log(`전송 완료: ${result.data.success}건 성공, ${result.data.failed}건 실패`);

if (result.data.errors.length > 0) {
  console.error('전송 실패 목록:', result.data.errors);
}
```

---

## 환경 변수 설정

본 프로젝트의 `.env` 파일에 다음 환경 변수를 추가하세요:

```bash
# Zuku Proxy API 설정
ALIMTALK_API_BASE_URL=http://localhost:3000  # 개발 환경
# ALIMTALK_API_BASE_URL=https://your-app.fly.dev  # 프로덕션
ALIMTALK_API_KEY=9ef6fdfd-d390-4ba4-a836-a6ac4963f45f

# 템플릿 ID (선택사항)
ALIMTALK_TEMPLATE_ID=351J9e9RAH1GdhPQGVgM8HFpBgA
```

**주의:** Next.js에서 클라이언트 사이드에서 환경 변수를 사용하려면 `NEXT_PUBLIC_` 접두사를 붙여야 합니다.

---

## 추가 참고사항

1. **Rate Limiting**: 대량 발송 시 API Rate Limit을 고려하여 적절한 딜레이를 추가하세요. (현재 100ms 딜레이 적용)

2. **전화번호 형식**:
   - 하이픈 포함: `010-1234-5678` ✅
   - 하이픈 제거: `01012345678` ✅
   - 서버에서 자동으로 하이픈을 제거하여 처리합니다.

3. **템플릿 변수**:
   - 템플릿에 정의된 변수명과 정확히 일치해야 합니다.
   - 예: `#{studentName}` → `variables: { studentName: '홍길동' }`

4. **SMS 대체발송**:
   - 알림톡 전송 실패 시 SMS로 대체 발송 가능
   - `smsSender` 파라미터에 발신번호 입력 (선택사항)

5. **테스트**:
   - Swagger UI(`/api-docs`)에서 직접 API 테스트 가능
   - 개발 환경에서 충분히 테스트 후 프로덕션 적용 권장

---

## 문의 및 지원

- GitHub Issues: https://github.com/your-repo/zuku-proxy/issues
- Swagger 문서: http://localhost:3000/api-docs
- Sendon API 문서: https://sdk.sendon.io/
