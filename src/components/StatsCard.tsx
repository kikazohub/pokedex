"use client";

import type { StatRow } from "@/lib/pokedex";
import { hexToRgba } from "@/lib/constants";

const R = 110;
const CX = 170;
const CY = 150;
const MAX = 255;

function pt(i: number, r: number) {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

function poly(stats: StatRow[], scale: number) {
  return stats
    .map((s, i) => {
      const [x, y] = pt(i, (Math.min(s.value, MAX) / MAX) * R * scale);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function StatsCard({ stats, bst }: { stats: StatRow[]; bst: number }) {
  const color = "#facc15";
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <div className="card flex h-full flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-300">
          📊 Base stats
        </h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: hexToRgba(color, 0.14),
            color,
            boxShadow: `inset 0 0 0 1px ${hexToRgba(color, 0.4)}`,
          }}
        >
          Total: {bst}
        </span>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <svg viewBox="0 0 340 300" className="h-64 w-full max-w-[340px] shrink-0">
          {rings.map((r) => (
            <polygon
              key={r}
              points={poly(stats, r)}
              fill="none"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
          ))}
          {stats.map((_, i) => {
            const [x1, y1] = pt(i, R);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={x1}
                y2={y1}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}
          <polygon
            points={poly(stats, 1)}
            fill={hexToRgba(color, 0.28)}
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(color, 0.55)})` }}
          />
          {stats.map((s, i) => {
            const [x, y] = pt(
              i,
              (Math.min(s.value, MAX) / MAX) * R + (s.value > 180 ? -16 : s.value > 150 ? -11 : 13),
            );
            return (
              <text
                key={s.key}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#fde68a"
                style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 3 }}
              >
                {s.value}
              </text>
            );
          })}
          {stats.map((s, i) => {
            const angle = -90 + i * 60;
            const [x, y] = pt(i, R + 27);
            const anchor = Math.abs(angle) <= 30 ? "middle" : angle > 0 && angle < 180 ? "start" : "end";
            return (
              <text
                key={s.key}
                x={x}
                y={y + 3}
                textAnchor={anchor}
                fontSize="10.5"
                fontWeight="600"
                fill="rgba(255,255,255,0.55)"
                style={{ paintOrder: "stroke", stroke: "rgba(10,14,26,0.85)", strokeWidth: 3 }}
              >
                {s.label}
              </text>
            );
          })}
        </svg>

        <div className="flex w-full flex-col gap-2">
          {stats.map((s, i) => {
            const pct = Math.min((s.value / MAX) * 100, 100);
            return (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-right text-xs font-semibold text-zinc-400">
                  {s.label}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="anim-bar-grow h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${hexToRgba(color, 0.55)}, ${color})`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums text-amber-200">
                  {s.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}