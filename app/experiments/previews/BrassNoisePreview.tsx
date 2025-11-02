export function BrassNoisePreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="url(#brassGradient)" />

      {/* Definitions */}
      <defs>
        <linearGradient id="brassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8860b" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8b6914" stopOpacity="0.2" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Resonator tubes */}
      <g transform="translate(100, 75)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Tube */}
            <rect
              x={-60 + i * 30}
              y={-40 + i * 5}
              width="8"
              height={60 - i * 8}
              fill="#b8860b"
              stroke="#8b6914"
              strokeWidth="1"
              rx="2"
            />
            {/* Resonance wave */}
            <path
              d={`M ${-56 + i * 30} ${20 - i * 4}
                   Q ${-56 + i * 30} ${10 - i * 4} ${-56 + i * 30} ${0 - i * 4}
                   T ${-56 + i * 30} ${-20 + i * 4}`}
              stroke="#ffd700"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur={`${1.5 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}

        {/* Sound waves */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`wave-${i}`}
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="#ffd700"
            strokeWidth="1"
            opacity="0"
          >
            <animate
              attributeName="r"
              values="10;80;10"
              dur="3s"
              repeatCount="indefinite"
              begin={`${i}s`}
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur="3s"
              repeatCount="indefinite"
              begin={`${i}s`}
            />
          </circle>
        ))}

        {/* Control knobs */}
        <g transform="translate(0, 50)">
          {[-30, 0, 30].map((x, i) => (
            <g key={`knob-${i}`} transform={`translate(${x}, 0)`}>
              <circle cx="0" cy="0" r="8" fill="#4a4a4a" stroke="#8b6914" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="-5" stroke="#ffd700" strokeWidth="2">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 0 0;360 0 0"
                  dur={`${4 + i * 2}s`}
                  repeatCount="indefinite"
                />
              </line>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
