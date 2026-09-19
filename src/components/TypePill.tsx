import { hexToRgba } from "@/lib/constants";
import type { TypeChip } from "@/lib/pokedex";

export function TypePill({
  type,
  size = "md",
  onClick,
}: {
  type: TypeChip;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex cursor-default items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide text-white ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      style={{
        background: hexToRgba(type.hex, 0.9),
        boxShadow: `0 0 0 1px ${hexToRgba(type.hex, 0.6)}, 0 4px 14px -6px ${type.hex}`,
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-white/90 shadow"
        aria-hidden
      />
      {type.label}
    </span>
  );
}