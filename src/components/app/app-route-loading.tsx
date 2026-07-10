export function AppRouteLoading() {
  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-[#78b7ff]/18" />
          <div className="h-10 w-56 rounded-2xl bg-white/[0.055]" />
          <div className="h-3 w-64 max-w-[70vw] rounded-full bg-white/[0.04]" />
        </div>
        <div className="flex gap-2">
          <div className="h-14 w-20 rounded-2xl border border-white/[0.07] bg-white/[0.03]" />
          <div className="h-14 w-20 rounded-2xl border border-white/[0.07] bg-white/[0.03]" />
        </div>
      </div>

      <div className="surface-panel relative overflow-hidden rounded-[1.8rem] p-4">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(120,183,255,.08)_42%,transparent_68%)] animate-pulse" />
        <div className="relative grid gap-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-[1.35rem] border border-white/[0.065] bg-[#071222]/78 p-3"
            >
              <div className="h-12 w-1.5 rounded-full bg-[#78b7ff]/20" />
              <div className="h-10 w-10 rounded-2xl bg-[#155eff]/14" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-40 max-w-[60vw] rounded-full bg-white/[0.07]" />
                <div className="h-2.5 w-28 rounded-full bg-white/[0.04]" />
              </div>
              <div className="h-8 w-8 rounded-full bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
