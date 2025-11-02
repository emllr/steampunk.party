export function OrreryConstructorPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#000814" />

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 200}
          cy={Math.random() * 150}
          r={Math.random() * 1.5}
          fill="#fff"
          opacity={0.3 + Math.random() * 0.7}
        />
      ))}

      {/* Base platform */}
      <ellipse cx="100" cy="120" rx="60" ry="15" fill="#1a1a1a" stroke="#8c7d58ff" strokeWidth="1" />

      {/* Central sun gear */}
      <g transform="translate(100, 75)">
        <circle cx="0" cy="0" r="20" fill="#c2a661ff" stroke="#8b6914" strokeWidth="1" />
        <circle cx="0" cy="0" r="8" fill="#4a4a4a" />
        {/* Sun */}
        <circle cx="0" cy="0" r="6" fill="#fddf35ff" filter="url(#sunGlow)" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="20s"
          repeatCount="indefinite"
        />
      </g>

      {/* Earth system */}
      <g transform="translate(100, 75)">
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;360 0 0"
            dur="10s"
            repeatCount="indefinite"
          />
          {/* Gear */}
          <circle cx="35" cy="0" r="12" fill="none" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
          {/* Arm */}
          <line x1="0" y1="0" x2="35" y2="0" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
          {/* Earth */}
          <circle cx="35" cy="0" r="4" fill="#6a89e5ff" />
        </g>
      </g>

      {/* Mars system */}
      <g transform="translate(100, 75)">
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;360 0 0"
            dur="18.8s"
            repeatCount="indefinite"
          />
          {/* Gear */}
          <circle cx="50" cy="0" r="15" fill="none" stroke="#997e39ff" strokeWidth="1" opacity="0.5" />
          {/* Arm */}
          <line x1="0" y1="0" x2="50" y2="0" stroke="#947e45ff" strokeWidth="1" opacity="0.5" />
          {/* Mars */}
          <circle cx="50" cy="0" r="3" fill="#914e4eff" />
        </g>
      </g>

      {/* Venus system */}
      <g transform="translate(100, 75)">
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;-360 0 0"
            dur="6s"
            repeatCount="indefinite"
          />
          {/* Gear */}
          <circle cx="-25" cy="0" r="10" fill="none" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
          {/* Arm */}
          <line x1="0" y1="0" x2="-25" y2="0" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
          {/* Venus */}
          <circle cx="-25" cy="0" r="3.5" fill="#ffa600ff" />
        </g>
      </g>

      {/* Decorative studs */}
      <g transform="translate(100, 120)">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 55;
          const y = Math.sin(angle) * 13;
          return (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="1" fill="#daba6aff" />
          );
        })}
      </g>

      <defs>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
