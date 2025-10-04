export function VacuumTubesPreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#1a1a1a" />
      
      {/* Definitions */}
      <defs>
        <radialGradient id="tubeGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff6600" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ff4400" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </radialGradient>
        
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Tube 1 */}
      <g transform="translate(70, 75)">
        {/* Glass envelope */}
        <ellipse cx="0" cy="0" rx="20" ry="40" fill="none" stroke="#444" strokeWidth="2" opacity="0.8" />
        <ellipse cx="0" cy="0" rx="18" ry="38" fill="#111" opacity="0.5" />
        
        {/* Filament glow */}
        <ellipse cx="0" cy="0" rx="15" ry="30" fill="url(#tubeGlow)" filter="url(#glowFilter)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
        
        {/* Internal elements */}
        <line x1="0" y1="-30" x2="0" y2="30" stroke="#ff6600" strokeWidth="1" opacity="0.8" />
        <circle cx="0" cy="-15" r="3" fill="#888" />
        <circle cx="0" cy="0" r="4" fill="#888" />
        <circle cx="0" cy="15" r="3" fill="#888" />
        
        {/* Base pins */}
        <rect x="-2" y="35" width="4" height="10" fill="#666" />
        <rect x="-10" y="35" width="4" height="10" fill="#666" />
        <rect x="6" y="35" width="4" height="10" fill="#666" />
      </g>
      
      {/* Tube 2 */}
      <g transform="translate(130, 75)">
        {/* Glass envelope */}
        <ellipse cx="0" cy="0" rx="20" ry="40" fill="none" stroke="#444" strokeWidth="2" opacity="0.8" />
        <ellipse cx="0" cy="0" rx="18" ry="38" fill="#111" opacity="0.5" />
        
        {/* Filament glow */}
        <ellipse cx="0" cy="0" rx="15" ry="30" fill="url(#tubeGlow)" filter="url(#glowFilter)">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </ellipse>
        
        {/* Internal elements */}
        <line x1="0" y1="-30" x2="0" y2="30" stroke="#ff6600" strokeWidth="1" opacity="0.8" />
        <circle cx="0" cy="-15" r="3" fill="#888" />
        <circle cx="0" cy="0" r="4" fill="#888" />
        <circle cx="0" cy="15" r="3" fill="#888" />
        
        {/* Base pins */}
        <rect x="-2" y="35" width="4" height="10" fill="#666" />
        <rect x="-10" y="35" width="4" height="10" fill="#666" />
        <rect x="6" y="35" width="4" height="10" fill="#666" />
      </g>
      
      {/* Oscilloscope trace */}
      <g transform="translate(100, 120)">
        <rect x="-50" y="-15" width="100" height="30" fill="none" stroke="#444" strokeWidth="1" rx="2" />
        <path
          d="M -40 0 Q -20 -8, 0 0 T 40 0"
          fill="none"
          stroke="#00ff00"
          strokeWidth="1.5"
          opacity="0.8"
        >
          <animate
            attributeName="d"
            values="M -40 0 Q -20 -8, 0 0 T 40 0;
                    M -40 0 Q -20 8, 0 0 T 40 0;
                    M -40 0 Q -20 -8, 0 0 T 40 0"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
}