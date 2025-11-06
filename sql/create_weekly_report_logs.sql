-- 주간 보고서 발송 기록 테이블
CREATE TABLE IF NOT EXISTS weekly_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL, -- 주의 월요일 날짜
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 발송 시간
  sent_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 발송자
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 주, 같은 학생, 같은 과목에 대해 중복 발송 방지
  UNIQUE(week_of, student_id, subject_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_report_logs_week_of ON weekly_report_logs(week_of);
CREATE INDEX IF NOT EXISTS idx_weekly_report_logs_student_id ON weekly_report_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_report_logs_sent_at ON weekly_report_logs(sent_at);



-- 코멘트 추가
COMMENT ON TABLE weekly_report_logs IS '주간 보고서 알림톡 발송 기록';
COMMENT ON COLUMN weekly_report_logs.week_of IS '주의 시작일 (월요일)';
COMMENT ON COLUMN weekly_report_logs.student_id IS '발송 대상 학생 ID';
COMMENT ON COLUMN weekly_report_logs.subject_id IS '발송한 과목 ID';
COMMENT ON COLUMN weekly_report_logs.sent_at IS '발송 시간';
COMMENT ON COLUMN weekly_report_logs.sent_by IS '발송자 사용자 ID';
