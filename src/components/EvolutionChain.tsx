"use client";

import type { EvoNode } from "@/lib/pokedex";
import { officialArt, hexToRgba } from "@/lib/constants";

export function EvolutionChain({
  chain,
  currentId,
  knownIds,
  onOpen,
}: {
  chain: EvoNode;
  currentId: number;
  knownIds: Set<number>;
  onOpen: (id: number) => void;
}) {
  return (
    <div className="card flex h-full flex-col gap-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-300">
        🧬 Cadena evolutiva
      </h2>
      <div className="nice-scroll overflow-x-auto pb-1">
        <div className="flex min-w-max items-center justify-start gap-1">
          <Node
            node={chain}
            currentId={currentId}
            knownIds={knownIds}
            onOpen={onOpen}
          />
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">
        Haz clic en cualquier etapa para saltar a ella. Los Pokémon no avistados aparecen en sombra 👤.
      </p>
    </div>
  );
}

function Node({
  node,
  currentId,
  knownIds,
  onOpen,
}: {
  node: EvoNode;
  currentId: number;
  knownIds: Set<number>;
  onOpen: (id: number) => void;
}) {
  const known = knownIds.has(node.id);
  const isCurrent = node.id === currentId;
  const hasKids = node.children.length > 0;

  return (
    <div className="flex items-stretch">
      <button
        onClick={() => onOpen(node.id)}
        title={`#${node.number} ${node.name}${known ? "" : " · sin avistar"}`}
        className={`btn-press flex w-[120px] flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${
          isCurrent
            ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_24px_-6px_rgba(250,204,21,0.5)]"
            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
        }`}
      >
        <div className="relative">
          <img
            src={officialArt(node.id)}
            alt={node.name}
            width={72}
            height={72}
            className={`h-[72px] w-[72px] object-contain transition ${
              known ? "" : "grayscale-[0.6] opacity-40"
            }`}
          />
          {node.isBaby && (
            <span className="absolute -right-1 top-0 text-xs" title="Pokémon bebé">
              🍼
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isCurrent ? "text-amber-300" : "text-zinc-500"
          }`}
        >
          #{node.number}
        </span>
        <span className="max-w-full truncate text-xs font-bold text-zinc-100">
          {node.name}
        </span>
        {node.types.length > 0 && (
          <span className="flex gap-1">
            {node.types.map((t) => (
              <span
                key={t.name}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.hex }}
                title={t.label}
              />
            ))}
          </span>
        )}
        {!known && (
          <span className="mt-0.5 rounded-full bg-white/10 px-1.5 text-[9px] uppercase text-zinc-400">
            👤 sin avistar
          </span>
        )}
      </button>

      {hasKids && (
        <div className="ml-2 flex">
          <div className="flex items-center">
            <ArrowLabel method={node.children[0].method} icon={node.children[0].methodIcon} />
          </div>
          <div className="flex items-center gap-2 pl-2">
            {node.children.map((child) => (
              <Node
                key={child.id}
                node={child}
                currentId={currentId}
                knownIds={knownIds}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowLabel({ method, icon }: { method: string | null; icon: string }) {
  return (
    <div className="flex w-24 flex-col items-center gap-0.5">
      <span className="text-lg" aria-hidden>
        {icon || "➡️"}
      </span>
      <span
        className="rounded-full bg-blue-400/10 px-1.5 py-0.5 text-center text-[9px] font-semibold leading-tight text-blue-200"
        style={{ boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.25)" }}
      >
        {method ?? "..."}
      </span>
      <span className="text-xs text-zinc-500" style={{ color: hexToRgba("#ffffff", 0.2) }} aria-hidden>
        ⬩
      </span>
    </div>
  );
}