"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dexNumber, prettyName } from "@/lib/constants";
import { playBlip } from "@/lib/client/sound";
import type { PkmSummary } from "@/lib/pokedex";

export function SearchBar({
  names,
  onSelect,
  inputId,
}: {
  names: PkmSummary[];
  onSelect: (id: number) => void;
  inputId: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const numeric = /^\d+$/.test(q);
    const hits = names.filter((n) => {
      if (numeric) return n.id.toString().startsWith(q) || n.name.includes(q);
      return n.name.includes(q) || n.name.replaceAll("-", " ").includes(q);
    });
    return hits.slice(0, 8);
  }, [query, names]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(p: PkmSummary) {
    playBlip();
    setQuery("");
    setOpen(false);
    onSelect(p.id);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && results[hi]) {
      e.preventDefault();
      choose(results[hi]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-60">
          🔎
        </span>
        <input
          id={inputId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHi(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Busca por nombre o número (ej. Pikachu o 25)…"
          autoComplete="off"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-10 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner outline-none transition focus:border-amber-300/70 focus:bg-white/[0.08]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-zinc-400 hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {open && !query && (
        <div className="anim-pop-in absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-white/10 bg-[#12172a]/95 p-3 text-xs text-zinc-400 shadow-2xl backdrop-blur">
          Escribe el nombre o el número de un Pokémon para buscarlo. Por ejemplo:{" "}
          <button onClick={() => setQuery("pika")} className="font-semibold text-amber-300 hover:underline">
            pikachu
          </button>
          ,{" "}
          <button onClick={() => setQuery("25")} className="font-semibold text-amber-300 hover:underline">
            25
          </button>
          ,{" "}
          <button onClick={() => setQuery("char")} className="font-semibold text-amber-300 hover:underline">
            charmander
          </button>
          .
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="anim-pop-in absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#12172a]/97 p-1.5 shadow-2xl backdrop-blur nice-scroll">
          {results.map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => choose(p)}
                onMouseEnter={() => setHi(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  i === hi ? "bg-amber-300/15 text-white" : "text-zinc-300"
                }`}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-lg bg-white/5 object-contain p-0.5"
                />
                <span className="flex-1 font-semibold">
                  {prettyName(p.name)}
                </span>
                <span className="tabular-nums text-xs text-zinc-500">
                  #{dexNumber(p.id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query && results.length === 0 && (
        <div className="anim-pop-in absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-white/10 bg-[#12172a]/97 p-4 text-sm text-zinc-400 shadow-2xl backdrop-blur">
          No encontré ningún Pokémon que coincida con{" "}
          <span className="font-semibold text-white">&quot;{query}&quot;</span>. 🤔
        </div>
      )}
    </div>
  );
}