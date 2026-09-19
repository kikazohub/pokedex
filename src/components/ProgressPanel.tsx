export function ProgressPanel({
  seen,
  caught,
  total,
}: {
  seen: number;
  caught: number;
  total: number;
}) {
  const seenPct = total ? (seen / total) * 100 : 0;
  const caughtPct = total ? (caught / total) * 100 : 0;
  return (
    <div className="card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-sm">
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-inner ring-2 ring-white/60" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-zinc-400">
            Tu registro
          </p>
          <p className="text-sm font-semibold">
            <span className="tabular-nums text-amber-300">{seen}</span>
            <span className="text-zinc-500"> visto</span> ·{" "}
            <span className="tabular-nums text-emerald-300">{caught}</span>
            <span className="text-zinc-500"> capturado</span> de {total}
          </p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
            style={{ width: `${seenPct}%` }}
          />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
            style={{ width: `${caughtPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}