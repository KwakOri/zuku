# OMR 자동 채점 시스템 사용 가이드

## 📋 개요

템플릿 기반 OMR 자동 채점 시스템입니다. 정확한 좌표 기반으로 마킹을 인식하여 채점합니다.

## 🗂 파일 구조

```
/public/
  omr-template.json          # 실제 분석에 사용되는 템플릿 (225개 마커 좌표)
  omr_card.jpg              # OMR 카드 이미지

/src/lib/omr/
  defaultTemplate.ts        # 템플릿 편집기 초기값
  templateAnalyzer.ts       # 템플릿 기반 OMR 분석 로직
  imageProcessor.ts         # 이미지 전처리 (최적화, 회전 보정)

/src/app/api/omr/
  process/route.ts          # OMR 이미지 처리 API
  grade/route.ts            # 채점 API

/src/components/omr/
  OMRTemplateEditor.tsx     # 템플릿 편집기
  OMRUploader.tsx           # 이미지 업로더
  OMRResults.tsx            # 채점 결과 표시

/src/app/(private_route)/
  omr-template/page.tsx     # 템플릿 편집 페이지
  omr-grading/page.tsx      # OMR 채점 페이지
```

## 🎯 주요 기능

### 1. 템플릿 설정 (`/omr-template`)

- **기본 설정**: 45문항, 5지선다, 3열 구조
- **좌표 편집**: `src/lib/omr/defaultTemplate.ts` 수정
- **실시간 미리보기**: 마커 위치를 시각적으로 확인
- **드래그 앤 드롭**: 개별 마커 위치 미세 조정
- **그룹 이동 모드**: 같은 문항의 모든 선택지를 함께 이동

### 2. OMR 채점 (`/omr-grading`)

**Step 1: 이미지 업로드**
- 여러 답안지 이미지 동시 업로드 가능
- 지원 형식: JPG, PNG
- 최대 크기: 10MB

**Step 2: 정답 입력 및 채점**
- 문항 개수 설정 (1~100)
- 정답 입력 (①~⑤)
- 채점 시작 버튼 클릭

**Step 3: 채점 결과 확인**
- 학생별 점수 및 오답 표시
- CSV 다운로드
- 상세 결과 확인

## 🔧 템플릿 좌표 수정 방법

### 방법 1: 코드로 직접 수정

`src/lib/omr/defaultTemplate.ts` 파일 수정:

```typescript
const GRID_CONFIG = {
  // 선택지 간 간격 (%)
  horizontalSpacing: 1.48,  // ①②③④⑤ 간 가로 간격
  verticalSpacing: 3.76,    // 문항 간 세로 간격

  // 마커 크기 (%)
  markerWidth: 1.4,
  markerHeight: 2,

  // 각 열의 설정
  columns: [
    { start: 1,  end: 20, startX: 59.4, startY: 17.92 },  // 1열
    { start: 21, end: 34, startX: 72.4, startY: 17.92 },  // 2열
    { start: 35, end: 45, startX: 84.5, startY: 17.92 },  // 3열
  ],
};
```

수정 후 JSON 재생성:
```bash
npm run generate-omr-template  # (필요시 package.json에 스크립트 추가)
```

### 방법 2: 편집기 사용

1. `/omr-template` 페이지 접속
2. 마커를 드래그하여 위치 조정
3. "저장" 버튼으로 JSON 다운로드
4. 다운로드한 파일을 `public/omr-template.json`에 덮어쓰기

## 📊 템플릿 구조

### JSON 형식

```json
{
  "name": "기본 OMR 템플릿 (45문항)",
  "totalQuestions": 45,
  "optionsPerQuestion": 5,
  "imageUrl": "/omr_card.jpg",
  "markers": [
    {
      "questionNumber": 1,
      "optionNumber": 1,
      "x": 59.4,        // X 위치 (%)
      "y": 17.92,       // Y 위치 (%)
      "width": 1.4,     // 너비 (%)
      "height": 2       // 높이 (%)
    },
    // ... 225개 마커 (45문항 × 5선택지)
  ]
}
```

### 좌표 시스템

- **단위**: 이미지 크기 대비 퍼센트 (%)
- **원점**: 이미지 좌상단 (0, 0)
- **범위**: X/Y 모두 0~100%

## 🔍 분석 알고리즘

### 템플릿 기반 분석 (`templateAnalyzer.ts`)

1. **이미지 전처리**
   - 크기 최적화
   - 회전 보정
   - 그레이스케일 변환

2. **마커 영역 샘플링**
   - 템플릿 좌표를 픽셀 좌표로 변환
   - 각 마커 영역의 평균 밝기 계산

3. **마킹 판단**
   - 밝기 임계값: 150 (0~255, 낮을수록 어두움)
   - 차이 임계값: 20 (가장 어두운 것과 두 번째의 차이)
   - 조건 충족 시 해당 선택지를 답으로 인식

4. **결과 반환**
   - 각 문항별 선택한 답 (1~5)
   - 마킹 없거나 불분명한 경우 빈 값

## 🛠 개발 가이드

### 임계값 조정

`src/lib/omr/templateAnalyzer.ts`:

```typescript
const MARKING_THRESHOLD = 150;      // 마킹 판단 밝기 임계값
const DIFFERENCE_THRESHOLD = 20;    // 선택지 간 차이 임계값
```

### 새 템플릿 추가

1. 새 OMR 카드 이미지를 `public/`에 추가
2. 템플릿 편집기에서 좌표 설정
3. JSON 파일 저장
4. `loadTemplate()` 함수에 경로 전달

```typescript
const template = await loadTemplate("custom-template.json");
```

## ⚠️ 주의사항

1. **이미지 품질**
   - 해상도: 최소 1000px 이상 권장
   - 조명: 균일한 조명 필요
   - 마킹: 진하고 명확하게

2. **좌표 정확도**
   - 템플릿 좌표가 실제 OMR 카드와 정확히 일치해야 함
   - 인쇄 오차를 고려하여 마커 크기를 약간 크게 설정 권장

3. **파일 관리**
   - `public/omr-template.json`이 실제 분석에 사용됨
   - `src/lib/omr/defaultTemplate.ts`는 편집기 초기값
   - 둘 중 하나를 수정하면 다른 것도 동기화 필요

## 🚀 배포 시 체크리스트

- [ ] `public/omr-template.json` 최신 버전 확인
- [ ] 실제 OMR 카드로 테스트
- [ ] 임계값 조정 필요 여부 확인
- [ ] 이미지 최대 크기 제한 확인 (현재 10MB)

## 📞 문제 해결

### 마킹 인식이 안 될 때
1. 이미지 품질 확인
2. 템플릿 좌표 확인 (`/omr-template`에서 미리보기)
3. 임계값 조정 (`MARKING_THRESHOLD`, `DIFFERENCE_THRESHOLD`)

### 좌표가 맞지 않을 때
1. OMR 카드 이미지 교체 여부 확인
2. 템플릿 편집기에서 마커 위치 재조정
3. JSON 파일 재생성

### 여러 답 선택 시
- 현재는 가장 어두운 하나만 선택
- 복수 답안 허용 필요 시 `templateAnalyzer.ts` 수정
