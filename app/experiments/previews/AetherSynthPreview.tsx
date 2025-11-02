export function AetherSynthPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#1a1a1a" />

      {/* Definitions */}
      <defs>
        <radialGradient id="padGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#635544ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c28556ff" stopOpacity="0.2" />
        </radialGradient>

        <filter id="synthGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Pad grid */}
      <g transform="translate(50, 40)">
        {[0, 1, 2, 3].map((i) => {
          const x = (i % 2) * 50;
          const y = Math.floor(i / 2) * 40;
          const delay = i * 0.3;
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <rect
                x="0"
                y="0"
                width="40"
                height="30"
                fill="#998c6cff"
                stroke="#8a794eff"
                strokeWidth="2"
                rx="4"
              />
              <rect
                x="0"
                y="0"
                width="40"
                height="30"
                fill="url(#padGlow)"
                opacity="0"
                rx="4"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.8;0"
                  dur="2s"
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          );
        })}
      </g>

      {/* Waveform display */}
      <g transform="translate(100, 120)">
        <rect x="-60" y="-15" width="120" height="30" fill="none" stroke="#444" strokeWidth="1" rx="2" />

        {/* Granular particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={-50 + i * 20}
            cy="0"
            r="2"
            fill="#979588ff"
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.5s"
              begin={`${i * 0.1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="0;-8;8;0"
              dur="0.5s"
              begin={`${i * 0.1}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* Control knobs */}
      <g transform="translate(100, 25)">
        {[-20, 0, 20].map((x, i) => (
          <g key={i} transform={`translate(${x}, 0)`}>
            <circle cx="0" cy="0" r="8" fill="#4a4a4a" stroke="#84827eff" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="-5" stroke="#739df185" strokeWidth="2">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0;360 0 0"
                dur={`${3 + i}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}
      </g>

      {/* Sequencer steps */}
      <g transform="translate(30, 140)">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={i * 18}
            y="0"
            width="15"
            height="8"
            fill="#52402bff"
            stroke="#856b29ff"
            strokeWidth="0.5"
            opacity="0.5"
          >
            <animate
              attributeName="fill"
              values="#604a31ff;
              #f3ebbaff;
              #5a4630ff"
              dur="2s"
              begin={`${i * 0.25}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </g>
    </svg>
  );
}
