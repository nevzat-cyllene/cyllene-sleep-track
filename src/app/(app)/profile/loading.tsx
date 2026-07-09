export default function ProfileLoading() {
  return (
    <div className="space-y-6 pb-4" aria-busy="true" aria-label="Yükleniyor">
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
    </div>
  );
}
