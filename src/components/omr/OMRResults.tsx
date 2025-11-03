"use client";

import { GradingResult } from "@/types/omr";
import { CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

interface OMRResultsProps {
  results: GradingResult[];
}

export default function OMRResults({ results }: OMRResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        채점 결과가 없습니다.
      </div>
    );
  }

  const handleDownloadCSV = () => {
    // CSV 생성
    const headers = ["파일명", "점수", "정답수", "오답수", "미응답"];
    const rows = results.map((result) => [
      result.fileName,
      result.score,
      result.correctCount,
      result.wrongCount,
      result.unansweredCount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // 다운로드
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `OMR채점결과_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 전체 통계 */}
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">평균 점수</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              )}
              점
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">최고 점수</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...results.map((r) => r.score))}점
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">최저 점수</p>
            <p className="text-2xl font-bold text-orange-600">
              {Math.min(...results.map((r) => r.score))}점
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </button>
      </div>

      {/* 개별 결과 */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{result.fileName}</h3>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">점수</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.score}점
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">정답률</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {result.correctCount}/{result.totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 문제별 상세 */}
            <div className="p-6">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {result.details.map((detail) => {
                  const Icon = detail.isCorrect
                    ? CheckCircle
                    : detail.studentAnswer
                    ? XCircle
                    : AlertCircle;
                  const colorClass = detail.isCorrect
                    ? "bg-green-50 border-green-200 text-green-700"
                    : detail.studentAnswer
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-gray-50 border-gray-200 text-gray-500";

                  return (
                    <div
                      key={detail.questionNumber}
                      className={`p-2 border rounded-lg ${colorClass} hover:shadow-sm transition-shadow`}
                      title={`문제 ${detail.questionNumber}: 학생답안 ${
                        detail.studentAnswer || "미응답"
                      }, 정답 ${detail.correctAnswer}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {detail.questionNumber}
                        </span>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="mt-1 text-xs">
                        <span className="font-semibold">
                          {detail.studentAnswer || "-"}
                        </span>
                        {!detail.isCorrect && (
                          <span className="text-gray-500">
                            {" "}
                            (→{detail.correctAnswer})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 통계 요약 */}
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">
                    정답: {result.correctCount}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-600">오답: {result.wrongCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    미응답: {result.unansweredCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
