"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/lib/utils";

type BubbleColor = "emerald" | "violet" | "amber" | "sky" | "rose" | "slate";
type BubbleSize = "sm" | "md" | "lg" | "xl";
type FloatSpeed = "slow" | "normal" | "fast" | "none";

const colorMap: Record<BubbleColor, string> = {
  emerald:
    "from-emerald-300 via-emerald-400 to-teal-500 text-white",
  violet:
    "from-violet-300 via-violet-400 to-indigo-500 text-white",
  amber:
    "from-amber-200 via-amber-300 to-orange-400 text-amber-950",
  sky: "from-sky-300 via-sky-400 to-blue-500 text-white",
  rose: "from-rose-300 via-rose-400 to-pink-500 text-white",
  slate: "from-slate-200 via-slate-300 to-slate-400 text-slate-900",
};

const sizeMap: Record<BubbleSize, string> = {
  sm: "h-24 w-24 text-xs",
  md: "h-32 w-32 text-sm",
  lg: "h-44 w-44 text-base",
  xl: "h-56 w-56 text-lg",
};

const floatMap: Record<FloatSpeed, string> = {
  none: "",
  fast: "animate-float-fast",
  normal: "animate-float",
  slow: "animate-float-slow",
};

type BubbleProps = {
  href?: Route;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  color?: BubbleColor;
  size?: BubbleSize;
  float?: FloatSpeed;
  delay?: number; // animation delay in ms (for staggered floats)
  onClick?: () => void;
  className?: string;
};

export function BubbleButton({
  href,
  label,
  sublabel,
  icon,
  color = "emerald",
  size = "lg",
  float = "normal",
  delay = 0,
  onClick,
  className,
}: BubbleProps) {
  const [popping, setPopping] = React.useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (popping) return;
    e.preventDefault();
    setPopping(true);
    onClick?.();
    setTimeout(() => {
      if (href) router.push(href);
    }, 360);
  };

  const Inner = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br shadow-2xl backdrop-blur-sm",
        "transition-transform active:scale-95",
        "ring-2 ring-white/40",
        colorMap[color],
        sizeMap[size],
        floatMap[float],
        popping && "animate-pop",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* outer glow */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-50 blur-xl",
          "bg-gradient-to-br",
          colorMap[color],
        )}
      />
      {/* shine highlight */}
      <span className="pointer-events-none absolute left-[18%] top-[12%] h-[28%] w-[28%] rounded-full bg-gradient-to-br from-white/90 via-white/40 to-transparent blur-sm" />
      <span className="pointer-events-none absolute left-[60%] top-[60%] h-[12%] w-[12%] rounded-full bg-white/60 blur-sm" />

      {/* content */}
      <span className="relative flex flex-col items-center justify-center gap-1.5 px-2 text-center font-bold leading-tight">
        {icon && <span className="opacity-95">{icon}</span>}
        <span className="text-balance">{label}</span>
        {sublabel && (
          <span className="text-[10px] font-medium opacity-90">{sublabel}</span>
        )}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} aria-label={label}>
        {Inner}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} aria-label={label}>
      {Inner}
    </button>
  );
}
