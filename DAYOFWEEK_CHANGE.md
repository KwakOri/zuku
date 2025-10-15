# 요일 시스템 변경 사항

## 변경 내용

### 기존 시스템
- **일요일 시작**: 0 = 일요일, 1 = 월요일, ..., 6 = 토요일
- JavaScript `Date.getDay()` 기본 동작과 동일

### 변경된 시스템
- **월요일 시작**: 0 = 월요일, 1 = 화요일, ..., 6 = 일요일
- 주간 시간표가 월요일부터 시작하도록 변경

## 수정된 파일

### 1. 상수 및 타입 정의
- `src/constants/schedule.ts`
  - `DAYS_OF_WEEK`: `["월", "화", "수", "목", "금", "토", "일"]`
  - `DAYS_OF_WEEK_FULL`: `["월요일", "화요일", ..., "일요일"]`
  - 주석 업데이트: 0 = 월요일, 6 = 일요일

- `src/types/schedule.ts`
  - `ScheduleConfig.firstDayOfWeek` 주석 업데이트
  - 관련 인터페이스 주석 업데이트

### 2. 유틸리티 함수
- `src/lib/utils.ts`
  - `convertJsDayToMondayBased(jsDay: number)`: JavaScript Date.getDay() → 월요일 기준 변환
  - `convertMondayBasedToJsDay(mondayBasedDay: number)`: 월요일 기준 → JavaScript Date.getDay() 변환
  - `defaultScheduleConfig.firstDayOfWeek`: 0으로 설정 (월요일 시작)

### 3. 컴포넌트
- `src/components/middle-records/MiddleSchoolRecordManager.tsx`
  - 주간 시작일 계산 로직에 `convertJsDayToMondayBased` 적용

- 기타 스케줄 관련 컴포넌트
  - `DAYS_OF_WEEK` 상수 사용 시 자동으로 월요일부터 표시됨

## 데이터베이스 영향

### 기존 데이터 처리
**기존 데이터는 모두 삭제 예정**이므로 마이그레이션 불필요

### 새로운 데이터 입력
- `day_of_week` 필드에 저장되는 값:
  - 0 = 월요일
  - 1 = 화요일
  - 2 = 수요일
  - 3 = 목요일
  - 4 = 금요일
  - 5 = 토요일
  - 6 = 일요일

### 영향받는 테이블
- `classes` (day_of_week)
- `student_schedules` (day_of_week)
- `class_composition` (day_of_week)

## 개발 가이드

### JavaScript Date 객체 사용 시 주의사항

```typescript
// ❌ 잘못된 사용
const jsDay = new Date().getDay(); // 0=일요일
const dayName = DAYS_OF_WEEK[jsDay]; // 잘못된 매칭!

// ✅ 올바른 사용
import { convertJsDayToMondayBased } from "@/lib/utils";

const jsDay = new Date().getDay();
const mondayBasedDay = convertJsDayToMondayBased(jsDay);
const dayName = DAYS_OF_WEEK[mondayBasedDay]; // 정확한 매칭
```

### DB 저장 시
```typescript
// 현재 요일을 DB에 저장할 때
const today = new Date();
const dayOfWeek = convertJsDayToMondayBased(today.getDay());
// dayOfWeek를 DB에 저장 (0=월요일)
```

### DB 조회 후 Date 객체 생성 시
```typescript
// DB에서 조회한 dayOfWeek를 JavaScript Date로 사용할 때
import { convertMondayBasedToJsDay } from "@/lib/utils";

const dbDayOfWeek = 0; // DB의 월요일
const jsDay = convertMondayBasedToJsDay(dbDayOfWeek); // 1 (JavaScript의 월요일)
```

### 요일 표시
```typescript
import { DAYS_OF_WEEK, getDayOfWeekLabel } from "@/constants/schedule";

// 간단한 표시
const dayName = DAYS_OF_WEEK[dayOfWeek]; // "월", "화", ...

// 함수 사용
const shortLabel = getDayOfWeekLabel(dayOfWeek, "short"); // "월"
const fullLabel = getDayOfWeekLabel(dayOfWeek, "full"); // "월요일"
```

## 테스트 체크리스트

- [ ] 시간표 UI가 월요일부터 일요일 순서로 표시되는지 확인
- [ ] 새 일정 생성 시 `day_of_week`가 올바르게 저장되는지 확인
- [ ] 주간 기록 관리에서 이번 주 월요일이 정확히 계산되는지 확인
- [ ] 일정 수정 시 요일 정보가 올바르게 유지되는지 확인
- [ ] 밀집도 표시에서 요일이 올바르게 매칭되는지 확인

## 주의사항

1. **기존 데이터 삭제**: 이 변경 사항 적용 전 모든 일정 데이터를 삭제해야 합니다.
2. **일관성 유지**: 새로운 코드에서는 항상 `DAYS_OF_WEEK` 상수를 사용하세요.
3. **변환 함수 사용**: JavaScript Date 객체와 상호작용할 때는 반드시 변환 함수를 사용하세요.
4. **주석 확인**: 코드 주석에서 요일 범위가 명시된 부분을 확인하고 수정하세요.
