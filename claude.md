# 프로젝트 설명

학원에서 사용할 "시간표 관리 앱"을 Next.js + React + TypeScript + Tailwind CSS 기반으로 구현하려고 합니다.  
이 앱은 강사가 반/학생 단위 수업 시간표를 관리하고, 학생과 학부모는 시간표를 조회할 수 있는 구조입니다.

# 기술 스택

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (데이터베이스)
- @tanstack/react-query (상태 관리 및 데이터 페칭)
- dnd-kit (드래그 앤 드롭)
- rrule (반복/예외 일정 처리)
- date-fns (날짜/시간 계산)
- lucide-react (아이콘)
- solapi (알림톡 발송)

# 기능 요구사항

1. **주간 시간표 UI**

   - 요일(일~토) 칼럼과 시간 그리드 표시
   - 수업 블록(ClassBlock)은 드래그 앤 드롭으로 이동 가능
   - 인라인 편집(노션 스타일)으로 과목/시간/강사 수정 가능
   - UI 버튼/아이콘은 반드시 `lucide-react` 아이콘을 사용

2. **반복/예외 처리**

   - 기본 수업은 매주 반복 (예: 매주 월/수/금 14:00~15:30 수학)
   - 특정 날짜는 예외 등록 가능 (휴강, 시간 변경)

3. **DB/타입 구조**

   - Student, Teacher, Class, ClassException, ClassStudent 인터페이스 정의

4. **사용자 흐름**
   - 강사/원장은 수업을 생성·수정·삭제 가능
   - 학생/학부모는 조회 전용 (편집 불가)
   - 시간표는 "주간 단위"로 렌더링

# 출력 형식

- TypeScript 타입 정의 (`types/schedule.ts`)
- 더미 데이터 (`lib/mockData.ts`)
- 주간 시간표 컴포넌트 (`components/WeeklySchedule.tsx`)
  - dnd-kit을 활용한 드래그 앤 드롭 구현
  - 인라인 편집 UI 제공
  - Tailwind CSS로 노션 스타일과 유사한 심플 UI
  - 아이콘은 `lucide-react` 사용 (예: Pencil, Check, X 등)

# 주의사항

- Next.js App Router 기준으로 작성
- React Server Component와 Client Component 구분 정확히
- 불필요한 의존성 최소화
- 예시 코드는 실행 가능한 상태로 제공

# API 아키텍처 규칙

**모든 데이터베이스 접근은 다음 3계층 아키텍처를 따라야 합니다:**

## 1. **API Routes (Server-side)** - `src/app/api/*/route.ts`

- Supabase 데이터베이스와 직접 통신하는 서버 API
- `@/lib/supabase-server.ts` 또는 `createAdminSupabaseClient()` 사용
- 비즈니스 로직과 데이터 검증 처리
- 서버 사이드 함수는 `src/services/server/` 폴더에 작성

## 2. **Client Services** - `src/services/client/`

- 클라이언트에서 API Routes를 호출하는 함수들
- fetch 또는 axios를 사용하여 API 엔드포인트 호출
- 에러 처리 및 타입 안전성 보장
- 예시: `getStudents()`, `createMiddleSchoolRecord()` 등

## 3. **React Query Hooks** - `src/queries/`

- useQuery, useMutation 등을 사용한 데이터 페칭 및 상태 관리
- Client Services 함수를 래핑하여 캐싱, 재시도, 낙관적 업데이트 제공
- 컴포넌트에서는 반드시 이 hooks를 사용하여 데이터 접근

## 폴더 구조 예시

```
src/
├── app/api/
│   ├── students/route.ts          # 학생 CRUD API
│   ├── notifications/route.ts     # 알림톡 발송 API
│   └── middle-records/route.ts    # 중등 기록 API
├── services/
│   ├── server/
│   │   ├── studentService.ts      # 학생 관련 서버 로직
│   │   └── notificationService.ts # 알림 관련 서버 로직
│   └── client/
│       ├── studentApi.ts          # 학생 API 클라이언트 함수
│       └── notificationApi.ts     # 알림 API 클라이언트 함수
└── queries/
    ├── useStudents.ts             # 학생 관련 React Query hooks
    └── useNotifications.ts        # 알림 관련 React Query hooks
```

## 데이터 흐름

```
Component → useQuery/useMutation → Client Service → API Route → Server Service → Supabase
```

**절대 규칙**: 컴포넌트에서 직접 Supabase 클라이언트를 호출하지 말고, 반드시 위 아키텍처를 따라 구현하세요.

# 공통 유틸리티 규칙

## 학년 표시 규칙

학생의 학년을 UI에 표시할 때는 반드시 `@/lib/utils`의 `getGrade` 함수를 사용해야 합니다.

```typescript
import { getGrade } from "@/lib/utils";

// 짧은 형식 (초1, 중2, 고3)
getGrade(grade, "half")

// 전체 형식 (초등학교 1학년, 중학교 2학년, 고등학교 3학년)
getGrade(grade, "full")
```

**예시:**
```typescript
// ❌ 잘못된 방법
<span>{student.grade}학년</span>

// ✅ 올바른 방법
<span>{getGrade(student.grade, "half")}</span>
```

**출력 형식:**
- 1~6학년: 초1, 초2, ..., 초6
- 7~9학년: 중1, 중2, 중3
- 10~12학년: 고1, 고2, 고3

# 최종 목표

위 요구사항을 만족하는 Next.js 프로젝트 예시 코드를 생성해 주세요.
