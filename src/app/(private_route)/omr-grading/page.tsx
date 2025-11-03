"use client";

import OMRResults from "@/components/omr/OMRResults";
import OMRUploader from "@/components/omr/OMRUploader";
import OMRDebugViewer from "@/components/omr/OMRDebugViewer";
import { useGradeOMR, useProcessOMR } from "@/queries/useOMR";
import { AnswerKey, GradingResult, OMRProcessResult } from "@/types/omr";
import { CheckSquare, FileText, Loader2, Settings, Eye } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function OMRGradingPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processResults, setProcessResults] = useState<OMRProcessResult[]>([]);
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [answerKey, setAnswerKey] = useState<AnswerKey>({});
  const [currentTab, setCurrentTab] = useState<"upload" | "debug" | "grade" | "results">(
    "upload"
  );
  const [questionCount, setQuestionCount] = useState<number>(45); // 문항 개수 설정

  const processOMR = useProcessOMR();
  const gradeOMR = useGradeOMR();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleProcessImages = async () => {
    if (selectedFiles.length === 0) {
      alert("이미지를 먼저 선택해주세요.");
      return;
    }

    try {
      const result = await processOMR.mutateAsync(selectedFiles);

      if (result.success) {
        setProcessResults(result.results);

        if (result.errors && result.errors.length > 0) {
          alert(
            `일부 파일 처리 실패:\n${result.errors
              .map((e) => `${e.fileName}: ${e.error}`)
              .join("\n")}`
          );
        }

        // 디버그 탭으로 이동
        setCurrentTab("debug");
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "OMR 처리에 실패했습니다."
      );
    }
  };

  const handleAnswerKeyChange = (questionNum: number, answer: string) => {
    setAnswerKey((prev) => ({
      ...prev,
      [questionNum]: answer,
    }));
  };

  const handleGrade = async () => {
    if (processResults.length === 0) {
      alert("처리된 답안지가 없습니다.");
      return;
    }

    if (Object.keys(answerKey).length === 0) {
      alert("정답을 먼저 입력해주세요.");
      return;
    }

    try {
      const result = await gradeOMR.mutateAsync({
        processResults,
        answerKey,
        totalQuestions: questionCount,
      });

      if (result.success) {
        setGradingResults(result.results);
        setCurrentTab("results");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "채점에 실패했습니다.");
    }
  };

  return (
    <div className="p-6 mx-auto bg-white max-w-7xl">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">OMR 자동 채점</h1>
        <Link
          href="/omr-template"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Settings className="h-4 w-4" />
          템플릿 편집
        </Link>
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
            <FileText className="w-4 h-4" />
            1. 이미지 업로드
          </div>
        </button>

        <button
          onClick={() => setCurrentTab("debug")}
          disabled={processResults.length === 0}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "debug"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          } ${
            processResults.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            2. 정렬 확인
          </div>
        </button>

        <button
          onClick={() => setCurrentTab("grade")}
          disabled={processResults.length === 0}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "grade"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          } ${
            processResults.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            3. 정답 입력 및 채점
          </div>
        </button>

        <button
          onClick={() => setCurrentTab("results")}
          disabled={gradingResults.length === 0}
          className={`pb-3 px-4 font-medium transition-colors ${
            currentTab === "results"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          } ${
            gradingResults.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            4. 채점 결과
          </div>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {currentTab === "upload" && (
        <div className="space-y-6">
          <OMRUploader onFilesSelected={handleFilesSelected} />

          {selectedFiles.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleProcessImages}
                disabled={processOMR.isPending}
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processOMR.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "OMR 처리 시작"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {currentTab === "debug" && (
        <OMRDebugViewer results={processResults} />
      )}

      {currentTab === "grade" && (
        <div className="space-y-6">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="mb-2 font-semibold text-blue-900">OMR 처리 완료!</h3>
            <p className="text-sm text-blue-700">
              {processResults.length}개의 답안지가 처리되었습니다.
            </p>
          </div>

          {/* 문항 개수 설정 */}
          <div className="p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">
                전체 문항 개수:
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= 100) {
                    setQuestionCount(value);
                    // 문항 개수가 줄어들면 해당 범위 밖 정답 제거
                    setAnswerKey((prev) => {
                      const newKey: AnswerKey = {};
                      for (let i = 1; i <= value; i++) {
                        if (prev[i]) {
                          newKey[i] = prev[i];
                        }
                      }
                      return newKey;
                    });
                  }
                }}
                className="w-24 px-3 py-2 font-semibold text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-600">
                (최소 1문항 ~ 최대 100문항)
              </span>
            </div>
          </div>

          {/* 정답 입력 */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">정답 입력</h3>
              <span className="text-sm text-gray-600">
                {Object.keys(answerKey).length} / {questionCount} 입력완료
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
              {Array.from({ length: questionCount }, (_, i) => i + 1).map(
                (num) => (
                  <div key={num} className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      {num}번
                    </label>
                    <select
                      value={answerKey[num] || ""}
                      onChange={(e) =>
                        handleAnswerKeyChange(num, e.target.value)
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
                )
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleGrade}
                disabled={
                  gradeOMR.isPending ||
                  Object.keys(answerKey).length !== questionCount
                }
                className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {gradeOMR.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    채점 중...
                  </>
                ) : (
                  "채점 시작"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentTab === "results" && <OMRResults results={gradingResults} />}
    </div>
  );
}
