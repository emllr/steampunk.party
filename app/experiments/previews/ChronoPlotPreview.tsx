export function ChronoPlotPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#f3e7caff" />

      {/* Graph frame */}
      <rect x="20" y="20" width="160" height="110" fill="none" stroke="#8b7e5dff" strokeWidth="2" />

      {/* Grid lines */}
      <g opacity="0.3">
        {[40, 60, 80, 100, 120, 140, 160].map((x) => (
          <line key={`v-${x}`} x1={x} y1="20" x2={x} y2="130" stroke="#464134ff" strokeWidth="0.5" />
        ))}
        {[40, 60, 80, 100, 120].map((y) => (
          <line key={`h-${y}`} x1="20" y1={y} x2="180" y2={y} stroke="#9f8648ff" strokeWidth="0.5" />
        ))}
      </g>

      {/* Animated data lines */}
      <g>
        {/* Sine wave */}
        <path
          d="M 20 75 Q 50 40, 80 75 T 140 75 T 200 75"
          fill="none"
          stroke="#5e7fe459"
          strokeWidth="2"
        >
          <animate
            attributeName="d"
            values="M 20 75 Q 50 40, 80 75 T 140 75 T 200 75;
                    M 20 75 Q 50 110, 80 75 T 140 75 T 200 75;
                    M 20 75 Q 50 40, 80 75 T 140 75 T 200 75"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Sawtooth wave */}
        <path
          d="M 20 90 L 60 50 L 60 90 L 100 50 L 100 90 L 140 50 L 140 90 L 180 50"
          fill="none"
          stroke="#d09d59af"
          strokeWidth="2"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -40,0; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* Noise */}
        <path
          d="M 20 100 L 25 95 L 30 105 L 35 98 L 40 102 L 45 96 L 50 104 L 55 99 L 60 103 L 65 97 L 70 101 L 75 95 L 80 105"
          fill="none"
          stroke="#ce6666a8"
          strokeWidth="1.5"
          opacity="0.7"
        >
          <animate
            attributeName="d"
            values="M 20 100 L 25 95 L 30 105 L 35 98 L 40 102 L 45 96 L 50 104 L 55 99 L 60 103 L 65 97 L 70 101 L 75 95 L 80 105;
                    M 20 100 L 25 102 L 30 98 L 35 103 L 40 97 L 45 101 L 50 96 L 55 102 L 60 98 L 65 104 L 70 96 L 75 103 L 80 98"
            dur="0.5s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 100,0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Crosshair */}
      <g opacity="0">
        <line x1="100" y1="20" x2="100" y2="130" stroke="#8b6914" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="20" y1="75" x2="180" y2="75" stroke="#8b6914" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="100" cy="75" r="3" fill="#ffd700" />
        <animate
          attributeName="opacity"
          values="0;0.8;0"
          dur="3s"
          repeatCount="indefinite"
        />
      </g>

      {/* Corner rivets */}
      <circle cx="20" cy="20" r="3" fill="#b8860b" />
      <circle cx="180" cy="20" r="3" fill="#b8860b" />
      <circle cx="20" cy="130" r="3" fill="#b8860b" />
      <circle cx="180" cy="130" r="3" fill="#b8860b" />
    </svg>
  );
}
