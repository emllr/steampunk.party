"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-10 border-t border-bronze-600/40 bg-bronze-50/40", className)}>
      {/* Ornamental divider with gauges */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-bronze-700/40 to-transparent" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
          {/* Left gauge */}
          <Gauge label="Pressure" value={72} />
          {/* Ornamental bar */}
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-amber-300/60 via-amber-500/40 to-amber-300/60 ring-1 ring-inset ring-bronze-700/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]" />
          {/* Right gauge */}
          <Gauge label="Heat" value={58} />
        </div>
      </div>
      <div className="container mx-auto px-6 pb-8 text-sm text-bronze-800">
        <p>© {new Date().getFullYear()} steampunk.party — Built with Next.js, Tailwind, and shadcn-style UI</p>
      </div>
    </footer>
  );
}

function Gauge({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180 - 90; // -90..90

  return (
    <div className="relative flex items-center gap-3">
      <div className="relative size-16 rounded-full bg-gradient-to-b from-amber-200/70 to-amber-400/30 ring-1 ring-inset ring-bronze-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.15)]">
        <svg viewBox="0 0 100 60" className="absolute inset-0 m-auto h-[70%] w-[70%] translate-y-[18%] text-bronze-800">
          <path d="M10,60 A40,40 0 0,1 90,60" fill="none" stroke="currentColor" strokeWidth="4" />
          <line
            x1="50"
            y1="60"
            x2={50 + 34 * Math.cos((Math.PI / 180) * angle)}
            y2={60 + -34 * Math.sin((Math.PI / 180) * angle)}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="rounded bg-bronze-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 ring-1 ring-inset ring-bronze-700/50">
            {clamped}%
          </span>
        </div>
      </div>
      <div className="text-xs font-medium text-bronze-900">{label}</div>
    </div>
  );
}
