"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonDetail, PkmSummary } from "@/lib/pokedex";
import { GEN_RANGES, TYPE_META } from "@/lib/constants";
import {
  playCry,
  playError,
  playPowered,
  playSelect,
} from "@/lib/client/sound";
import { SearchBar } from "./SearchBar";
import { TypeBar } from "./TypeBar";
import { ProgressPanel } from "./ProgressPanel";
import { PokemonHero } from "./PokemonHero";
import { StatsCard } from "./StatsCard";
import { EvolutionChain } from "./EvolutionChain";
import { BiologyCard } from "./BiologyCard";
import { TypeChart } from "./TypeChart";
import { ResultsGrid, type GridMode } from "./ResultsGrid";
import { QuizModal } from "./QuizModal";
import { PokeBall } from "./PokeBall";

const LS_SEEN = "pokedex_seen_v1";
const LS_CAUGHT = "pokedex_caught_v1";
const LS_SOUND = "pokedex_sound_v1";
const LS_BALLS = "pokedex_balls_v1";
const START_BALLS = 5;

function loadSet(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function loadBalls(): number {
  try {
    const raw = localStorage.getItem(LS_BALLS);
    if (raw === null) return START_BALLS;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : START_BALLS;
  } catch {
    return START_BALLS;
  }
}

function loadCaught(): Map<number, boolean> {
  try {
    const raw = localStorage.getItem(LS_CAUGHT);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return new Map(parsed.map((id) => [id, false] as [number, boolean]));
    }
    const m = new Map<number, boolean>();
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      m.set(Number(k), Boolean(v));
    }
    return m;
  } catch {
    return new Map();
  }
}

function intersectSets(a: Set<number>, b: Set<number>): Set<number> {
  const out = new Set<number>();
  for (const x of a) if (b.has(x)) out.add(x);
  return out;
}

const typeMemberCache = new Map<string, number[]>();

export function PokedexApp() {
  const [names, setNames] = useState<PkmSummary[]>([]);
  const [total, setTotal] = useState(1025);

  const [currentId, setCurrentId] = useState(1);
  const [pkm, setPkm] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [caught, setCaught] = useState<Map<number, boolean>>(new Map());
  const [balls, setBalls] = useState(START_BALLS);
  const [soundOn, setSoundOn] = useState(true);
  const [shiny, setShiny] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const [types, setTypes] = useState<Set<string>>(new Set());
  const [gen, setGen] = useState(0);
  const [gridMode, setGridMode] = useState<GridMode>("all");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [members, setMembers] = useState<Record<string, number[]>>({});

  const reqSeq = useRef(0);

  /* ---------- listado ---------- */
  useEffect(() => {
    fetch("/api/pkm")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setNames(d.data);
          setTotal(d.total);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(loadSet(LS_SEEN));
    setCaught(loadCaught());
    setBalls(loadBalls());
    const s = localStorage.getItem(LS_SOUND);
    if (s !== null) setSoundOn(s === "on");
  }, []);

  /* ---------- persistencia ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(LS_SEEN, JSON.stringify([...seen]));
    } catch {}
  }, [seen]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_CAUGHT, JSON.stringify(Object.fromEntries(caught)));
    } catch {}
  }, [caught]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_SOUND, soundOn ? "on" : "off");
    } catch {}
  }, [soundOn]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_BALLS, String(balls));
    } catch {}
  }, [balls]);

  /* ---------- carga del pokemon ---------- */
  useEffect(() => {
    const seq = ++reqSeq.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/pkm/${currentId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not-found");
        return r.json();
      })
      .then((d: PokemonDetail) => {
        if (reqSeq.current !== seq) return;
        setPkm(d);
        setLoading(false);
        setShiny(caught.get(d.id) === true);
        setSeen((prev) => (prev.has(d.id) ? prev : new Set(prev).add(d.id)));
      })
      .catch(() => {
        if (reqSeq.current !== seq) return;
        setPkm(null);
        setLoading(false);
        setError("No pude abrir ese registro. El domador (yo) no lo encontró.");
        if (soundOn) playError();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  /* ---------- grito al abrir (si suena activo) ---------- */
  const prevPkmKey = useRef<number | null>(null);
  useEffect(() => {
    if (!pkm) return;
    if (prevPkmKey.current !== pkm.id) {
      prevPkmKey.current = pkm.id;
      if (soundOn) playCry(pkm.cry, pkm.cryLegacy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkm]);

  const go = useCallback(
    (id: number) => {
      if (id < 1) id = 1;
      if (id > total) id = total;
      if (soundOn) playSelect();
      setCurrentId(id);
      setShiny(false);
    },
    [total, soundOn],
  );

  const next = useCallback(() => go(currentId + 1), [currentId, go]);
  const prev = useCallback(() => go(currentId - 1), [currentId, go]);

  const random = useCallback(() => {
    const r = Math.floor(Math.random() * total) + 1;
    if (soundOn) playPowered();
    go(r);
  }, [total, soundOn, go]);

  /* ---------- filtros por tipo ---------- */
  useEffect(() => {
    for (const t of types) {
      if (members[t] || typeMemberCache.has(t)) continue;
      typeMemberCache.set(t, []);
      fetch(`https://pokeapi.co/api/v2/type/${t}`)
        .then((r) => r.json())
        .then((d: { pokemon: { pokemon: { name: string; url: string } }[] }) => {
          const ids = d.pokemon
            .map((p) => Number(p.pokemon.url.split("/").filter(Boolean).pop()))
            .filter((n) => Number.isInteger(n));
          typeMemberCache.set(t, ids);
          setMembers((m) => ({ ...m, [t]: ids }));
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types]);

  const matches = useMemo(() => {
    let pool = names;
    const loadKeys = [...types].filter((t) => !members[t]);
    if (loadKeys.length) return null;
    if (types.size) {
      let acc: Set<number> | null = null;
      for (const t of types) {
        const s = new Set(members[t] ?? []);
        acc = acc === null ? s : intersectSets(acc, s);
      }
      if (acc) pool = pool.filter((p) => acc.has(p.id));
    }
    if (gen > 0) {
      const r = GEN_RANGES[gen - 1];
      pool = pool.filter((p) => p.id >= r.min && p.id <= r.max);
    }
    return pool;
  }, [names, types, members, gen]);

  const toggleType = useCallback(
    (t: string) => {
      if (t === "__clear__") {
        setTypes(new Set());
        setGen(0);
        return;
      }
      setTypes((prev) => {
        const s = new Set(prev);
        if (s.has(t)) s.delete(t);
        else s.add(t);
        return s;
      });
    },
    [],
  );

  const hasFilter = types.size > 0 || gen > 0;
  const showGrid = galleryOpen || hasFilter;

  const gridTitle = useMemo(() => {
    const bits = [
      ...[...types].map((t) => TYPE_META[t]?.label).filter(Boolean),
      gen > 0 ? GEN_RANGES[gen - 1].label : null,
    ].filter(Boolean);
    return bits.length ? bits.join(" · ") : "Todos los Pokémon";
  }, [types, gen]);

  /* ---------- atajos de teclado ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key.toLowerCase() === "r") random();
      else if (e.key.toLowerCase() === "s") setSoundOn((s) => !s);
      else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("pkm-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, random]);

  function onCaptured() {
    setCaught((prev) =>
      prev.has(currentId) ? prev : new Map(prev).set(currentId, shiny),
    );
  }

  function onRelease() {
    setCaught((prev) => {
      if (!prev.has(currentId)) return prev;
      const nx = new Map(prev);
      nx.delete(currentId);
      return nx;
    });
  }

  const useBall = useCallback(() => setBalls((b) => Math.max(0, b - 1)), []);
  const onQuizCorrect = useCallback(() => setBalls((b) => b + 2), []);
  const openQuiz = useCallback(() => setQuizOpen(true), []);

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- cabecera ---------- */}
      <header className="anim-fade-up relative z-50 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="anim-float-slow relative">
              <PokeBall size={44} className="anim-spin-slow" />
            </div>
            <div>
              <h1 className="shimmer-text text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                Pokédex
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Enciclopedia Pokémon · completa tu registro del lore original
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSoundOn((s) => !s)}
              className={`btn-press rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                soundOn
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
              title="Sonido (S)"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
            <button
              onClick={random}
              className="btn-press rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-orange-900/40"
              title="¡Sorpresa! (R)"
            >
              🎲 Sorpresa
            </button>
            <button
              onClick={() => setQuizOpen(true)}
              className="btn-press flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-2 text-sm font-semibold text-amber-200 transition"
              title={`Tienes ${balls} Pokébolas. Gana más respondiendo preguntas del profesor Oak`}
            >
              🎾 ×{balls}
            </button>
            <button
              onClick={() => {
                setGridMode("caught");
                setGalleryOpen(true);
              }}
              className="btn-press flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-sm font-semibold text-emerald-300 transition"
              title="Ver los Pokémon que ya has capturado"
            >
              ⭐ Mis capturas
            </button>
            <button
              onClick={() => setGalleryOpen((g) => !g)}
              className={`btn-press rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                showGrid
                  ? "border-amber-300/50 bg-amber-300/10 text-amber-200"
                  : "border-white/10 bg-white/5 text-zinc-300"
              }`}
              title="Explorar resultados"
            >
              {showGrid ? "✕ Cerrar galería" : "🗂️ Explorar"}
            </button>
          </div>
        </div>

        <SearchBar names={names} onSelect={(id) => go(id)} inputId="pkm-search" />
      </header>

      <ProgressPanel seen={seen.size} caught={caught.size} total={total} />

      <TypeBar
        selected={types}
        onToggleType={toggleType}
        gen={gen}
        onGenChange={(g) => setGen(g)}
      />

      {/* ---------- heroe ---------- */}
      <div className="relative">
        {loading && !pkm && (
          <div className="card flex min-h-[460px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <PokeBall size={64} className="anim-spin-slow" />
              <p className="anim-fade-up text-sm text-zinc-400">
                Abriendo el registro #000
                {String(currentId).padStart(3, "0")}… 📡
              </p>
            </div>
          </div>
        )}

        {!loading && error && !pkm && (
          <div className="card flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
            <PokeBall size={48} className="anim-shake-x" />
            <p className="text-lg font-semibold text-zinc-200">
              ¡Vaya! {error}
            </p>
            <button
              onClick={() => go(currentId)}
              className="btn-press rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black"
            >
              Reintentar 🔄
            </button>
          </div>
        )}

        {loading && pkm && (
          <div className="pointer-events-none absolute right-4 top-4 z-20">
            <PokeBall size={28} className="anim-spin-slow" />
          </div>
        )}

        {pkm && !error && (
          <div key={pkm.id} className="anim-fade-up">
            <PokemonHero
              pkm={pkm}
              shiny={shiny}
              caught={caught.has(pkm.id)}
              seen={seen.has(pkm.id)}
              soundEnabled={soundOn}
              balls={balls}
              onUseBall={useBall}
              onNoBalls={openQuiz}
              onCaptured={onCaptured}
              onRelease={onRelease}
              onToggleShiny={() => setShiny((s) => !s)}
              onCry={() => playCry(pkm.cry, pkm.cryLegacy)}
            />
          </div>
        )}

        {/* navegación */}
        <nav className="anim-fade-up mt-4 flex items-center justify-between gap-2">
          <button
            onClick={prev}
            disabled={currentId <= 1}
            className="btn-press flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 disabled:opacity-30"
          >
            ◀ #{String(Math.max(1, currentId - 1)).padStart(3, "0")} anterior
          </button>
          <div className="flex flex-col items-center px-2">
            <span className="text-2xl font-extrabold tabular-nums">
              #{String(currentId).padStart(3, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              ← → navegar · R aleatorio · / buscar
            </span>
          </div>
          <button
            onClick={next}
            disabled={currentId >= total}
            className="btn-press flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 disabled:opacity-30"
          >
            siguiente #{String(Math.min(total, currentId + 1)).padStart(3, "0")} ▶
          </button>
        </nav>
      </div>

      {/* ---------- detalles ---------- */}
      {pkm && !error && (
        <div className="anim-fade-up grid gap-4 lg:grid-cols-2">
          <StatsCard stats={pkm.stats} bst={pkm.bst} />
          <EvolutionChain
            chain={pkm.chain}
            currentId={pkm.id}
            knownIds={new Set([...seen, ...caught.keys()])}
            onOpen={(id) => go(id)}
          />
          <BiologyCard pkm={pkm} />
          <TypeChart groups={pkm.effectiveness} />
        </div>
      )}

      {/* ---------- galería ---------- */}
      {showGrid && (
        <div className="flex flex-col gap-4">
          <h2 className="pt-2 text-xl font-bold">
            🗂️ Resultados ·{" "}
            <span className="text-amber-300">{gridTitle}</span>
          </h2>
          {matches === null ? (
            <div className="card flex items-center justify-center gap-3 py-10 text-sm text-zinc-400">
              <PokeBall size={28} className="anim-spin-slow" /> Consultando a los
              sabios de la Pokédex…
            </div>
          ) : matches.length === 0 ? (
            <div className="card py-10 text-center text-sm text-zinc-400">
              No hay Pokémon que cumplan esos criterios. Intenta quitar filtros 🤷
            </div>
          ) : (
            <ResultsGrid
              items={matches}
              seen={seen}
              caught={caught}
              currentId={currentId}
              mode={gridMode}
              onModeChange={setGridMode}
              onOpen={(id) => go(id)}
              title={gridTitle}
            />
          )}
        </div>
      )}

      {total > 0 && (
        <footer className="pt-2 text-center text-[11px] text-zinc-600">
          Pokédex no oficial con fines educativos · datos de PokéAPI ·{" "}
          {total} Pokémon registrados
        </footer>
      )}

      {quizOpen && names.length > 0 && (
        <QuizModal
          names={names}
          soundEnabled={soundOn}
          onCorrect={onQuizCorrect}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  );
}