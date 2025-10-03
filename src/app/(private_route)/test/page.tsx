import { PageHeader, PageLayout } from "@/components/common/layout";

const TestPage = () => {
  const arr = Array.from({ length: 100 }, (_, i) => i);
  return (
    <>
      <PageHeader title="Test" />
      <PageLayout>
        <div className="grid flex-1 min-h-0 grid-cols-4">
          <div className="overflow-y-auto">
            {arr.map((i) => (
              <div key={i} className="w-4 h-4 bg-red-500">
                {i}
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default TestPage;
