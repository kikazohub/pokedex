export function PokeBall({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path
        d="M50 8a42 42 0 0 1 41.5 34H58.5a17 17 0 1 0-17 0H8.5A42 42 0 0 1 50 8Z"
        fill="#ee3b3b"
      />
      <path
        d="M50 92a42 42 0 0 1-41.5-34h33a17 17 0 1 0 17 0h33A42 42 0 0 1 50 92Z"
        fill="#f5f5f7"
      />
      <rect x="0" y="44" width="100" height="12" fill="#22222a" />
      <circle cx="50" cy="50" r="13" fill="#22222a" />
      <circle cx="50" cy="50" r="7" fill="#f5f5f7" />
      <path
        d="M50 2a48 48 0 0 1 47.7 42H73.8a23.2 23.2 0 1 0-47.6 0H2.3A48 48 0 0 1 50 2Z"
        fill="#ff6b6b"
        opacity="0.35"
      />
    </svg>
  );
}