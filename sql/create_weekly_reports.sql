-- weekly_reports 테이블 생성
-- 목적: 중등 기록을 과목별로 묶어주는 주간 리포트 ID 관리
-- 알림톡 발송 시 report_id로 사용됨

CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  week_of DATE NOT NULL, -- 해당 주의 월요일 날짜 (KST 기준)
  expired_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Seoul' + INTERVAL '7 days'), -- 만료일 (기본 7일)
  created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Seoul'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Seoul')
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_student_id ON weekly_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_of ON weekly_reports(week_of);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_expired_at ON weekly_reports(expired_at);

-- 학생-주차별 유니크 제약 (같은 학생의 같은 주에는 하나의 리포트만)
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reports_student_week ON weekly_reports(student_id, week_of);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_weekly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW() AT TIME ZONE 'Asia/Seoul';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_reports_updated_at
  BEFORE UPDATE ON weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_reports_updated_at();

-- 코멘트 추가
COMMENT ON TABLE weekly_reports IS '주간 리포트 ID 관리 테이블 - 알림톡 report_id로 사용';
COMMENT ON COLUMN weekly_reports.id IS '리포트 고유 ID (알림톡 report_id)';
COMMENT ON COLUMN weekly_reports.student_id IS '학생 ID';
COMMENT ON COLUMN weekly_reports.week_of IS '해당 주의 월요일 날짜 (KST)';
COMMENT ON COLUMN weekly_reports.expired_at IS '링크 만료일 (기본 7일 후)';
COMMENT ON COLUMN weekly_reports.created_at IS '생성일시 (KST)';
COMMENT ON COLUMN weekly_reports.updated_at IS '수정일시 (KST)';
