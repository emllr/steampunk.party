export function GearLatticePreview() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="150" fill="#f7f1e3" />

      {/* Gear definitions */}
      <defs>
        <g id="gear">
          <circle cx="0" cy="0" r="18" fill="#b8860b" stroke="#8b6914" strokeWidth="1" />
          <circle cx="0" cy="0" r="8" fill="#4a4a4a" />
          {/* Teeth */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const x1 = Math.cos(angle) * 18;
            const y1 = Math.sin(angle) * 18;
            const x2 = Math.cos(angle) * 22;
            const y2 = Math.sin(angle) * 22;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b6914" strokeWidth="3" strokeLinecap="round" />
            );
          })}
        </g>

        <g id="smallGear">
          <circle cx="0" cy="0" r="12" fill="#8b6914" stroke="#6a4f2a" strokeWidth="1" />
          <circle cx="0" cy="0" r="5" fill="#4a4a4a" />
          {/* Teeth */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = Math.cos(angle) * 12;
            const y1 = Math.sin(angle) * 12;
            const x2 = Math.cos(angle) * 15;
            const y2 = Math.sin(angle) * 15;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6a4f2a" strokeWidth="2" strokeLinecap="round" />
            );
          })}
        </g>
      </defs>

      {/* Large central gear */}
      <g transform="translate(100, 75)">
        <use href="#gear">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;360 0 0"
            dur="8s"
            repeatCount="indefinite"
          />
        </use>
      </g>

      {/* Surrounding gears */}
      <g transform="translate(60, 45)">
        <use href="#smallGear">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;-360 0 0"
            dur="5.33s"
            repeatCount="indefinite"
          />
        </use>
      </g>

      <g transform="translate(140, 45)">
        <use href="#smallGear">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;-360 0 0"
            dur="5.33s"
            repeatCount="indefinite"
          />
        </use>
      </g>

      <g transform="translate(60, 105)">
        <use href="#smallGear">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;-360 0 0"
            dur="5.33s"
            repeatCount="indefinite"
          />
        </use>
      </g>

      <g transform="translate(140, 105)">
        <use href="#smallGear">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0;-360 0 0"
            dur="5.33s"
            repeatCount="indefinite"
          />
        </use>
      </g>

      {/* Connection lines */}
      <g opacity="0.3">
        <line x1="100" y1="75" x2="60" y2="45" stroke="#8b6914" strokeWidth="1" />
        <line x1="100" y1="75" x2="140" y2="45" stroke="#8b6914" strokeWidth="1" />
        <line x1="100" y1="75" x2="60" y2="105" stroke="#8b6914" strokeWidth="1" />
        <line x1="100" y1="75" x2="140" y2="105" stroke="#8b6914" strokeWidth="1" />
      </g>
    </svg>
  );
}
