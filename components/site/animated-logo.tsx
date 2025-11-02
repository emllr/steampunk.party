"use client";

import React from "react";

export function AnimatedLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 2 320 62"
      className={`${className} group`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Brass gradient */}
        <linearGradient id="brass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className="stop-color-bronze-300" />
          <stop offset="50%" className="stop-color-bronze-500" />
          <stop offset="100%" className="stop-color-bronze-700" />
        </linearGradient>

        {/* Gear pattern */}
        <pattern id="gear-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="8" fill="none" className="stroke-bronze-600/20" strokeWidth="0.5" />
          <g transform="translate(10,10)">
            {[...Array(8)].map((_, i) => (
              <rect key={i} x="-1" y="-10" width="2" height="3" transform={`rotate(${i * 45})`} className="fill-bronze-600/20" />
            ))}
          </g>
        </pattern>

        {/* Steam animation paths */}
        <path id="steam1" d="M0,0 Q-3,-3 0,-8 T0,-16" fill="none" />
        <path id="steam2" d="M0,0 Q3,-3 0,-8 T0,-16" fill="none" />
        <path id="steam3" d="M0,0 Q-2,-4 2,-8 T0,-16" fill="none" />
      </defs>

      {/* Background decorative gears */}
      <g className="opacity-30">
        <circle cx="40" cy="36" r="24" fill="url(#gear-pattern)" />
        <circle cx="280" cy="36" r="20" fill="url(#gear-pattern)" />
      </g>

      {/* Main gear (animated) */}
      <g transform="translate(39,26)">
        <g className="animate-[spin_20s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-all duration-300">
          <circle r="24" fill="none" className="stroke-bronze-600 dark:stroke-bronze-400" strokeWidth="2" />
          <circle r="20" fill="none" className="stroke-bronze-500 dark:stroke-bronze-300" strokeWidth="1" />
          <circle r="15" className="fill-bronze-700 dark:fill-bronze-500" />
          {/* Gear teeth */}
          {[...Array(12)].map((_, i) => (
            <rect
              key={i}
              x="-3"
              y="-24"
              width="6"
              height="6"
              className="fill-bronze-700 dark:fill-bronze-600"
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>
      </g>

      {/* Small gear (counter-rotating) */}
      <g transform="translate(297,39)">
        <g className="animate-[spin_15s_linear_infinite_reverse] group-hover:animate-[spin_2s_linear_infinite_reverse] transition-all duration-300">
          <circle r="16" fill="none" className="stroke-bronze-600 dark:stroke-bronze-400" strokeWidth="1.5" />
          <circle r="10" fill="none" className="stroke-bronze-500 dark:stroke-bronze-300" strokeWidth="1" />
          <circle r="4" className="fill-bronze-700 dark:fill-bronze-500" />
          {/* Gear teeth */}
          {[...Array(10)].map((_, i) => (
            <rect
              key={i}
              x="-2.5"
              y="-15"
              width="4"
              height="4"
              className="fill-bronze-700 dark:fill-bronze-600"
              transform={`rotate(${i * 36})`}
            />
          ))}
        </g>
      </g>

      {/* Text with decorative elements */}
      <g transform="translate(160, 36)">
        {/* Main text with custom steampunk styling */}
        <text
          textAnchor="middle"
          className="fill-bronze-800 dark:fill-bronze-900/80 group-hover:fill-bronze-600 dark:group-hover:fill-bronze-400 transition-colors duration-300"
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontSize: "35px",
            fontWeight: 800,
            letterSpacing: "0.05em"
          }}
        >
          <tspan>STEAMPUNK</tspan>
        </text>
        <text
          y="20"
          textAnchor="middle"
          className="fill-bronze-700 dark:fill-bronze-900/70 group-hover:fill-bronze-500 dark:group-hover:fill-bronze-200 transition-colors duration-300"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "18px",
            fontWeight: 400,
            letterSpacing: "0.2em"
          }}
        >
          <tspan>PARTY</tspan>
        </text>
        {/* Decorative line between words */}
        <line x1="-60" y1="4" x2="60" y2="4" className="stroke-bronze-600 dark:stroke-bronze-400" strokeWidth="0.5" />
        {/* Small decorative dots */}
        <circle cx="-65" cy="4" r="1.5" className="fill-bronze-600 dark:fill-bronze-400" />
        <circle cx="65" cy="4" r="1.5" className="fill-bronze-600 dark:fill-bronze-400" />
      </g>

      {/* Decorative steam pipes */}
      <g className="stroke-bronze-600 dark:stroke-bronze-4000" strokeWidth="2" fill="none">
        <path d="M65,36 Q80,36 80,24 L90,24" />
        <path d="M255,36 Q240,36 240,24 L230,24" />
        <circle cx="88" cy="24" r="3" className="fill-bronze-600 dark:fill-bronze-300/80" />
        <circle cx="230" cy="24" r="3" className="fill-bronze-600 dark:fill-bronze-400" />
      </g>

      {/* Animated steam */}
      <g className="opacity-30 group-hover:opacity-90 transition-opacity duration-300">
        {[90, 230].map((x, idx) => (
          <g key={idx} transform={`translate(${x},24)`}>
            {[0, 1, 2].map((i) => (
              <g key={i} className="animate-[float_3s_ease-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }}>
                <circle r="1.5" className="fill-bronze-300 dark:fill-bronze-700" opacity="0">
                  <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`}>
                    <mpath href={`#steam${(i % 3) + 1}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                  <animate
                    attributeName="r"
                    values="1.5;3;4"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                  <animate
                    attributeName="r"
                    values="4.5;5;6"
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${i * 0.5}s`}
                  />
                </circle>
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* Decorative rivets */}
      {[
        [75, 18],
        [245, 18],
        [100, 52],
        [220, 52],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2"
          className="fill-bronze-600 dark:fill-bronze-400 group-hover:fill-bronze-500 dark:group-hover:fill-bronze-300 transition-colors duration-300"
          style={{
            filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.3))",
          }}
        />
      ))}

      {/* Hover glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-16px);
          }
        }
      `}</style>
    </svg>
  );
}
