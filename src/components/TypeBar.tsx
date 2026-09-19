"use client";

import { TYPE_META, TYPE_ORDER, GEN_RANGES, hexToRgba } from "@/lib/constants";

export function TypeBar({
  selected,
  onToggleType,
  gen,
  onGenChange,
}: {
  selected: Set<string>;
  onToggleType: (t: string) => void;
  gen: number;
  onGenChange: (g: number) => void;
}) {
  const active = selected.size > 0 || gen !== 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 nice-scroll overflow-x-auto pb-1">
        {TYPE_ORDER.map((name) => {
          const meta = TYPE_META[name];
          const on = selected.has(name);
          return (
            <button
              key={name}
              onClick={() => onToggleType(name)}
              className="btn-press rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
              style={
                on
                  ? {
                      background: hexToRgba(meta.hex, 0.28),
                      color: "#fff",
                      boxShadow: `inset 0 0 0 2px ${meta.hex}`,
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.62)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }
              }
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: meta.hex }}
              />
              {meta.label}
            </button>
          );
        })}
        {active && (
          <button
            onClick={() => {
              onToggleType("__clear__");
              onGenChange(0);
            }}
            className="btn-press rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-red-300"
          >
            ✕ Limpiar
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
        <label className="flex items-center gap-2">
          <span className="uppercase tracking-widest text-zinc-500">Generación</span>
          <select
            value={gen}
            onChange={(e) => onGenChange(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-zinc-100 outline-none focus:border-amber-300/60"
          >
            <option value={0}>Todas</option>
            {GEN_RANGES.map((g, i) => (
              <option key={g.label} value={i + 1}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-zinc-500">
          Filtra por tipo y generación para explorar. Haz clic en un resultado para abrirlo.
        </span>
      </div>
    </div>
  );
}