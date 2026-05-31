"use client";

interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  pct,
  size = 64,
  stroke = 5,
  color = "#e40a14",
  trackColor = "#2a2a2a",
}: ProgressRingProps) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          filter: pct > 0 ? `drop-shadow(0 0 5px ${color}99)` : "none",
        }}
      />
    </svg>
  );
}
