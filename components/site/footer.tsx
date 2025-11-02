"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  // State for gauge values
  const [pressure, setPressure] = React.useState(80); // PSI
  const [temperature, setTemperature] = React.useState(250); // °F
  const [exploded, setExploded] = React.useState(false);
  const [steamIntensity, setSteamIntensity] = React.useState(0);

  // Refs for hover states
  const pressureHoverRef = React.useRef(false);
  const heatHoverRef = React.useRef(false);

  // Constants for realistic steam engine operation
  const MAX_PRESSURE = 180; // PSI - typical steam engine max safe pressure
  const MAX_TEMP = 300; // °F - superheated steam temperature
  const EXPLOSION_THRESHOLD = 0.95; // 95% of max values triggers explosion

  // Update loop for gauge physics
  React.useEffect(() => {
    if (exploded) return;

    const interval = setInterval(() => {
      setPressure(prev => {
        let newPressure = prev;

        // Pressure increases on hover
        if (pressureHoverRef.current) {
          newPressure = Math.min(MAX_PRESSURE, prev + 3);
        } else {
          // Natural pressure decay
          newPressure = Math.max(21, prev - 0.5);
        }

        return newPressure;
      });

      setTemperature(prev => {
        let newTemp = prev;

        // Temperature decreases on hover (cooling)
        if (heatHoverRef.current) {
          newTemp = Math.max(42, prev - 2);
        } else {
          // Temperature follows pressure (PV=nRT)
          const targetTemp = 42 + (pressure / MAX_PRESSURE) * 250;
          const diff = targetTemp - prev;
          newTemp = prev + diff * 0.1; // Smooth following
        }

        return newTemp;
      });
    }, 50); // 20 FPS update

    return () => clearInterval(interval);
  }, [pressure, exploded]);

  // Calculate steam intensity based on pressure and temperature
  React.useEffect(() => {
    const pressureRatio = pressure / MAX_PRESSURE;
    const tempRatio = temperature / MAX_TEMP;
    const avgRatio = (pressureRatio + tempRatio) / 2;

    setSteamIntensity(avgRatio);

    // Check for explosion condition
    if (pressureRatio > EXPLOSION_THRESHOLD && tempRatio > EXPLOSION_THRESHOLD && !exploded) {
      triggerExplosion();
    }
  }, [pressure, temperature, exploded]);

  const triggerExplosion = () => {
    setExploded(true);
    // Play explosion sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLZhjMGHGS/7OWcUBELUqzn77VkFAErgNbyw3YwChRcu+/lm1IUC1Cn5vC1ZRYHMoPQ9cybUBQNT6Th8bVnHwkqfMzz13+DwAAAAAAAAAAA');
    audio.play().catch(() => {}); // Ignore errors if audio fails
  };

  if (exploded) {
    return (
      <footer className={cn("relative mt-10 overflow-hidden", className)}>
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-orange-900/20 animate-pulse" />
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">💥</div>
            <p className="text-bronze-800/80 dark:text-bronze-400 animate-pulse">
              The boiler exploded! Refresh to rebuild.
            </p>
            <div className="text-sm text-bronze-600/60 dark:text-bronze-500 explode">
              © {new Date().getFullYear()} steampunk.party — Built with Next.js, Tailwind, and shadcn-style UI
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("mt-10 border-t border-bronze-600/40 bg-bronze-50/40 dark:border-bronze-700/20 dark:bg-bronze-900/20", className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-bronze-700/40 to-transparent" />

        {/* Main gauge area */}
        <div className="relative mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Pressure Gauge */}
            <div
              className="relative cursor-pointer select-none"
              onMouseEnter={() => pressureHoverRef.current = true}
              onMouseLeave={() => pressureHoverRef.current = false}
            >
              <Gauge
                value={pressure}
                max={MAX_PRESSURE}
                unit="PSI"
                label="Pressure"
                type="pressure"
                steamIntensity={steamIntensity}
              />
            </div>

            {/* Connecting Pipe */}
            <div className="relative flex-1">
              <svg className="w-full h-20" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* Main pipe */}
                <path
                  d="M 10 40 L 190 40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-bronze-700 dark:text-bronze-600"
                />
                {/* Pipe joints */}
                <circle cx="10" cy="40" r="8" className="fill-bronze-800 dark:fill-bronze-700" />
                <circle cx="190" cy="40" r="8" className="fill-bronze-800 dark:fill-bronze-700" />
                {/* Rivets */}
                {[30, 60, 90, 120, 150, 170].map((x) => (
                  <circle key={x} cx={x} cy="40" r="3" className="fill-bronze-600 dark:fill-bronze-500" />
                ))}
              </svg>

              {/* Steam from pipe */}
              {steamIntensity > 0.5 && (
                <div className="absolute inset-0 pointer-events-none">
                  {[0.2, 0.5, 0.8, 1.0, 1.2].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute top-0 animate-float"
                      style={{
                        left: `${pos * 100}%`,
                        animationDelay: `${i * 0.5}s`,
                        opacity: (steamIntensity - 0.5) * 2
                      }}
                    >
                      <div className="h-4 w-4 rounded-full bg-gray-300/40 blur-md" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Temperature Gauge */}
            <div
              className="relative cursor-pointer select-none"
              onMouseEnter={() => heatHoverRef.current = true}
              onMouseLeave={() => heatHoverRef.current = false}
            >
              <Gauge
                value={temperature}
                max={MAX_TEMP}
                unit="°F"
                label="Heat"
                type="heat"
                steamIntensity={steamIntensity}
              />
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="container mx-auto px-6 pb-8 text-center text-sm text-bronze-800/80 dark:text-bronze-400">
          <p>© {new Date().getFullYear()} steampunk.party — Built with Next.js, Tailwind, and shadcn-style UI</p>
        </div>
      </div>
    </footer>
  );
}

interface GaugeProps {
  value: number;
  max: number;
  unit: string;
  label: string;
  type: "pressure" | "heat";
  steamIntensity: number;
}

function Gauge({ value, max, unit, label, type, steamIntensity }: GaugeProps) {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 270 - 135; // -135 to 135 degrees
  const isHigh = percentage > 85;

  // Debug: log the current values
  console.log(`${type}: value=${value}, percentage=${percentage.toFixed(1)}%, angle=${angle.toFixed(1)}°`);


  return (
    <div className="relative">
      {/* Steam effect for high values */}
      {steamIntensity > 0.7 && (
        <div className="absolute -inset-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 animate-float"
              style={{
                animationDelay: `${i * 0.3}s`,
                opacity: (steamIntensity - 0.7) * 3
              }}
            >
              <div className="h-6 w-6 rounded-full bg-gray-300/30 blur-md" />
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "relative h-32 w-32 rounded-full bg-gradient-to-b from-bronze-800/70 to-amber-400/30",
        "ring-2 ring-inset ring-bronze-800/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]",
        "transition-all duration-300",
        isHigh && "ring-red-600/60 animate-pulse"
      )}>
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <defs>
            {/* Define gradient for the arc */}
            <linearGradient id={`gauge-gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Gauge markings */}
          <g transform="translate(50,50)">
            {/* Full arc background - static */}
            <path
              d="M -24.75,-24.75 A 35,35 0 1,1 24.75,-24.75"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-bronze-700/20 dark:text-bronze-500/20"
            />

            {/* Fixed arc segments that show/hide based on needle position */}
            {/* Left segment - needle points here for LOW values, so show BRONZE */}
            <path
              d="M -24.75,-24.75 A 35,35 0 0,1 0,-35"
              fill="none"
              stroke="#92400e"
              strokeWidth="4"
              className="transition-opacity duration-300"
              opacity={percentage < 16.66 ? 0.9 : 0.3}
            />

            {/* Middle segment - needle points here for MEDIUM values, so show ORANGE */}
            <path
              d="M 0,-35 A 35,35 0 0,1 24.75,-24.75"
              fill="none"
              stroke="#ea580c"
              strokeWidth="4"
              className="transition-opacity duration-300"
              opacity={percentage >= 16.66 && percentage < 33.33 ? 0.9 : 0.3}
            />

            {/* Right segment - needle points here for HIGH values, so show RED */}
            <path
              d="M 24.75,-24.75 A 35,35 0 0,1 24.75,24.75"
              fill="none"
              stroke="#dc2626"
              strokeWidth="4"
              className="transition-opacity duration-300"
              opacity={percentage >= 33.33 ? 0.9 : 0.3}
            />

            {/* DEBUG: Show exactly where needle is pointing */}
            <circle
              cx={30 * Math.cos((Math.PI / 180) * angle)}
              cy={30 * Math.sin((Math.PI / 180) * angle)}
              r="2"
              fill="yellow"
              opacity="0.8"
            />

            {/* Needle - moves independently */}
            <line
              x1="0"
              y1="0"
              x2={30 * Math.cos((Math.PI / 180) * angle)}
              y2={30 * Math.sin((Math.PI / 180) * angle)}
              stroke={isHigh ? "#dc2626" : "#92400e"}
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-all duration-150"
            />

            {/* Center cap */}
            <circle cx="0" cy="0" r="6" className="fill-bronze-900 dark:fill-bronze-700" />
            <circle cx="0" cy="0" r="4" className="fill-bronze-700 dark:fill-bronze-500" />
          </g>
        </svg>

        {/* Digital readout */}
        <div className="absolute inset-x-0 bottom-4 text-center">
          <div className={cn(
            "inline-block rounded bg-black/80 px-2 py-1 font-mono text-xs",
            isHigh ? "text-red-400 animate-pulse" : "text-amber-400"
          )}>
            {Math.round(value)}{unit}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-bronze-900 dark:text-bronze-300">
          {label}
        </div>
        {isHigh && (
          <div className="text-xs text-red-600 dark:text-red-400 animate-pulse mt-1">
            DANGER
          </div>
        )}
      </div>
    </div>
  );
}
