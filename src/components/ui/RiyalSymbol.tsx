/**
 * New Saudi Riyal symbol (2024+) rendered as an inline SVG so it displays
 * consistently across all browsers/fonts. Uses currentColor, scales with
 * font-size via the `em`-based default size.
 *
 * If you have the official SAMA SVG, you can replace the <path> data below —
 * everything else (sizing, color, usages) stays the same.
 */
export function RiyalSymbol({ className = "", size = "1em" }: { className?: string; size?: number | string }) {
  return (
    <svg
      viewBox="0 0 1256 1256"
      width={size}
      height={size}
      role="img"
      aria-label="Saudi Riyal"
      className={`inline-block align-[-0.125em] ${className}`}
      fill="currentColor"
    >
      <path d="M1097 727c0 22-18 40-40 40h-94l-20 110c-4 23-24 39-47 39-29 0-51-26-46-55l17-94H614l-20 110c-4 23-24 39-47 39-29 0-51-26-46-55l17-94H361c-22 0-40-18-40-40s18-40 40-40h171l34-186H432c-22 0-40-18-40-40s18-40 40-40h148l22-122c4-23 24-39 47-39 29 0 51 26 46 55l-19 106h253l22-122c4-23 24-39 47-39 29 0 51 26 46 55l-19 106h66c22 0 40 18 40 40s-18 40-40 40h-80l-34 186h94c22 0 40 18 40 40zM865 501H612l-34 186h253l34-186z" />
    </svg>
  );
}
