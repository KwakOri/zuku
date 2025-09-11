import CanvasScheduleHome from '@/components/CanvasScheduleHome';

export default function CanvasScheduleAdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800 font-medium">관리자 모드</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              학생 시간표를 편집하고 관리할 수 있습니다.
            </p>
          </div>
        </div>
        
        <CanvasScheduleHome editMode="admin" />
      </div>
    </main>
  );
}