// Export all mock data for easy import
export { assistants } from "./assistants";
export { classes } from "./classes";
export { classExceptions } from "./classExceptions";
export { classStudents } from "./classStudents";
export { highSchoolHomeworkRecords } from "./highSchoolHomeworkRecords";
export { middleSchoolRecords } from "./middleSchoolRecords";
export { students } from "./students";
export { studentSchedules } from "./studentSchedules";
export { teachers } from "./teachers";

// Re-export types for convenience
export type {
  Assistant,
  AvailabilityAnalysis,
  Class,
  ClassBlock,
  ClassException,
  ClassSchedulingSuggestion,
  ClassStudent,
  DragData,
  EditMode,
  HighSchoolHomeworkRecord,
  MiddleSchoolRecord,
  ScheduleConfig,
  ScheduleFilter,
  Student,
  StudentSchedule,
  Teacher,
  UserRole,
} from "@/types/schedule";
