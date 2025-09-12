import CombinedStudentSchedule from "@/components/CombinedStudentSchedule";

export default function CombinedSchedulePage() {
  return (
    <div className="flex flex-col w-full h-full p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">학생별 통합 시간표</h1>
      <CombinedStudentSchedule />
    </div>
  );
}
