export default function SessionDetailLoading() {
  return (
    <div className="space-y-5 pb-4" aria-busy="true" aria-label="Yükleniyor">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-48 animate-pulse rounded-[22px] border border-white/[0.06] bg-white/[0.03]" />
      <div className="h-56 animate-pulse rounded-[22px] border border-white/[0.06] bg-white/[0.03]" />
    </div>
  );
}
