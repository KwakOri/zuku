-- Create exam_periods table for managing school exam periods
-- Each school can have multiple exam periods with start and end dates

CREATE TABLE exam_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Ensure end_date is after start_date if provided
  CONSTRAINT end_date_after_start_date CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Index for faster queries by school
CREATE INDEX idx_exam_periods_school_id ON exam_periods(school_id);

-- Index for date range queries
CREATE INDEX idx_exam_periods_dates ON exam_periods(start_date, end_date);

COMMENT ON TABLE exam_periods IS 'Manages exam periods for each school with start and end dates';
COMMENT ON COLUMN exam_periods.school_id IS 'Reference to the school';
COMMENT ON COLUMN exam_periods.start_date IS 'Exam period start date (required)';
COMMENT ON COLUMN exam_periods.end_date IS 'Exam period end date (nullable, often confirmed late)';
