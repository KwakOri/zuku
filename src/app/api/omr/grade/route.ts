// OMR 채점 API

import { NextRequest, NextResponse } from "next/server";
import {
  OMRProcessResult,
  AnswerKey,
  GradingResult,
  QuestionDetail,
} from "@/types/omr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      processResults,
      answerKey,
      totalQuestions,
    }: {
      processResults: OMRProcessResult[];
      answerKey: AnswerKey;
      totalQuestions: number;
    } = body;

    if (!processResults || !answerKey || !totalQuestions) {
      return NextResponse.json(
        { success: false, error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    if (processResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "채점할 답안지가 없습니다." },
        { status: 400 }
      );
    }

    const gradingResults: GradingResult[] = [];

    for (const result of processResults) {
      const graded = gradeAnswers(result, answerKey, totalQuestions);
      gradingResults.push(graded);
    }

    return NextResponse.json({
      success: true,
      results: gradingResults,
      summary: {
        totalStudents: gradingResults.length,
        averageScore:
          gradingResults.reduce((sum, r) => sum + r.score, 0) /
          gradingResults.length,
        highestScore: Math.max(...gradingResults.map((r) => r.score)),
        lowestScore: Math.min(...gradingResults.map((r) => r.score)),
      },
    });
  } catch (error) {
    console.error("채점 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "채점 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 학생 답안을 정답과 비교하여 채점
 */
function gradeAnswers(
  processResult: OMRProcessResult,
  answerKey: AnswerKey,
  totalQuestions: number
): GradingResult {
  const details: QuestionDetail[] = [];
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  // 각 문제별로 채점
  for (let questionNumber = 1; questionNumber <= totalQuestions; questionNumber++) {
    const correctAnswer = answerKey[questionNumber];
    const studentAnswer = processResult.answers[questionNumber] || null;

    let isCorrect = false;

    if (!studentAnswer) {
      // 미응답
      unansweredCount++;
    } else if (studentAnswer === "MULTIPLE") {
      // 중복 마킹 (오답 처리)
      wrongCount++;
    } else if (studentAnswer === correctAnswer) {
      // 정답
      isCorrect = true;
      correctCount++;
    } else {
      // 오답
      wrongCount++;
    }

    details.push({
      questionNumber,
      studentAnswer: studentAnswer === "MULTIPLE" ? "중복마킹" : studentAnswer,
      correctAnswer,
      isCorrect,
    });
  }

  // 점수 계산 (100점 만점)
  const score = Math.round((correctCount / totalQuestions) * 100);

  return {
    fileName: processResult.fileName,
    studentAnswers: processResult.answers,
    correctAnswers: answerKey,
    score,
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    details,
  };
}
