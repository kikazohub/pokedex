"use client";

import type { EffectGroup } from "@/lib/pokedex";
import { hexToRgba } from "@/lib/constants";

export function TypeChart({ groups }: { groups: EffectGroup[] }) {
  return (
    <div className="card flex h-full flex-col gap-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-300">
        ⚡ Efectividad de tipos
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.key}
            className="rounded-2xl border px-3 py-3"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <p
              className="mb-2 text-[11px] font-bold uppercase tracking-widest"
              style={{
                color:
                  g.key === "weak" ? "#f87171" : g.key === "resist" ? "#34d399" : "#e2e8f0",
              }}
            >
              {g.icon} {g.label}
            </p>
            {g.items.length === 0 ? (
              <p className="text-xs text-zinc-500">Ninguno</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((t) => (
                  <span
                    key={t.name}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{
                      background: hexToRgba(t.hex, 0.85),
                      boxShadow: `0 0 0 1px ${hexToRgba(t.hex, 0.5)}`,
                    }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-500">
        Relación defensiva calculada del lore: cuánto daño recibe según sus tipos.
      </p>
    </div>
  );
}