"use client";

import { useState } from "react";
import { useBatchGradeExams, useDetectAnswers } from "@/queries/useOMRPython";
import { PythonGradingResponse } from "@/types/omr";
import {
  Upload,
  FileText,
  CheckSquare,
  Loader2,
  Eye,
  AlertCircle,
} from "lucide-react";

export default function OMRPythonGradingPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [answerKey, setAnswerKey] = useState<number[]>(
    Array(45).fill(0)
  );
  const [currentTab, setCurrentTab] = useState<
    "upload" | "answer" | "results"
  >("upload");
  const [gradingResults, setGradingResults] = useState<
    PythonGradingResponse["grading"][] | null
  >(null);
  const [batchSummary, setBatchSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
    average_score: number;
  } | null>(null);

  const batchGrade = useBatchGradeExams();
  const detectAnswers = useDetectAnswers();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleAnswerChange = (index: number, value: number) => {
    const newAnswerKey = [...answerKey];
    newAnswerKey[index] = value;
    setAnswerKey(newAnswerKey);
  };

  const handleBatchGrade = async () => {
    if (selectedFiles.length === 0) {
      alert("이미지를 먼저 선택해주세요.");
      return;
    }

    const validAnswers = answerKey.filter((ans) => ans >= 1 && ans <= 5);
    if (validAnswers.length !== 45) {
      alert("45개의 정답을 모두 입력해주세요.");
      return;
    }

    try {
      const result = await batchGrade.mutateAsync({
        imageFiles: selectedFiles,
        answerKey,
      });

      if (result.success) {
        setGradingResults(result.results.map((r) => r.grading));
        setBatchSummary({
          total: result.total,
          successful: result.successful,
          failed: result.failed,
          average_score: result.average_score,
        });
        setCurrentTab("results");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "채점에 실패했습니다.";
      console.error("Batch grade error:", error);

      // 502 에러 특별 처리
      if (errorMessage.includes("502") || errorMessage.includes("Bad Gateway")) {
        alert(
          "⚠️ Python API 서버가 응답하지 않습니다.\n\n" +
          "Render 무료 플랜의 경우 서버가 sleep 모드에 들어가 있을 수 있습니다.\n" +
          "서버가 깨어나는데 30초~1분 정도 소요됩니다.\n\n" +
          "잠시 후 다시 시도해주세요. 🔄"
        );
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleQuickFill = (value: number) => {
    setAnswerKey(Array(45).fill(value));
  };

  return (
    <div className="p-6 mx-auto bg-white max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Python OMR 자동 채점</h1>
        <p className="text-gray-600">
          Python AI 모델을 사용한 고정밀 OMR 시험지 채점
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setCurrentTab("upload")}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "upload"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            1. 이미지 업로드
          </div>
        </button>

        <button
          onClick={() => setCurrentTab("answer")}
          disabled={selectedFiles.length === 0}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "answer"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          } ${
            selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            2. 정답 입력
          </div>
        </button>

        <button
          onClick={() => setCurrentTab("results")}
          disabled={!gradingResults}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "results"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          } ${!gradingResults ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            3. 채점 결과
          </div>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {currentTab === "upload" && (
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="mb-2 font-semibold text-gray-700">
                  OMR 시험지 이미지를 업로드하세요
                </p>
                <p className="text-sm text-gray-600">
                  JPG, PNG 형식 지원 (여러 파일 선택 가능)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full max-w-xs text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h3 className="mb-2 font-semibold text-blue-900">
                선택된 파일: {selectedFiles.length}개
              </h3>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-blue-700">
                    {index + 1}. {file.name} ({(file.size / 1024).toFixed(1)}{" "}
                    KB)
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentTab("answer")}
                className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                다음: 정답 입력
              </button>
            </div>
          )}

          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="mb-1 font-semibold text-yellow-900">
                  사용 안내
                </h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• 45문항 5지선다형 시험지만 지원됩니다.</li>
                  <li>• 이미지는 10MB 이하를 권장합니다.</li>
                  <li>• Python AI 모델이 자동으로 이미지를 정렬하고 채점합니다.</li>
                  <li>
                    <strong>⚠️ 중요:</strong> Render 무료 플랜 사용 시 서버가 sleep
                    모드에 들어가 있을 수 있습니다. 첫 요청 시 서버 활성화로
                    30초~1분 정도 소요될 수 있습니다.
                  </li>
                  <li>• 502 에러 발생 시 1~2분 후 다시 시도해주세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === "answer" && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <h3 className="mb-2 font-semibold text-blue-900">
              파일 {selectedFiles.length}개 선택됨
            </h3>
            <p className="text-sm text-blue-700">
              정답을 입력하고 채점을 시작하세요.
            </p>
          </div>

          {/* 빠른 입력 */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="mb-3 font-semibold text-gray-700">
              빠른 정답 입력
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleQuickFill(num)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                >
                  모두 {num}번
                </button>
              ))}
            </div>
          </div>

          {/* 정답 입력 그리드 */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">정답 입력 (45문항)</h3>
              <span className="text-sm text-gray-600">
                {answerKey.filter((ans) => ans >= 1 && ans <= 5).length} / 45
                입력완료
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 md:grid-cols-9">
              {Array.from({ length: 45 }, (_, i) => i).map((index) => (
                <div key={index} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    {index + 1}번
                  </label>
                  <select
                    value={answerKey[index] || ""}
                    onChange={(e) =>
                      handleAnswerChange(index, parseInt(e.target.value) || 0)
                    }
                    className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-</option>
                    <option value="1">①</option>
                    <option value="2">②</option>
                    <option value="3">③</option>
                    <option value="4">④</option>
                    <option value="5">⑤</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCurrentTab("upload")}
                className="px-6 py-3 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={handleBatchGrade}
                disabled={
                  batchGrade.isPending ||
                  answerKey.filter((ans) => ans >= 1 && ans <= 5).length !== 45
                }
                className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {batchGrade.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    채점 중... (서버가 sleep 모드인 경우 최대 1분 소요)
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    채점 시작
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentTab === "results" && gradingResults && batchSummary && (
        <div className="space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="text-sm font-medium text-blue-700">
                전체 답안지
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-900">
                {batchSummary.total}개
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="text-sm font-medium text-green-700">
                채점 성공
              </div>
              <div className="mt-1 text-2xl font-bold text-green-900">
                {batchSummary.successful}개
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="text-sm font-medium text-red-700">채점 실패</div>
              <div className="mt-1 text-2xl font-bold text-red-900">
                {batchSummary.failed}개
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
              <div className="text-sm font-medium text-purple-700">평균 점수</div>
              <div className="mt-1 text-2xl font-bold text-purple-900">
                {batchSummary.average_score.toFixed(1)}점
              </div>
            </div>
          </div>

          {/* 개별 결과 */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">개별 채점 결과</h3>
            </div>
            <div className="divide-y">
              {gradingResults.map((result, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      답안지 #{index + 1}
                    </h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        정답률: {result.accuracy.toFixed(1)}%
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {result.total_score} / {result.max_score}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>정답: {result.correct}개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>오답: {result.wrong}개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>미응답: {result.blank}개</span>
                    </div>
                  </div>

                  {result.details.filter((d) => !d.is_correct).length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">
                        틀린 문제:{" "}
                      </span>
                      <span className="text-sm text-red-600">
                        {result.details
                          .filter((d) => !d.is_correct)
                          .map((d) => d.question)
                          .join(", ")}번
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => {
                setCurrentTab("upload");
                setSelectedFiles([]);
                setGradingResults(null);
                setBatchSummary(null);
              }}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              새로운 채점 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
