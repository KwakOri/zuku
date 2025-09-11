import CanvasScheduleHome from '@/components/CanvasScheduleHome';

export default function CanvasSchedulePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <CanvasScheduleHome editMode="view" />
      </div>
    </main>
  );
}