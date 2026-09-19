"use client";

import { useEffect, useRef } from "react";
import { dexNumber, officialArt, officialArtShiny, prettyName } from "@/lib/constants";
import type { PkmSummary } from "@/lib/pokedex";

export type GridMode = "all" | "seen" | "caught";

export function ResultsGrid({
  items,
  seen,
  caught,
  currentId,
  mode,
  onModeChange,
  onOpen,
  title,
}: {
  items: PkmSummary[];
  seen: Set<number>;
  caught: Map<number, boolean>;
  currentId: number;
  mode: GridMode;
  onModeChange: (m: GridMode) => void;
  onOpen: (id: number) => void;
  title: string;
}) {
  const filtered = items.filter((p) => {
    if (mode === "seen") return seen.has(p.id);
    if (mode === "caught") return caught.has(p.id);
    return true;
  });

  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section ref={sectionRef} className="anim-fade-up scroll-mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold">
          {(
            [
              ["all", "Todos"],
              ["seen", "👁️ Vistos"],
              ["caught", "⭐ Capturados"],
            ] as [GridMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`rounded-full px-4 py-1.5 transition ${
                mode === m ? "bg-amber-300/20 text-amber-200" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-400">
          {title} · <b className="text-zinc-200">{filtered.length}</b> resultados
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-12 text-center text-sm text-zinc-400">
          {mode === "caught"
            ? "Aún no has capturado ningún Pokémon. Lanza una Pokébola con el botón ¡Capturar! 🎾"
            : mode === "seen"
              ? "Aún no has visto ningún Pokémon. Navega con ◀ ▶, usa el buscador o el botón 🎲 Sorpresa 👁️"
              : "No hay Pokémon que cumplan esos criterios. Intenta quitar filtros 🤷"}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
        {filtered.map((p) => {
          const c = caught.has(p.id);
          const shinyCatch = c && caught.get(p.id) === true;
          const s = seen.has(p.id);
          const isCurrent = p.id === currentId;
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              className={`btn-press group relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${
                isCurrent
                  ? "border-amber-300/60 bg-amber-300/10"
                  : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              {shinyCatch && (
                <span
                  className="absolute left-1.5 top-1.5 text-sm drop-shadow"
                  title="Capturado shiny"
                >
                  ✨
                </span>
              )}
              {c && (
                <span
                  className="absolute right-1.5 top-1.5 text-sm drop-shadow"
                  title={shinyCatch ? "Capturado (shiny)" : "Capturado"}
                >
                  ⭐
                </span>
              )}
              {s && !c && (
                <span
                  className="absolute right-1.5 top-1.5 text-xs"
                  title="Visto"
                >
                  👁️
                </span>
              )}
              <img
                src={shinyCatch ? officialArtShiny(p.id) : officialArt(p.id)}
                alt={prettyName(p.name)}
                width={56}
                height={56}
                loading="lazy"
                className={`h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${
                  shinyCatch
                    ? "drop-shadow-[0_0_6px_rgba(253,224,71,0.45)]"
                    : ""
                } ${s || c ? "" : "grayscale-[0.7] opacity-35"}`}
              />
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                #{dexNumber(p.id)}
              </span>
              <span className="w-full truncate text-center text-[11px] font-semibold text-zinc-200">
                {prettyName(p.name)}
              </span>
            </button>
          );
        })}
        </div>
      )}
    </section>
  );
}