import { Card } from "../components/common/Card";
import { SectionHeader } from "../components/common/SectionHeader";

export function JobsPage() {
  return (
    <Card>
      <SectionHeader title="Job Recommendations" subtitle="Static placeholder panel" />
      <div className="grid gap-3 md:grid-cols-2">
        {["Frontend Engineer", "React Developer", "Full-Stack Engineer"].map((job) => (
          <div key={job} className="rounded-xl border border-border bg-bg/50 p-4">
            <p className="font-medium">{job}</p>
            <p className="mt-1 text-sm text-muted">Company, location, and fit details placeholder.</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
