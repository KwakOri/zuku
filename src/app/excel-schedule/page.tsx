import ExcelScheduleTable from '@/components/ExcelScheduleTable';

export default function ExcelSchedulePage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <ExcelScheduleTable />
      </div>
    </main>
  );
}