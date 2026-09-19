"use client";

import type { PokemonDetail } from "@/lib/pokedex";
import { hexToRgba } from "@/lib/constants";

export function BiologyCard({ pkm }: { pkm: PokemonDetail }) {
  const s = pkm.species;
  return (
    <div className="card flex h-full flex-col gap-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-300">
        🔬 Biología
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Bio mini={false} icon={s.habitatEmoji} label="Hábitat" value={s.habitat ?? "Desconocido"} />
        <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">🎨 Color</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <span
              className="inline-block h-4 w-4 rounded-full ring-1 ring-white/30"
              style={{ backgroundColor: s.color.hex, boxShadow: `0 0 10px ${hexToRgba(s.color.hex, 0.6)}` }}
            />
            {s.color.label}
          </p>
        </div>
        <Bio icon="🧍" label="Forma" value={s.shape} />
        <Bio icon="🥚" label="Grupos de huevo" value={s.eggGroups.join(", ") || "—"} />
        <Bio icon="🎯" label="Tasa de captura" value={s.captureRate != null ? String(s.captureRate) : "—"} />
        <Bio
          icon="💛"
          label="Felicidad base"
          value={s.baseHappiness != null ? String(s.baseHappiness) : "—"}
        />
        <Bio icon="⚧️" label="Ratio de género" value={s.gender} />
        <Bio
          icon="👣"
          label="Pasos para eclosionar"
          value={s.hatchSteps > 0 ? s.hatchSteps.toLocaleString("es") : "—"}
        />
        <Bio icon="📈" label="Crecimiento" value={s.growthRate} />
      </div>
      {pkm.flags.isLegendary && (
        <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-200">
          ⚡ <b>Pokémon legendario:</b> según el lore, solo existen individuos únicos de esta especie y son
          sumamente difíciles de hallar.
        </p>
      )}
      {pkm.flags.isMythical && (
        <p className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 p-3 text-xs leading-relaxed text-fuchsia-200">
          🌠 <b>Pokémon mítico:</b> se dice que esta especie es tan esquiva que muchas personas dudan de su
          existencia.
        </p>
      )}
    </div>
  );
}

function Bio({
  icon,
  label,
  value,
  mini,
}: {
  icon: string;
  label: string;
  value: string;
  mini?: boolean;
}) {
  if (mini) {
    return (
      <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          {icon} {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-zinc-100">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}