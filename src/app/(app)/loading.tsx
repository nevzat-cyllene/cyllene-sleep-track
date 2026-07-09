export default function AppLoading() {
  return (
    <div className="space-y-6 pb-4" aria-busy="true" aria-label="Yükleniyor">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-4 w-56 animate-pulse rounded-lg bg-white/[0.04]" />
      </div>
      <div className="h-36 animate-pulse rounded-[22px] border border-white/[0.06] bg-white/[0.03]" />
      <div className="h-52 animate-pulse rounded-[22px] border border-white/[0.06] bg-white/[0.03]" />
    </div>
  );
}
