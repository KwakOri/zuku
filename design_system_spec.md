# ZUKU 프로젝트 디자인 시스템 명세서

이 문서는 ZUKU 프로젝트의 Storybook 기반 디자인 시스템 구축을 위한 컴포넌트 명세서입니다. Atomic Design 원칙에 따라 기존 `src/components` 폴더의 컴포넌트를 분석하고 재사용 가능한 컴포넌트 구조를 제안합니다.

## 1. Atoms (아톰)

디자인의 가장 작은 단위이며, 더 이상 분해할 수 없는 기본 요소입니다.

### 1.1. Button

- **설명**: 사용자의 액션을 유도하는 버튼입니다.
- **Props**:
  - `children`: `React.ReactNode` - 버튼 내부에 표시될 텍스트나 아이콘
  - `onClick`: `() => void` - 클릭 이벤트 핸들러
  - `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` - 버튼 스타일 (주요, 보조, 위험, 고스트)
  - `size`: `'sm' | 'md' | 'lg'` - 버튼 크기
  - `disabled`: `boolean` - 비활성화 여부
  - `isLoading`: `boolean` - 로딩 상태 여부
- **States**: `default`, `hover`, `focused`, `disabled`, `loading`

### 1.2. Input

- **설명**: 사용자로부터 텍스트 입력을 받는 필드입니다.
- **Props**:
  - `value`: `string` - 입력 값
  - `onChange`: `(e: React.ChangeEvent<HTMLInputElement>) => void` - 값 변경 이벤트 핸들러
  - `placeholder`: `string` - 플레이스홀더 텍스트
  - `type`: `'text' | 'password' | 'email' | 'number'` - 입력 타입
  - `disabled`: `boolean` - 비활성화 여부
  - `isError`: `boolean` - 에러 상태 여부
- **States**: `default`, `focused`, `disabled`, `error`

### 1.3. Label

- **설명**: Input 필드의 제목을 나타내는 텍스트 라벨입니다.
- **Props**:
  - `htmlFor`: `string` - 연결할 Input의 `id`
  - `children`: `React.ReactNode` - 라벨 텍스트
  - `required`: `boolean` - 필수 필드 여부 표시

### 1.4. Tooltip

- **설명**: 특정 요소에 대한 추가 정보를 제공하는 툴팁입니다. (`Tooltip.tsx` 기반)
- **Props**:
  - `content`: `string | React.ReactNode` - 툴팁에 표시될 내용
  - `children`: `React.ReactNode` - 툴팁을 트리거할 요소
  - `position`: `'top' | 'bottom' | 'left' | 'right'` - 툴팁 표시 위치
- **States**: `visible`, `hidden`

### 1.5. Icon

- **설명**: SVG 아이콘을 표시하는 컴포넌트입니다. (`/public`의 svg 파일들 활용)
- **Props**:
  - `name`: `'file' | 'globe' | 'next' | 'vercel' | 'window' | ...` - 아이콘 이름
  - `size`: `number` - 아이콘 크기 (px)
  - `color`: `string` - 아이콘 색상

### 1.6. Badge

- **설명**: 상태나 정보를 간결하게 표시하는 작은 배지입니다. (예: 학생 학년, 수업 상태)
- **Props**:
  - `label`: `string` - 배지 텍스트
  - `colorScheme`: `'blue' | 'green' | 'red' | 'gray'` - 색상 스킴

---

## 2. Molecules (분자)

여러 개의 아톰이 결합하여 하나의 단위로 작동하는 컴포넌트 그룹입니다.

### 2.1. FormField

- **설명**: `Label`, `Input`, 그리고 에러 메시지를 포함하는 폼 필드 단위입니다.
- **구성**: `Label`, `Input`, `Text` (에러 메시지용)
- **Props**:
  - `label`: `string` - 라벨 텍스트
  - `name`: `string` - `react-hook-form` 등에서 사용할 이름
  - `errorMessage`: `string` - 표시할 에러 메시지
  - `...InputProps`: `Input` 컴포넌트의 모든 Props

### 2.2. SearchInput

- **설명**: 검색 아이콘과 함께 제공되는 검색용 Input 컴포넌트입니다.
- **구성**: `Input`, `Icon` (검색 아이콘), `Button` (초기화 버튼)
- **Props**:
  - `onSearch`: `(query: string) => void` - 검색 실행 콜백
  - `...InputProps`

### 2.3. ScheduleCell

- **설명**: 스케줄 표의 개별 셀을 나타냅니다. 수업 정보, 시간 등을 표시합니다.
- **구성**: `div`, `Text`, `Badge`
- **Props**:
  - `classInfo`: `object` - 수업 정보 객체
  - `isBooked`: `boolean` - 예약 여부
  - `isSelectable`: `boolean` - 선택 가능 여부
  - `onClick`: `() => void`
- **States**: `default`, `hover`, `selected`, `disabled`

---

## 3. Organisms (유기체)

분자와 아톰들이 결합하여 형성된 더 복잡하고 독립적인 UI 단위입니다.

### 3.1. Modal

- **설명**: 화면 위에 오버레이되어 특정 작업을 수행하게 하는 모달 창입니다. (`AddStudentModal.tsx` 등에서 공통 로직 추출)
- **구성**: `Overlay`, `ModalPanel`, `Header`, `Body`, `Footer`, `Button`
- **Props**:
  - `isOpen`: `boolean` - 모달 열림/닫힘 상태
  - `onClose`: `() => void` - 닫기 핸들러
  - `title`: `string` - 모달 제목
  - `children`: `React.ReactNode` - 모달 본문 내용
  - `footerContent`: `React.ReactNode` - 하단 버튼 등

### 3.2. StudentList

- **설명**: 학생 목록을 표시하는 컴포넌트입니다. (`StudentList.tsx` 기반)
- **구성**: `SearchInput`, `Table` (`TableHeader`, `TableRow`, `TableCell`), `Pagination`
- **Props**:
  - `students`: `Student[]` - 학생 데이터 배열
  - `onStudentClick`: `(studentId: string) => void` - 학생 클릭 이벤트
  - `isLoading`: `boolean` - 데이터 로딩 상태

### 3.3. ClassForm

- **설명**: 새로운 수업을 생성하거나 수정하는 폼입니다. (`CreateClassForm.tsx` 기반)
- **구성**: `FormField` (여러 개), `Select`, `Checkbox`, `Button`
- **Props**:
  - `onSubmit`: `(data: ClassFormData) => void` - 폼 제출 핸들러
  - `initialData`: `ClassFormData` - 수정 시 초기 데이터
  - `isLoading`: `boolean` - 제출 로딩 상태

### 3.4. ScheduleTable

- **설명**: 시간표/스케줄을 표시하는 테이블입니다. (`CanvasSchedule.tsx`, `EditableSchedule.tsx` 등의 로직을 통합/재사용)
- **구성**: `ScheduleCell` 분자들의 그리드
- **Props**:
  - `scheduleData`: `Schedule[]` - 스케줄 데이터
  - `onCellClick`: `(cellInfo: Cell) => void` - 셀 클릭 이벤트
  - `isEditable`: `boolean` - 편집 가능 여부
  - `viewMode`: `'weekly' | 'daily'` - 보기 모드

### 3.5. Header

- **설명**: 애플리케이션의 최상단에 위치하는 헤더입니다. 로고, 네비게이션, 사용자 프로필 등을 포함합니다.
- **구성**: `Logo`, `NavigationLinks`, `UserProfile`
- **Props**:
  - `user`: `User` - 현재 로그인된 사용자 정보
  - `onLogout`: `() => void` - 로그아웃 핸들러

---

## 향후 계획

1.  **Atoms 정의 및 구현**: 위에 명시된 `Button`, `Input` 등의 기본 아톰 컴포넌트를 Storybook에 먼저 추가합니다.
2.  **Molecules 구현**: 아톰을 조합하여 `FormField`와 같은 분자 컴포넌트를 구현합니다.
3.  **Organisms 리팩토링**: 기존의 복잡한 컴포넌트들 (`StudentList.tsx`, `CreateClassForm.tsx` 등)을 새로 만든 아톰과 분자를 사용하여 리팩토링하고, Storybook에 등록합니다.
4.  **전역 스타일 및 테마 적용**: 디자인 시스템 전반에 사용될 색상, 폰트, 간격 등의 디자인 토큰을 정의하고 테마로 관리합니다.
