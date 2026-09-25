// Mirrors the bento layout so content doesn't jump when data arrives.
export default function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <div className="h-48 rounded-3xl bg-gradient-to-br from-brand-navy/90 to-brand/80 opacity-60" />
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-9 w-9 rounded-xl" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
                <div className="skeleton mt-4 h-7 w-24 rounded-md" />
                <div className="skeleton mt-2 h-4 w-28 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70 space-y-3">
          <div className="skeleton h-4 w-32 rounded" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 h-96 rounded-3xl bg-gradient-to-br from-[#06214d] to-[#0d3a78] opacity-50" />
        <div className="lg:col-span-5 h-96 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="mt-8 flex justify-around">
            <div className="skeleton h-36 w-36 rounded-full" />
            <div className="skeleton h-36 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
