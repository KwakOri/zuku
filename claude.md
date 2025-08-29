# 프로젝트 설명

학원에서 사용할 "시간표 관리 앱"을 Next.js + React + TypeScript + Tailwind CSS 기반으로 구현하려고 합니다.  
이 앱은 강사가 반/학생 단위 수업 시간표를 관리하고, 학생과 학부모는 시간표를 조회할 수 있는 구조입니다.

# 기술 스택

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- dnd-kit (드래그 앤 드롭)
- rrule (반복/예외 일정 처리)
- date-fns (날짜/시간 계산)
- lucide-react (아이콘)

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
   - 더미 데이터(mockData)로 동작 가능해야 함

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

# 최종 목표

위 요구사항을 만족하는 Next.js 프로젝트 예시 코드를 생성해 주세요.
