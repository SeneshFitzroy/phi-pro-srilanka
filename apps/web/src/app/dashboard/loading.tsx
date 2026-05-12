// Route-level loading skeleton — shown while a dashboard page's bundle/data loads.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="skeleton h-9 w-28 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="skeleton mb-3 h-9 w-9 rounded-lg" />
            <div className="skeleton mb-2 h-6 w-16" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="skeleton mb-4 h-5 w-40" />
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="skeleton mb-4 h-5 w-32" />
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
        </div>
      </div>
    </div>
  );
}
