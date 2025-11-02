export function SmokeSimPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#1a1a1a" />

      {/* Definitions */}
      <defs>
        <filter id="smokeBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
        </filter>

        <radialGradient id="smokeGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#b8860b" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#8b6914" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#523b20" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Smoke particles */}
      <g filter="url(#smokeBlur)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`smoke-${i}`}>
            <circle
              cx="100"
              cy="150"
              r="20"
              fill="url(#smokeGradient)"
            >
              <animate
                attributeName="cy"
                values="150;-20"
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
              />
              <animate
                attributeName="r"
                values="10;40;60"
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; ${20 - i * 10},0; ${40 - i * 20},0"
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
                additive="sum"
              />
            </circle>

            {/* Secondary smoke */}
            <circle
              cx={80 + i * 10}
              cy="150"
              r="15"
              fill="url(#smokeGradient)"
            >
              <animate
                attributeName="cy"
                values="150;-20"
                dur={`${3.5 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4 + 0.2}s`}
              />
              <animate
                attributeName="r"
                values="8;35;50"
                dur={`${3.5 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4 + 0.2}s`}
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur={`${3.5 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4 + 0.2}s`}
              />
            </circle>
          </g>
        ))}
      </g>

      {/* Emitter base */}
      <rect x="85" y="140" width="30" height="10" fill="#8b6914" rx="2" />
      <circle cx="100" cy="145" r="3" fill="#ffd700">
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
