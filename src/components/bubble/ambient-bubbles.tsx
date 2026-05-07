/**
 * 背景に漂うシャボン玉。装飾用、interactive ではない。
 */
type Bubble = {
  size: number; // px
  left: string; // %
  delay: number; // s
  duration: number; // s
  color: string; // tailwind from-color
};

const palette = [
  "from-emerald-200/60 to-teal-200/30",
  "from-violet-200/60 to-indigo-200/30",
  "from-sky-200/60 to-blue-200/30",
  "from-amber-200/60 to-orange-200/30",
  "from-rose-200/60 to-pink-200/30",
];

function genBubbles(count: number): Bubble[] {
  // 決定的な疑似ランダム(ハイドレーション一致)
  return Array.from({ length: count }).map((_, i) => {
    const size = 40 + ((i * 37) % 110);
    const leftPct = (i * 17 + 5) % 95;
    const delay = (i * 1.7) % 18;
    const duration = 14 + ((i * 3) % 10);
    return {
      size,
      left: `${leftPct}%`,
      delay,
      duration,
      color: palette[i % palette.length],
    };
  });
}

export function AmbientBubbles({ count = 14 }: { count?: number }) {
  const bubbles = genBubbles(count);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className={`absolute bottom-0 rounded-full bg-gradient-to-br ${b.color} animate-drift blur-[2px]`}
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            animationDelay: `-${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
      {/* soft sky background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-violet-50/30 to-emerald-50" />
    </div>
  );
}
