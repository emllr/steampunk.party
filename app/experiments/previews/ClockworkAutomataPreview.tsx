export function ClockworkAutomataPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#f7f1e3" />

      {/* L-system tree structure */}
      <g transform="translate(100, 130)">
        {/* Main branch */}
        <line x1="0" y1="0" x2="0" y2="-40" stroke="#8b6914" strokeWidth="3">
          <animate
            attributeName="y2"
            values="0;-40"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>

        {/* Left branches */}
        <g>
          <line x1="0" y1="-40" x2="-20" y2="-60" stroke="#8b6914" strokeWidth="2" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="0.5s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-20" y1="-60" x2="-30" y2="-70" stroke="#8b6914" strokeWidth="1.5" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="1s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-20" y1="-60" x2="-15" y2="-75" stroke="#8b6914" strokeWidth="1.5" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="1s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Right branches */}
        <g>
          <line x1="0" y1="-40" x2="20" y2="-60" stroke="#8b6914" strokeWidth="2" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="0.5s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
          <line x1="20" y1="-60" x2="30" y2="-70" stroke="#8b6914" strokeWidth="1.5" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="1s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
          <line x1="20" y1="-60" x2="15" y2="-75" stroke="#8b6914" strokeWidth="1.5" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1"
              dur="2s"
              begin="1s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Gears at branch points */}
        <g opacity="0">
          <circle cx="0" cy="-40" r="5" fill="none" stroke="#b8860b" strokeWidth="1" />
          <circle cx="0" cy="-40" r="2" fill="#4a4a4a" />
          <animate
            attributeName="opacity"
            values="0;1"
            dur="2s"
            begin="0.5s"
            fill="freeze"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 -40;360 0 -40"
            dur="4s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </g>

        <g opacity="0">
          <circle cx="-20" cy="-60" r="4" fill="none" stroke="#b8860b" strokeWidth="1" />
          <circle cx="-20" cy="-60" r="1.5" fill="#4a4a4a" />
          <animate
            attributeName="opacity"
            values="0;1"
            dur="2s"
            begin="1s"
            fill="freeze"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -20 -60;-360 -20 -60"
            dur="3s"
            begin="1s"
            repeatCount="indefinite"
          />
        </g>

        <g opacity="0">
          <circle cx="20" cy="-60" r="4" fill="none" stroke="#b8860b" strokeWidth="1" />
          <circle cx="20" cy="-60" r="1.5" fill="#4a4a4a" />
          <animate
            attributeName="opacity"
            values="0;1"
            dur="2s"
            begin="1s"
            fill="freeze"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 20 -60;-360 20 -60"
            dur="3s"
            begin="1s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Control text */}
      <text x="100" y="20" textAnchor="middle" fill="#8b6914" fontSize="10" fontFamily="monospace">
        F → F[+F][-F]
      </text>
    </svg>
  );
}
