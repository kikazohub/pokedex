"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hexToRgba } from "@/lib/constants";
import type { PokemonDetail } from "@/lib/pokedex";
import {
  playBallClick,
  playCaptureSuccess,
  playError,
  playShake,
  playShiny,
} from "@/lib/client/sound";
import { PokeBall } from "./PokeBall";
import { TypePill } from "./TypePill";

export type CapturePhase = "idle" | "fly" | "wobble" | "celebrate" | "fail";

const SPARKLES = [
  { top: "12%", left: "18%", d: 0.0, size: 22 },
  { top: "20%", left: "78%", d: 0.15, size: 18 },
  { top: "58%", left: "86%", d: 0.3, size: 26 },
  { top: "64%", left: "8%", d: 0.45, size: 16 },
  { top: "38%", left: "10%", d: 0.6, size: 20 },
];

export function PokemonHero({
  pkm,
  shiny,
  caught,
  seen,
  soundEnabled,
  balls,
  onUseBall,
  onNoBalls,
  onCaptured,
  onRelease,
  onToggleShiny,
  onCry,
}: {
  pkm: PokemonDetail;
  shiny: boolean;
  caught: boolean;
  seen: boolean;
  soundEnabled: boolean;
  balls: number;
  onUseBall: () => void;
  onNoBalls: () => void;
  onCaptured: () => void;
  onRelease: () => void;
  onToggleShiny: () => void;
  onCry: () => void;
}) {
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [mode, setMode] = useState<"art" | "anim">("art");
  const [jumps, setJumps] = useState(0);
  const [flash, setFlash] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [pkm.id]);

  const glow = useMemo(() => {
    const base = pkm.types[0]?.hex ?? "#6366f1";
    return {
      background: `radial-gradient(ellipse 60% 55% at 50% 42%, ${hexToRgba(base, 0.4)}, transparent 70%)`,
    };
  }, [pkm.types]);

  const imgSrc = useMemo(() => {
    const s = pkm.sprites;
    if (mode === "art") return shiny ? s.officialShiny ?? s.official : s.official;
    return shiny ? s.animatedShiny ?? s.animated : s.animated;
  }, [pkm, mode, shiny]);

  function resetTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  const chance = useMemo(() => {
    const rate = pkm.species.captureRate ?? 45;
    let p = 0.3 + 0.6 * (rate / 255);
    p = Math.min(p, 0.9);
    if (rate < 45) p = Math.min(p, 0.42);
    if (rate < 20) p = Math.min(p, 0.28);
    if (pkm.flags.isLegendary || pkm.flags.isMythical) p = Math.min(p, 0.22);
    return Math.max(0.15, p);
  }, [pkm]);

  function startCapture() {
    if (caught || phase !== "idle") return;
    if (balls <= 0) {
      if (soundEnabled) playError();
      onNoBalls();
      return;
    }
    onUseBall();
    resetTimers();
    if (soundEnabled) playBallClick();
    const landed = Math.random() < chance;
    setPhase("fly");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("wobble");
        if (soundEnabled) playShake();
      }, 620),
    );
    for (let i = 1; i < 3; i++) {
      timers.current.push(
        window.setTimeout(() => {
          if (soundEnabled) playShake();
        }, 620 + i * 460),
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        if (landed) {
          setPhase("celebrate");
          if (soundEnabled) playCaptureSuccess();
          onCaptured();
          timers.current.push(window.setTimeout(() => setPhase("idle"), 2620));
        } else {
          setPhase("fail");
          if (soundEnabled) playError();
          timers.current.push(window.setTimeout(() => setPhase("idle"), 1720));
        }
      }, 620 + 3 * 460),
    );
  }

  function toggleShiny() {
    const next = !shiny;
    if (soundEnabled) playShiny();
    onToggleShiny();
    if (next) {
      setFlash(true);
      timers.current.push(window.setTimeout(() => setFlash(false), 700));
    }
  }

  const modeClasses =
    phase === "fly"
      ? "anim-poke-suck"
      : phase === "wobble"
        ? "opacity-0"
        : "anim-pkm-enter";

  return (
    <div className="card overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* ---------- imagen ---------- */}
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden px-6 py-8">
          <div
            className="pointer-events-none absolute inset-0 anim-glow-pulse"
            style={glow}
          />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

          <button
            onClick={() => {
              setJumps((j) => j + 1);
            }}
            className="anim-float-slow relative z-10 outline-none"
            title="¡Haz clic! ✨"
            aria-label="Haz clic en el Pokémon para ver su animación"
          >
            <img
              key={`${pkm.id}-${mode}-${shiny ? 1 : 0}-${jumps}`}
              src={imgSrc ?? pkm.sprites.official ?? ""}
              alt={`${pkm.displayName}, ${pkm.genus}`}
              width={300}
              height={300}
              draggable={false}
              className={`h-[240px] w-[240px] select-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] sm:h-[320px] sm:w-[320px] ${
                jumps > 0 ? "anim-pkm-jump" : modeClasses
              }`}
            />
          </button>

          {/* estado */}
          <div className="absolute left-4 top-4 z-20 flex flex-col items-start gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                seen ? "bg-amber-300/20 text-amber-200" : "bg-white/10 text-zinc-400"
              }`}
            >
              {seen ? "✓ Visto" : "¿Visto?"}
            </span>
            {caught && (
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                ⭐ Capturado
              </span>
            )}
            {shiny && (
              <span className="anim-pop-in rounded-full bg-fuchsia-400/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-200">
                ✨ Shiny
              </span>
            )}
          </div>

          {/* destello shiny */}
          {flash && (
            <div className="pointer-events-none absolute inset-0 z-30 animate-pulse bg-white/40" />
          )}

          {/* sombreado/brillo de captura */}
          {phase === "wobble" && (
            <div className="pointer-events-none absolute inset-0 z-20 bg-black/40" />
          )}

          {/* animación de captura */}
          {phase === "celebrate" && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="anim-twinkle absolute text-2xl"
                  style={{
                    top: s.top,
                    left: s.left,
                    animationDelay: `${s.d}s`,
                    fontSize: s.size,
                  }}
                >
                  {i % 2 === 0 ? "⭐" : "✨"}
                </span>
              ))}
              <div className="anim-success-ring flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 ring-4 ring-emerald-300/70 backdrop-blur">
                <PokeBall size={84} className="anim-spin-slow" />
              </div>
              <span className="anim-pop-in absolute mt-44 text-lg font-extrabold uppercase tracking-widest text-emerald-300 drop-shadow">
                ¡Capturado!
              </span>
            </div>
          )}

          {(phase === "fly" || phase === "wobble") && (
            <div className="absolute left-1/2 top-1/3 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className={phase === "fly" ? "anim-ball-fly" : "anim-ball-wobble"}>
                <PokeBall size={90} className="drop-shadow-[0_14px_18px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          )}

          {/* ¡Se escapó! */}
          {phase === "fail" && (
            <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center">
              <div className="anim-pop-in flex items-center gap-3">
                <div className="anim-shake-x grayscale">
                  <PokeBall size={64} className="opacity-70" />
                </div>
                <span className="text-4xl">💥</span>
              </div>
              <div className="absolute mt-32 flex flex-col items-center gap-1">
                <span className="anim-pop-in text-2xl font-extrabold uppercase tracking-widest text-rose-300 drop-shadow">
                  ¡Se escapó!
                </span>
                <span className="anim-pop-in text-[11px] uppercase tracking-wider text-zinc-300">
                  Este Pokémon es muy raro… ¡inténtalo de nuevo!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ---------- información ---------- */}
        <div className="relative flex flex-col gap-4 border-t border-white/5 p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
            <button
              onClick={() => setMode((m) => (m === "art" ? "anim" : "art"))}
              className="btn-press rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300"
            >
              {mode === "art" ? "📷 Arte" : "🎬 Animado"}
            </button>
            <button
              onClick={toggleShiny}
              className={`btn-press rounded-full border px-3 py-1 text-xs font-semibold ${
                shiny
                  ? "border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-200"
                  : "border-white/10 bg-white/5 text-zinc-300"
              }`}
              title="Alternar Shiny"
            >
              ✨ Shiny
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pr-28 pt-1">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white">
              #{pkm.number}
            </span>
            <span className="rounded-full bg-indigo-400/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200">
              Generación {pkm.generation}
            </span>
            {pkm.flags.isLegendary && (
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                ⚡ Legendario
              </span>
            )}
            {pkm.flags.isMythical && (
              <span className="rounded-full bg-fuchsia-400/20 px-2.5 py-0.5 text-[11px] font-bold text-fuchsia-200">
                🌠 Mítico
              </span>
            )}
            {pkm.flags.isBaby && (
              <span className="rounded-full bg-pink-400/20 px-2.5 py-0.5 text-[11px] font-bold text-pink-200">
                🍼 Bebé
              </span>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
              {pkm.displayName}
              <span className="ml-3 hidden text-2xl font-semibold text-zinc-500 sm:inline">
                {pkm.name}
              </span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <span className="font-semibold text-zinc-300">Especie:</span> {pkm.genus}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pkm.types.map((t) => (
              <TypePill key={t.name} type={t} />
            ))}
          </div>

          {pkm.flavor && (
            <blockquote className="max-h-28 overflow-y-auto rounded-xl border-l-2 border-amber-300/50 bg-white/[0.04] p-3 text-sm leading-relaxed text-zinc-300 nice-scroll">
              <span className="mb-1 block text-[10px] uppercase tracking-widest text-amber-300/80">
                📖 Datos biológicos
              </span>
              {pkm.flavor.text}
            </blockquote>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-2">
            <Fact icon="⚖️" label="Altura" value={pkm.height.text} />
            <Fact icon="🏋️" label="Peso" value={pkm.weight.text} />
            <Fact
              icon="🧠"
              label="Especie"
              value={pkm.genus}
              title={pkm.genus}
            />
            <Fact
              icon="🏞️"
              label="Hábitat"
              value={`${pkm.species.habitatEmoji} ${pkm.species.habitat ?? "Desconocido"}`}
              title={pkm.species.habitat ?? undefined}
            />
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
              🎯 Habilidades
            </p>
            <div className="flex flex-wrap gap-2">
              {pkm.abilities.map((a) => (
                <span
                  key={a.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200"
                >
                  {a.hidden ? "🔒" : "⭐"} {a.display}
                  {a.hidden && (
                    <span className="text-[9px] uppercase text-emerald-400/80">oculta</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* acciones */}
          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            <button
              onClick={startCapture}
              disabled={caught || phase !== "idle"}
              className={`btn-press flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-70 ${
                caught
                  ? "cursor-default bg-emerald-500/20 text-emerald-300"
                  : balls <= 0
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-orange-900/40"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-rose-900/40"
              }`}
              title={
                balls <= 0
                  ? "No te quedan Pokébolas: gana más en el quiz del profesor Oak"
                  : `Rareza: ${
                      pkm.flags.isLegendary || pkm.flags.isMythical
                        ? "legendario"
                        : (pkm.species.captureRate ?? 45) < 45
                          ? "raro"
                          : (pkm.species.captureRate ?? 45) < 120
                            ? "normal"
                            : "común"
                    } · ${Math.round(chance * 100)}% de captura`
              }
            >
              <PokeBall size={22} />
              {caught
                ? "¡En tu Pokédex!"
                : balls <= 0
                  ? "🎓 Sin Pokébolas"
                  : `¡Capturar! ${Math.round(chance * 100)}%`}
            </button>
            {!caught && phase === "idle" && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400"
                title="Tus Pokébolas: cada intento gasta una"
              >
                <PokeBall size={16} /> ×{balls}
              </span>
            )}
            {caught && (
              <button
                onClick={() => {
                  if (!window.confirm(`¿Dejar libre a ${pkm.displayName}? Volverá a la naturaleza… 🎈`)) return;
                  if (soundEnabled) playBallClick();
                  onRelease();
                }}
                className="btn-press flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition"
                title="Dejar libre a este Pokémon"
              >
                🎈 Dejar libre
              </button>
            )}
            <button
              onClick={onCry}
              className="btn-press flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200"
            >
              🔊 Grito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  title,
}: {
  icon: string;
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5" title={title}>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {icon} {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}