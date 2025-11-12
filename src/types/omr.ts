// OMR 관련 타입 정의

/**
 * 검출된 원형 마킹 영역
 */
export interface Circle {
  x: number; // 중심 X 좌표
  y: number; // 중심 Y 좌표
  radius: number; // 반지름
  filled: boolean; // 마킹 여부
}

/**
 * OMR 그리드 구조 (2D 배열)
 */
export type OMRGrid = Circle[][];

/**
 * 학생 답안 (문제번호: 선택지)
 */
export interface StudentAnswers {
  [questionNumber: number]: string;
}

/**
 * 정답지
 */
export interface AnswerKey {
  [questionNumber: number]: string;
}

/**
 * 채점 결과
 */
export interface GradingResult {
  fileName: string;
  studentAnswers: StudentAnswers;
  correctAnswers: AnswerKey;
  score: number; // 점수
  totalQuestions: number; // 전체 문제 수
  correctCount: number; // 맞은 문제 수
  wrongCount: number; // 틀린 문제 수
  unansweredCount: number; // 미응답 문제 수
  details: QuestionDetail[]; // 문제별 상세 결과
}

/**
 * 문제별 채점 상세
 */
export interface QuestionDetail {
  questionNumber: number;
  studentAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

/**
 * OMR 처리 결과
 */
export interface OMRProcessResult {
  fileName: string;
  answers: StudentAnswers;
  totalDetected: number; // 검출된 문제 수
  processedAt: Date;
  imageUrl?: string; // 미리보기 이미지 URL (선택사항)
  alignedImageBase64?: string; // 정렬된 이미지 (base64)
  detectedAngle?: number; // 검출된 각도
  alignmentSuccess?: boolean; // 정렬 성공 여부
}

/**
 * OMR 처리 요청
 */
export interface OMRProcessRequest {
  images: File[];
}

/**
 * OMR 채점 요청
 */
export interface OMRGradeRequest {
  processResults: OMRProcessResult[];
  answerKey: AnswerKey;
  totalQuestions: number; // 실제 문항 개수
}

/**
 * 이미지 처리 설정
 */
export interface ImageProcessingConfig {
  threshold: number; // 이진화 임계값 (0-255)
  minCircleRadius: number; // 최소 원 반지름
  maxCircleRadius: number; // 최대 원 반지름
  gridTolerance: number; // 그리드 정렬 허용 오차 (px)
  fillThreshold: number; // 마킹 판정 임계값 (0-1)
}

/**
 * 기본 이미지 처리 설정
 */
export const DEFAULT_CONFIG: ImageProcessingConfig = {
  threshold: 128,
  minCircleRadius: 10,
  maxCircleRadius: 20,
  gridTolerance: 20,
  fillThreshold: 0.5,
};

// ========================================
// Python API 관련 타입 정의
// ========================================

/**
 * Python API 이미지 정렬 요청
 */
export interface PythonAlignRequest {
  scan: File;
  method?: "sift" | "contour";
  enhance?: boolean;
  return_image?: boolean;
}

/**
 * Python API 이미지 정렬 응답 (return_image=false)
 */
export interface PythonAlignResponse {
  success: boolean;
  message: string;
  metadata?: {
    success: boolean;
    method: string;
    width: number;
    height: number;
    processing_time: number;
  };
}

/**
 * Python API 답안 검출 요청
 */
export interface PythonDetectRequest {
  scan: File;
  method?: "sift" | "contour";
  threshold?: number;
}

/**
 * Python API 답안 검출 응답
 */
export interface PythonDetectResponse {
  success: boolean;
  message: string;
  detected_answers: Record<string, number | null>;
  statistics: {
    total_questions: number;
    answered: number;
    blank: number;
  };
}

/**
 * Python API 채점 요청
 */
export interface PythonGradeRequest {
  scan: File;
  answer_key: number[];
  method?: "sift" | "contour";
  threshold?: number;
  score_per_question?: number;
}

/**
 * Python API 채점 상세 (문제별)
 */
export interface PythonGradingDetail {
  question: number;
  marked: number | null;
  correct_answer: number;
  is_correct: boolean;
  status: "correct" | "wrong" | "blank";
}

/**
 * Python API 채점 응답
 */
export interface PythonGradingResponse {
  success: boolean;
  message: string;
  grading: {
    total_score: number;
    max_score: number;
    correct: number;
    wrong: number;
    blank: number;
    accuracy: number;
    details: PythonGradingDetail[];
  };
}

/**
 * Python API 배치 처리 요청
 */
export interface PythonBatchGradeRequest {
  scans: File[];
  answer_key: number[];
  method?: "sift" | "contour";
  threshold?: number;
  score_per_question?: number;
}

/**
 * Python API 배치 처리 응답
 */
export interface PythonBatchGradeResponse {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  average_score: number;
  results: {
    index: number;
    filename: string;
    success: boolean;
    grading: PythonGradingResponse["grading"];
  }[];
}

/**
 * Python API 에러 응답
 */
export interface PythonAPIError {
  success: false;
  error: string;
  detail?: string;
}

/**
 * OMR 마킹 좌표 (수동 설정용)
 */
export interface OMRMarkerPosition {
  questionNumber: number; // 문제 번호
  optionNumber: number; // 선택지 번호 (1~5)
  x: number; // X 좌표 (%)
  y: number; // Y 좌표 (%)
  width: number; // 너비 (%)
  height: number; // 높이 (%)
}

/**
 * 정렬 마커 (기준점)
 */
export interface AlignmentMarkerPosition {
  x: number; // X 좌표 (%)
  y: number; // Y 좌표 (%)
  width: number; // 너비 (%)
  height: number; // 높이 (%)
}

/**
 * OMR 템플릿 (좌표 정보 저장)
 */
export interface OMRTemplate {
  id?: string;
  name: string; // 템플릿 이름
  totalQuestions: number; // 전체 문항 수
  optionsPerQuestion: number; // 문항당 선택지 수
  markers: OMRMarkerPosition[]; // 마킹 위치 배열
  alignmentMarkers?: AlignmentMarkerPosition[]; // 정렬 기준점 (오른쪽 하단 2개)
  imageUrl?: string; // 템플릿 이미지 URL
  createdAt?: Date;
  updatedAt?: Date;
}
