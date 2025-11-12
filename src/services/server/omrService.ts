/**
 * OMR 서버 서비스
 * Python OMR API를 호출하는 서버 사이드 함수
 */

import {
  PythonAlignResponse,
  PythonAPIError,
  PythonBatchGradeResponse,
  PythonDetectResponse,
  PythonGradingResponse,
} from "@/types/omr";

// Python API 환경 변수
const PYTHON_API_URL = process.env.PYTHON_OMR_API_URL;
const PYTHON_API_KEY = process.env.PYTHON_OMR_API_KEY;
const PYTHON_API_LOCAL_URL = process.env.PYTHON_OMR_API_LOCAL_URL;
const NODE_ENV = process.env.NODE_ENV;

/**
 * Python API 기본 URL 가져오기
 */
function getPythonAPIUrl(): string {
  console.log("Environment check:");
  console.log("- NODE_ENV:", NODE_ENV);
  console.log("- PYTHON_API_URL:", PYTHON_API_URL ? "SET" : "NOT SET");
  console.log("- PYTHON_API_KEY:", PYTHON_API_KEY ? "SET" : "NOT SET");

  // 개발 환경에서는 localhost:8080 사용
  if (NODE_ENV === "development") {
    const localUrl = PYTHON_API_LOCAL_URL as string;
    console.log("Development mode - using local Python API:", localUrl);
    return localUrl;
  }

  // Production 환경에서는 환경 변수 필수
  if (!PYTHON_API_URL) {
    console.error("ERROR: PYTHON_OMR_API_URL environment variable is not set!");
    throw new Error(
      "PYTHON_OMR_API_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요."
    );
  }
  return PYTHON_API_URL;
}

/**
 * Python API 헤더 생성
 */
function getAPIHeaders(): HeadersInit {
  const headers: HeadersInit = {};

  if (PYTHON_API_KEY) {
    headers["X-API-Key"] = PYTHON_API_KEY;
  }

  return headers;
}

/**
 * 이미지 정렬 API 호출
 */
export async function alignImage(
  imageFile: File,
  method: "sift" | "contour" = "sift",
  enhance: boolean = true,
  returnImage: boolean = false
): Promise<PythonAlignResponse | Blob> {
  const baseUrl = getPythonAPIUrl();
  const formData = new FormData();

  formData.append("scan", imageFile);
  formData.append("method", method);
  formData.append("enhance", enhance.toString());
  formData.append("return_image", returnImage.toString());

  const response = await fetch(`${baseUrl}/api/align`, {
    method: "POST",
    headers: getAPIHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error: PythonAPIError = await response.json();
    throw new Error(
      error.detail || error.error || "이미지 정렬에 실패했습니다."
    );
  }

  // 이미지 반환인 경우 Blob으로 반환
  if (returnImage) {
    return await response.blob();
  }

  // JSON 응답
  return await response.json();
}

/**
 * OMR 답안 검출 API 호출 (채점하지 않음)
 */
export async function detectAnswers(
  imageFile: File,
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35
): Promise<PythonDetectResponse> {
  const baseUrl = getPythonAPIUrl();
  const formData = new FormData();

  formData.append("scan", imageFile);
  formData.append("method", method);
  formData.append("threshold", threshold.toString());

  const response = await fetch(`${baseUrl}/api/grade/detect`, {
    method: "POST",
    headers: getAPIHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error: PythonAPIError = await response.json();
    throw new Error(error.detail || error.error || "답안 검출에 실패했습니다.");
  }

  return await response.json();
}

/**
 * OMR 자동 채점 API 호출
 */
export async function gradeExam(
  imageFile: File,
  answerKey: number[],
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35,
  scorePerQuestion: number = 1.0
): Promise<PythonGradingResponse> {
  const baseUrl = getPythonAPIUrl();
  const formData = new FormData();

  console.log("=== Single Grade Request ===");
  console.log("Python API URL:", baseUrl);
  console.log("Image file:", imageFile.name, `(${imageFile.size} bytes)`);
  console.log("Answer key length:", answerKey.length);

  formData.append("scan", imageFile);
  formData.append("answer_key", JSON.stringify(answerKey));
  formData.append("method", method);
  formData.append("threshold", threshold.toString());
  formData.append("score_per_question", scorePerQuestion.toString());

  console.log("Sending request to:", `${baseUrl}/api/grade`);

  // AbortController로 타임아웃 설정 (3분)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3 * 60 * 1000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/grade`, {
      method: "POST",
      headers: getAPIHeaders(),
      body: formData,
      signal: controller.signal,
    });
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === "AbortError") {
      throw new Error(
        "Python API 서버 응답 시간 초과 (3분). 서버가 sleep 모드에서 깨어나지 못했거나 이미지 처리 중입니다."
      );
    }
    throw new Error(`Python API 서버 연결 실패: ${fetchError.message}`);
  }
  clearTimeout(timeoutId);

  console.log("Response status:", response.status);

  const responseText = await response.text();
  console.log("Response text length:", responseText.length);
  console.log("Response text preview:", responseText.substring(0, 500));

  if (!response.ok) {
    console.error("API Error - Full response:", responseText);

    // 502 Bad Gateway
    if (response.status === 502) {
      throw new Error(
        "Python API 서버가 응답하지 않습니다 (502 Bad Gateway). " +
          "Render 무료 플랜의 경우 서버가 sleep 모드에 들어갔을 수 있습니다. " +
          "몇 분 후 다시 시도하거나, Python API 서버 상태를 확인해주세요. " +
          `서버 URL: ${baseUrl}`
      );
    }

    // 503 Service Unavailable
    if (response.status === 503) {
      throw new Error(
        "Python API 서버가 시작 중입니다 (503 Service Unavailable). " +
          "첫 요청 시 서버가 깨어나는데 30초~1분 정도 소요됩니다. " +
          "잠시 후 다시 시도해주세요."
      );
    }

    // 504 Gateway Timeout
    if (response.status === 504) {
      throw new Error(
        "Python API 서버 응답 시간 초과 (504 Gateway Timeout). " +
          "이미지 처리 시간이 너무 오래 걸리고 있습니다."
      );
    }

    // 기타 에러
    try {
      const error: PythonAPIError = JSON.parse(responseText);
      throw new Error(error.detail || error.error || "채점에 실패했습니다.");
    } catch (parseError) {
      throw new Error(
        `채점에 실패했습니다. Status: ${
          response.status
        }, Response: ${responseText.substring(0, 200)}`
      );
    }
  }

  try {
    const result = JSON.parse(responseText);
    console.log("Parsed response success:", result.success);
    return result;
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    console.error("Failed to parse:", responseText);
    throw new Error(
      "응답을 파싱할 수 없습니다: " + responseText.substring(0, 200)
    );
  }
}

/**
 * 배치 채점 API 호출
 */
export async function batchGradeExams(
  imageFiles: File[],
  answerKey: number[],
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35,
  scorePerQuestion: number = 1.0
): Promise<PythonBatchGradeResponse> {
  const baseUrl = getPythonAPIUrl();
  const formData = new FormData();

  console.log("=== Batch Grade Request ===");
  console.log("Python API URL:", baseUrl);
  console.log("Image files count:", imageFiles.length);
  console.log("Answer key length:", answerKey.length);
  console.log("Method:", method);
  console.log("Threshold:", threshold);
  console.log("Score per question:", scorePerQuestion);

  // 여러 이미지 추가
  imageFiles.forEach((file, index) => {
    console.log(`File ${index + 1}:`, file.name, `(${file.size} bytes)`);
    formData.append("scans", file);
  });

  formData.append("answer_key", JSON.stringify(answerKey));
  formData.append("method", method);
  formData.append("threshold", threshold.toString());
  formData.append("score_per_question", scorePerQuestion.toString());

  console.log("Sending request to:", `${baseUrl}/api/grade/batch`);

  // AbortController로 타임아웃 설정 (5분)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/grade/batch`, {
      method: "POST",
      headers: getAPIHeaders(),
      body: formData,
      signal: controller.signal,
    });
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === "AbortError") {
      throw new Error(
        "Python API 서버 응답 시간 초과 (5분). 서버가 sleep 모드에서 깨어나지 못했거나 이미지 처리 중입니다."
      );
    }
    throw new Error(`Python API 서버 연결 실패: ${fetchError.message}`);
  }
  clearTimeout(timeoutId);

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  // 응답 텍스트를 먼저 가져와서 로깅
  const responseText = await response.text();
  console.log("Response text length:", responseText.length);
  console.log("Response text preview:", responseText.substring(0, 500));

  if (!response.ok) {
    console.error("API Error - Full response:", responseText);

    // 502 Bad Gateway - 서버가 다운되었거나 sleep 모드
    if (response.status === 502) {
      throw new Error(
        "Python API 서버가 응답하지 않습니다 (502 Bad Gateway). " +
          "Render 무료 플랜의 경우 서버가 sleep 모드에 들어갔을 수 있습니다. " +
          "몇 분 후 다시 시도하거나, Python API 서버 상태를 확인해주세요. " +
          `서버 URL: ${baseUrl}`
      );
    }

    // 503 Service Unavailable - 서버가 시작 중
    if (response.status === 503) {
      throw new Error(
        "Python API 서버가 시작 중입니다 (503 Service Unavailable). " +
          "첫 요청 시 서버가 깨어나는데 30초~1분 정도 소요됩니다. " +
          "잠시 후 다시 시도해주세요."
      );
    }

    // 504 Gateway Timeout
    if (response.status === 504) {
      throw new Error(
        "Python API 서버 응답 시간 초과 (504 Gateway Timeout). " +
          "이미지 처리 시간이 너무 오래 걸리고 있습니다. " +
          "이미지 수를 줄이거나 이미지 크기를 줄여보세요."
      );
    }

    // 기타 에러
    try {
      const error: PythonAPIError = JSON.parse(responseText);
      throw new Error(
        error.detail || error.error || "배치 채점에 실패했습니다."
      );
    } catch (parseError) {
      throw new Error(
        `배치 채점에 실패했습니다. Status: ${
          response.status
        }, Response: ${responseText.substring(0, 200)}`
      );
    }
  }

  try {
    const result = JSON.parse(responseText);
    console.log("Parsed response success:", result.success);
    return result;
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    console.error("Failed to parse:", responseText);
    throw new Error(
      "응답을 파싱할 수 없습니다: " + responseText.substring(0, 200)
    );
  }
}

/**
 * Python API 헬스체크
 */
export async function checkHealth(): Promise<{ status: string }> {
  const baseUrl = getPythonAPIUrl();

  const response = await fetch(`${baseUrl}/health`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Python API 서버에 연결할 수 없습니다.");
  }

  return await response.json();
}
