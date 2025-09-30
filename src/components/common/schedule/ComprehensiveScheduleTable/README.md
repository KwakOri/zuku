# ComprehensiveScheduleTable 컴포넌트

학생들의 종합 시간표를 엑셀 형태로 보여주는 테이블 컴포넌트입니다.

## 기능

### 📊 종합 시간표 표시
- 학생 정보 (ID, 이름, 학교, 학년)와 주간 시간표를 한 화면에 표시
- 평일: 오후 4시~10시 (16:00~22:00)  
- 주말: 오전 10시~오후 10시 (10:00~22:00)

### 🔍 필터 및 검색
- 학생명 또는 ID로 실시간 검색
- 학년별 필터링
- 검색 결과 실시간 업데이트

### 📱 반응형 디자인
- 모바일 및 태블릿 대응
- 스티키 헤더로 학생 정보 항상 표시
- 가로 스크롤 시 학생 정보 고정

### 🖨️ 인쇄 기능
- 브라우저 인쇄 기능 지원
- 인쇄 시 최적화된 레이아웃
- 가로 방향 인쇄 권장

### 🎨 시각적 구분
- 수업별 색상 구분
- 수업과 개인 일정 구분 표시
- 호버 효과와 툴팁 제공

## 사용 방법

```tsx
import ComprehensiveScheduleTable from '@/components/ComprehensiveScheduleTable';

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-full mx-auto px-4">
        <ComprehensiveScheduleTable />
      </div>
    </main>
  );
}
```

## 데이터 구조

컴포넌트는 다음 mock 데이터를 사용합니다:
- `students`: 학생 정보
- `classes`: 수업 정보  
- `classStudents`: 학생-수업 관계
- `studentSchedules`: 학생 개인 일정

## 타입 정의

주요 타입들은 다음 파일에서 정의됩니다:
- `@/types/schedule.ts`: 기본 타입들
- `@/types/comprehensiveSchedule.ts`: 종합 시간표 전용 타입들

## 스타일링

- Tailwind CSS 사용
- 추가 스타일: `./styles.css`
- 인쇄용 스타일 포함

## 성능 최적화

- React.useMemo로 데이터 처리 최적화
- React.useCallback으로 렌더링 함수 메모화
- 필터링된 데이터만 렌더링

## 접근성

- 키보드 탐색 지원
- 스크린 리더 호환
- ARIA 레이블 적용
- 고대비 색상 사용

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+