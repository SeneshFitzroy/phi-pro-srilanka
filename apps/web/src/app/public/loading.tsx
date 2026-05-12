// Route-level loading skeleton for public pages.
export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="h-[120px] bg-gradient-to-r from-blue-800 to-slate-900" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="skeleton mb-2 h-3 w-24" />
        <div className="skeleton mb-3 h-9 w-80" />
        <div className="skeleton mb-8 h-4 w-full max-w-xl" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6">
              <div className="skeleton mb-3 h-5 w-2/3" />
              <div className="skeleton mb-2 h-3 w-full" />
              <div className="skeleton mb-2 h-3 w-5/6" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
