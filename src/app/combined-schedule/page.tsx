import CombinedStudentSchedule from "@/components/CombinedStudentSchedule";

export default function CombinedSchedulePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">학생별 통합 시간표</h1>
      <CombinedStudentSchedule />
    </div>
  );
}
