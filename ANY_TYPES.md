# 프로젝트 내 `any` 타입 사용 현황

> 생성일: 2025-11-12
> 최종 업데이트: 2025-11-12
> ~~총 건수: **7건**~~ → **0건** ✅

이 문서는 프로젝트 내에서 `any` 타입이 사용되는 모든 위치를 정리하고, 모든 타입을 수정한 기록입니다.

---

## ✅ 완료 요약

**모든 `any` 타입이 Supabase 자동 생성 타입을 활용하여 적절한 타입으로 수정되었습니다.**

### 수정 전 카테고리별 분류

- ~~**Storybook 데모 코드**: 3건~~ → **삭제됨** (Storybook 프로젝트에서 제거)
- **서버 로직**: 3건 → **수정 완료** ✅
- **API 라우트**: 1건 → **수정 완료** ✅

---

## 1. ~~Storybook 데모 코드~~ (삭제됨)

### 1-1. Modal 컴포넌트 - size prop
**위치**: ~~`src/components/design-system/Modal/Modal.stories.tsx:140`~~

**상태**: ✅ **파일 삭제됨**
- Storybook이 프로젝트에서 완전히 제거되었습니다.

---

### 1-2. Modal 컴포넌트 - animation prop
**위치**: ~~`src/components/design-system/Modal/Modal.stories.tsx:182`~~

**상태**: ✅ **파일 삭제됨**
- Storybook이 프로젝트에서 완전히 제거되었습니다.

---

### 1-3. Icon 컴포넌트 - name prop
**위치**: ~~`src/components/design-system/Icon/Icon.stories.tsx:90`~~

**상태**: ✅ **파일 삭제됨**
- Storybook이 프로젝트에서 완전히 제거되었습니다.

---

## 2. 서버 로직 ✅

### 2-1. 수강 정보 타입 캐스팅
**위치**: `src/services/server/studentRenewalService.ts:410`

**수정 전:**
```typescript
const comp = enroll.class_compositions as any;  // ⚠️
```

**수정 후:**
```typescript
// Supabase 타입 활용
type EnrollmentWithComposition = RelationCompositionStudent & {
  class_compositions: Pick<ClassComposition, 'id' | 'class_id' | 'day_of_week' | 'start_time' | 'end_time' | 'type'> | null;
};

// 사용 시 null 체크
const comp = enroll.class_compositions;
if (!comp) return false;
```

**변경 사항**:
- `Database['public']['Tables']['relations_compositions_students']['Row']` 타입 활용
- `Pick` 유틸리티 타입으로 필요한 필드만 선택
- null 체크 추가하여 타입 안전성 확보

---

### 2-2. OMR 서비스 - fetch 에러 처리 (1)
**위치**: `src/services/server/omrService.ts:165`

**수정 전:**
```typescript
} catch (fetchError: any) {  // ⚠️
  clearTimeout(timeoutId);
  if (fetchError.name === "AbortError") {
    // ...
  }
  throw new Error(`Python API 서버 연결 실패: ${fetchError.message}`);
}
```

**수정 후:**
```typescript
} catch (fetchError: unknown) {  // ✅
  clearTimeout(timeoutId);
  if (fetchError instanceof Error && fetchError.name === "AbortError") {
    // ...
  }
  const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
  throw new Error(`Python API 서버 연결 실패: ${errorMessage}`);
}
```

**변경 사항**:
- `unknown` 타입 사용 (TypeScript 권장 방식)
- `instanceof Error` 타입 가드 추가
- 에러 메시지 안전하게 추출

---

### 2-3. OMR 서비스 - fetch 에러 처리 (2)
**위치**: `src/services/server/omrService.ts:284`

**수정 전:**
```typescript
} catch (fetchError: any) {  // ⚠️
  clearTimeout(timeoutId);
  if (fetchError.name === "AbortError") {
    // ...
  }
  throw fetchError;
}
```

**수정 후:**
```typescript
} catch (fetchError: unknown) {  // ✅
  clearTimeout(timeoutId);
  if (fetchError instanceof Error && fetchError.name === "AbortError") {
    // ...
  }
  const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
  throw new Error(`Python API 서버 연결 실패: ${errorMessage}`);
}
```

**변경 사항**:
- 2-2와 동일한 패턴 적용
- 일관된 에러 처리 방식 유지

---

## 3. API 라우트 ✅

### 3-1. 전체 스케줄 조회 - composition 타입
**위치**: `src/app/api/students/[id]/full-schedule/route.ts:74`

**수정 전:**
```typescript
const formattedClassSchedules = (allCompositions || []).map((comp: any) => {  // ⚠️
  console.log(`[FullSchedule] Composition: ${comp.class?.title} - ${comp.composition?.type}`);
  // ...
});
```

**수정 후:**
```typescript
// Supabase 타입 활용
type CompositionWithRelations = RelationCompositionStudent & {
  composition: Pick<ClassComposition, 'id' | 'day_of_week' | 'start_time' | 'end_time' | 'type'> | null;
  class: (Pick<Class, 'id' | 'title' | 'color' | 'room' | 'description'> & {
    subject: Pick<Subject, 'id' | 'subject_name'> | null;
    teacher: Pick<Teacher, 'id' | 'name'> | null;
  }) | null;
};

const formattedClassSchedules = (allCompositions || []).map((comp: CompositionWithRelations) => {  // ✅
  console.log(`[FullSchedule] Composition: ${comp.class?.title} - ${comp.composition?.type}`);
  // ...
});
```

**변경 사항**:
- Supabase에서 자동 생성된 테이블 타입들 활용:
  - `Database['public']['Tables']['relations_compositions_students']['Row']`
  - `Database['public']['Tables']['class_compositions']['Row']`
  - `Database['public']['Tables']['classes']['Row']`
  - `Database['public']['Tables']['subjects']['Row']`
  - `Database['public']['Tables']['teachers']['Row']`
- `Pick` 유틸리티 타입으로 SELECT 절과 일치하는 필드만 선택
- 중첩된 관계도 정확히 타입 정의

---

## 🎯 적용된 베스트 프랙티스

### 1. Supabase 자동 생성 타입 활용

```typescript
// ✅ 좋은 예
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];
type ClassComposition = Database['public']['Tables']['class_compositions']['Row'];
```

**장점:**
- 데이터베이스 스키마 변경 시 자동으로 타입 동기화
- 수동 타입 정의 불필요
- 타입 안전성 보장

---

### 2. Pick 유틸리티 타입 활용

```typescript
// ✅ 좋은 예
type EnrollmentWithComposition = RelationCompositionStudent & {
  class_compositions: Pick<ClassComposition, 'id' | 'class_id' | 'day_of_week'> | null;
};
```

**장점:**
- SELECT 절과 정확히 일치하는 필드만 포함
- 불필요한 필드 제외
- IDE 자동완성 지원

---

### 3. 에러 처리 타입 안전성

```typescript
// ❌ 나쁜 예
catch (error: any) { ... }

// ✅ 좋은 예
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

**장점:**
- TypeScript 권장 방식
- 타입 가드로 안전한 에러 처리
- 예상치 못한 에러 타입에도 대응 가능

---

## 📝 Supabase 타입 생성 명령어

프로젝트에서 Supabase 타입을 업데이트하려면:

```bash
npm run gen:types
```

또는 직접 명령:

```bash
supabase gen types typescript --project-id mkjojkbgffkoimwrpijc > src/types/supabase.ts
```

---

## ✅ 최종 체크리스트

- [x] 3-1: full-schedule/route.ts의 comp 타입 정의
- [x] 2-1: studentRenewalService.ts의 class_compositions 타입 정의
- [x] 2-2: omrService.ts:165 에러 처리 개선
- [x] 2-3: omrService.ts:284 에러 처리 개선
- [x] 1-1: Modal stories size prop → Storybook 삭제됨
- [x] 1-2: Modal stories animation prop → Storybook 삭제됨
- [x] 1-3: Icon stories name prop → Storybook 삭제됨

**모든 항목 완료!** 🎉
