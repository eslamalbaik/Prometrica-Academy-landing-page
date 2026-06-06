import { motion } from "framer-motion";

export function MolecularHero() {
  const nodes = [
    { x: 50, y: 50, r: 14, accent: true },
    { x: 20, y: 25, r: 8 },
    { x: 80, y: 22, r: 9 },
    { x: 15, y: 75, r: 10 },
    { x: 85, y: 78, r: 8 },
    { x: 50, y: 12, r: 7 },
    { x: 50, y: 88, r: 9 },
    { x: 30, y: 50, r: 6 },
    { x: 70, y: 50, r: 6 },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
    [1, 5], [2, 5], [3, 6], [4, 6], [1, 7], [2, 8],
  ];

  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* Glow orb */}
      <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.16_175/0.35),transparent_70%)] blur-2xl" />
      {/* Orbiting ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border border-accent/20 border-dashed"
        animate={{ rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.16 175)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.74 0.14 220)" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="node">
            <stop offset="0%" stopColor="oklch(0.95 0.08 175)" />
            <stop offset="100%" stopColor="oklch(0.55 0.16 200)" />
          </radialGradient>
          <radialGradient id="nodeAccent">
            <stop offset="0%" stopColor="oklch(0.95 0.08 200)" />
            <stop offset="100%" stopColor="oklch(0.6 0.18 195)" />
          </radialGradient>
        </defs>

        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke="url(#edge)"
            strokeWidth="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: i * 0.08 }}
          />
        ))}

        {nodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x} cy={n.y}
            r={n.r / 4}
            fill={n.accent ? "url(#nodeAccent)" : "url(#node)"}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{
              scale: { duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
              delay: 1 + i * 0.05,
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px`, filter: "drop-shadow(0 0 2px oklch(0.78 0.16 175))" }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/70"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            animation: `float-particle ${5 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
