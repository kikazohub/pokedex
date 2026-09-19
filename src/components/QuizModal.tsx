"use client";

import { useEffect, useState } from "react";
import { prettyName } from "@/lib/constants";
import type { PkmSummary } from "@/lib/pokedex";
import { playCaptureSuccess, playError, playSelect } from "@/lib/client/sound";
import { PokeBall } from "./PokeBall";

interface QuizState {
  kind: "front" | "back";
  prompt: string;
  options: string[];
  correct: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(list: PkmSummary[]): QuizState {
  const subject = list[Math.floor(Math.random() * list.length)];
  const kind: QuizState["kind"] = Math.random() < 0.5 ? "front" : "back";

  if (kind === "front") {
    const correct = prettyName(subject.name);
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      const d = list[Math.floor(Math.random() * list.length)];
      if (d.id === subject.id) continue;
      distractors.add(prettyName(d.name));
    }
    const options = shuffle([correct, ...distractors]);
    return {
      kind,
      prompt: `¿Cómo se llama el Pokémon del registro #${String(subject.id).padStart(3, "0")}?`,
      options,
      correct: options.indexOf(correct),
    };
  }

  const correct = `#${String(subject.id).padStart(3, "0")}`;
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const d = list[Math.floor(Math.random() * list.length)];
    if (d.id === subject.id) continue;
    distractors.add(`#${String(d.id).padStart(3, "0")}`);
  }
  const options = shuffle([correct, ...distractors]);
  return {
    kind,
    prompt: `¿Qué número de Pokédex tiene ${prettyName(subject.name)}?`,
    options,
    correct: options.indexOf(correct),
  };
}

export function QuizModal({
  names,
  soundEnabled,
  onCorrect,
  onClose,
}: {
  names: PkmSummary[];
  soundEnabled: boolean;
  onCorrect: () => void;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState<QuizState>(() => makeQuestion(names));
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isCorrect = picked !== null && picked === question.correct;

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.correct) {
      if (streak % 3 === 0) {
        if (soundEnabled) playCaptureSuccess();
      } else {
        if (soundEnabled) playSelect();
      }
      setStreak((s) => s + 1);
      onCorrect();
    } else if (soundEnabled) {
      playError();
    }
  }

  function next() {
    setPicked(null);
    setQuestion(makeQuestion(names));
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card anim-pop-in flex w-full max-w-md flex-col gap-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">🎓 Quiz del Profesor Oak</h2>
            <p className="text-xs text-zinc-400">
              Responde bien y gana Pokébolas 🎾
            </p>
          </div>
          <PokeBall size={34} className="shrink-0" />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-sm">
          <span className="text-[11px] uppercase tracking-widest text-zinc-500">
            Racha de aciertos
          </span>
          <b className="ml-auto text-amber-300">{streak}</b>
        </div>

        {picked === null ? (
          <>
            <p className="rounded-xl border-l-2 border-amber-300/50 bg-white/[0.04] p-3 text-sm leading-relaxed text-zinc-200">
              {question.prompt}
            </p>
            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => (
                <button
                  key={`${i}-${opt}`}
                  onClick={() => answer(i)}
                  className="btn-press rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                >
                  {question.kind === "front" ? "🔤" : "🔢"} {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p
              className={`anim-pop-in flex items-center gap-2 rounded-xl p-3 text-sm font-bold ${
                isCorrect
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-rose-400/15 text-rose-200"
              }`}
            >
              {isCorrect ? (
                <>
                  <span className="text-xl">🎉</span> ¡Correcto! +2 Pokébolas
                </>
              ) : (
                <>
                  <span className="text-xl">💔</span> ¡Ups! Era{" "}
                  {question.options[question.correct]}
                </>
              )}
            </p>
            <button
              onClick={next}
              className="btn-press rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-black"
            >
              Siguiente pregunta ➡
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-zinc-200"
        >
          Cerrar (Esc)
        </button>
      </div>
    </div>
  );
}