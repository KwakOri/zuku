# 데이터베이스 마이그레이션 안내 (V2 - student_compositions 테이블)

## 변경 사항 요약

### 이전 구조의 문제점
- `class_students` 테이블에 `composition_id`가 포함되어 있어 데이터 구조가 명확하지 않음
- 학생-수업 관계와 구성 선택이 혼재됨

### 새로운 구조
```
students (학생)
    ↓
class_students (학생-수업 관계)
    ↓
student_compositions (선택한 구성: 앞타임/뒤타임 등)
    ↓
class_composition (수업 구성 정의)
```

## 테이블 구조

### student_compositions 테이블
```sql
- id: UUID (Primary Key)
- class_student_id: UUID (class_students 참조)
- composition_id: UUID (class_composition 참조)
- enrolled_date: DATE (등록 날짜)
- status: VARCHAR(20) (active/inactive)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### 제약조건
- **Unique Constraint**: `(class_student_id, composition_id, status)` 조합이 고유
- **Foreign Keys**:
  - `class_student_id` → `class_students(id)` ON DELETE CASCADE
  - `composition_id` → `class_composition(id)` ON DELETE CASCADE

## 마이그레이션 적용 방법

### ⚠️ 주의사항
이 마이그레이션은 **기존 데이터를 삭제**할 수 있습니다!
프로덕션 환경에서는 반드시 **백업**을 먼저 수행하세요.

### 방법 1: Supabase 대시보드 (권장)

1. Supabase 프로젝트 대시보드 접속
2. **SQL Editor** 클릭
3. **New Query** 클릭
4. `migration_create_student_compositions.sql` 파일 내용 복사/붙여넣기
5. **Run** 클릭

### 방법 2: Supabase CLI

```bash
supabase db execute -f migration_create_student_compositions.sql
```

## 마이그레이션 단계 설명

### Step 1: student_compositions 테이블 생성
새로운 테이블을 생성하여 학생이 선택한 구성(앞타임/뒤타임)을 저장합니다.

### Step 2: 인덱스 생성
조회 성능을 위한 인덱스를 생성합니다.

### Step 3: 자동 업데이트 트리거
`updated_at` 컬럼이 자동으로 업데이트되도록 설정합니다.

### Step 4: class_students에서 composition_id 제거
더 이상 필요하지 않은 컬럼을 제거합니다.

### Step 5: class_students의 unique constraint 수정
`(class_id, student_id, status)` 조합이 고유하도록 변경합니다.

### Step 6: Row Level Security (RLS) 설정
보안 정책을 설정합니다.

## 기존 데이터 마이그레이션

만약 `class_students` 테이블에 이미 `composition_id` 데이터가 있다면, SQL 파일의 Step 7 주석을 해제하고 실행하세요:

```sql
INSERT INTO student_compositions (class_student_id, composition_id, enrolled_date, status)
SELECT
  id as class_student_id,
  composition_id,
  enrolled_date,
  status
FROM class_students
WHERE composition_id IS NOT NULL;
```

## 애플리케이션 코드 변경 필요

마이그레이션 후 다음 파일들을 수정해야 합니다:

1. **타입 정의**: `src/types/supabase.ts`
   - `student_compositions` 테이블 타입 추가

2. **API 라우트**:
   - `src/app/api/class-students/route.ts` - POST 로직 변경
   - `src/app/api/student-compositions/route.ts` - 새로 생성

3. **Client Services**:
   - `src/services/client/studentCompositionApi.ts` - 새로 생성

4. **React Query Hooks**:
   - `src/queries/useStudentCompositions.ts` - 새로 생성
   - `src/queries/useClassStudents.ts` - 로직 수정

5. **컴포넌트**:
   - `src/components/students/ClassEnrollmentModal.tsx` - 등록 로직 변경

## 데이터 흐름 (변경 후)

### 학생 수업 등록 시:
```
1. class_students 테이블에 학생-수업 관계 생성
   → class_id, student_id, enrolled_date, status

2. student_compositions 테이블에 선택한 구성 저장 (여러 개 가능)
   → class_student_id, composition_id (앞타임)
   → class_student_id, composition_id (뒤타임)
```

### 학생 시간표 조회 시:
```sql
SELECT
  s.name,
  c.title,
  comp.day_of_week,
  comp.start_time,
  comp.end_time,
  comp.type
FROM students s
JOIN class_students cs ON s.id = cs.student_id
JOIN student_compositions sc ON cs.id = sc.class_student_id
JOIN class_composition comp ON sc.composition_id = comp.id
JOIN classes c ON cs.class_id = c.id
WHERE s.id = ? AND cs.status = 'active' AND sc.status = 'active';
```

## 롤백 방법

문제가 발생하면 다음 순서로 롤백:

```sql
-- 1. RLS 정책 삭제
DROP POLICY IF EXISTS "Anyone can view student compositions" ON student_compositions;
DROP POLICY IF EXISTS "Authenticated users can insert student compositions" ON student_compositions;
DROP POLICY IF EXISTS "Authenticated users can update student compositions" ON student_compositions;
DROP POLICY IF EXISTS "Authenticated users can delete student compositions" ON student_compositions;

-- 2. 트리거 삭제
DROP TRIGGER IF EXISTS trigger_student_compositions_updated_at ON student_compositions;
DROP FUNCTION IF EXISTS update_student_compositions_updated_at();

-- 3. 인덱스 삭제
DROP INDEX IF EXISTS idx_student_compositions_class_student;
DROP INDEX IF EXISTS idx_student_compositions_composition;
DROP INDEX IF EXISTS idx_student_compositions_status;

-- 4. 테이블 삭제
DROP TABLE IF EXISTS student_compositions;

-- 5. class_students 테이블 원상복구
ALTER TABLE class_students ADD COLUMN composition_id UUID REFERENCES class_composition(id);
DROP INDEX IF EXISTS class_students_unique_enrollment;
ALTER TABLE class_students
  ADD CONSTRAINT class_students_class_id_student_id_key
  UNIQUE (class_id, student_id);
```

## 확인 사항

마이그레이션 후 확인:

```sql
-- student_compositions 테이블 존재 확인
SELECT * FROM student_compositions LIMIT 1;

-- 제약조건 확인
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'student_compositions';

-- 인덱스 확인
SELECT indexname FROM pg_indexes
WHERE tablename = 'student_compositions';
```

## 다음 단계

1. ✅ 데이터베이스 마이그레이션 실행
2. ⏭️ TypeScript 타입 정의 업데이트
3. ⏭️ API 라우트 구현
4. ⏭️ Client Services 구현
5. ⏭️ React Query Hooks 구현
6. ⏭️ UI 컴포넌트 수정

준비되면 다음 단계로 진행하겠습니다! 🚀
