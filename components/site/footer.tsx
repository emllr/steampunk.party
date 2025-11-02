"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  // Footer text constant
  const footerText = `© ${new Date().getFullYear()} steampunk.party — Built with Next.js, Tailwind, and shadcn-style UI`;

  // State for gauge values
  const [pressure, setPressure] = React.useState(80); // PSI
  const [temperature, setTemperature] = React.useState(250); // °F
  const [exploded, setExploded] = React.useState(false);
  const [steamIntensity, setSteamIntensity] = React.useState(0);
  const [audioEnabled, setAudioEnabled] = React.useState(false);

  // Refs for hover states
  const pressureHoverRef = React.useRef(false);
  const heatHoverRef = React.useRef(false);
  const footerRef = React.useRef<HTMLElement>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Generate flame properties when exploded state changes
  const flameProperties = React.useMemo(() => {
    if (!exploded) return [];

    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => ({
      delay: Math.random() * 3,
      height: 45 + Math.random() * 120,
      bottomOffset: -Math.random() * 50,
      xPosition: (i * 8.5 + 4) + (Math.random() - 0.5) * 8,
      width: 25 + Math.random() * 50,
      animationDuration: 1.5 + Math.random() * 2,
    }));
  }, [exploded]);

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

    // Start audio when we're very close to explosion (90% threshold)
    const PRE_EXPLOSION_THRESHOLD = 0.94;
    if (pressureRatio > PRE_EXPLOSION_THRESHOLD && tempRatio > PRE_EXPLOSION_THRESHOLD && !exploded && audioRef.current && audioEnabled) {
      // Start audio early if we haven't already
      if (audioRef.current.paused) {
        console.log('Starting audio early - approaching explosion');
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.log('Early audio playback failed:', error);
        });
      }
    }

    // Check for explosion condition
    if (pressureRatio > EXPLOSION_THRESHOLD && tempRatio > EXPLOSION_THRESHOLD && !exploded) {
      setExploded(true); // Trigger explosion immediately now that audio is already playing
    }
  }, [pressure, temperature, exploded, audioEnabled]);

  const scrollToFooter = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const enableAudio = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/large-underwater-explosion-190270.mp3');
      audioRef.current.preload = 'auto';

      // Try to play and immediately pause to enable audio context
      try {
        audioRef.current.volume = 0;
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.volume = 1;
        audioRef.current.currentTime = 0;
        setAudioEnabled(true);
      } catch (error) {
        console.log('Audio setup failed:', error);
      }
    }
  };

  const handleGaugeHover = (gaugeRef: React.MutableRefObject<boolean>, isEntering: boolean) => {
    gaugeRef.current = isEntering;
    if (isEntering) {
      scrollToFooter();
    }
  };

  const handleGaugeClick = (gaugeRef: React.MutableRefObject<boolean>) => {
    if (!audioEnabled) {
      enableAudio();
    }
  };

  const triggerExplosion = () => {
    // This function is now mainly for manual explosion triggers
    // Audio timing is handled in the main effect loop
    setExploded(true);
  };

  if (exploded) {
    return (
      <footer className={cn("relative mt-10", className)}>
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-orange-900/20 animate-pulse" />
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-bronze-700/40 to-transparent" />

        <div className="relative">
          {/* Exploding boiler fragments - positioned to overflow beyond footer */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {/* Left gauge fragments */}
            <div className="absolute left-8 top-12 explode-up-left">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-bronze-800/70 to-amber-400/30 ring-2 ring-red-600/60" />
            </div>
            <div className="absolute left-12 top-20 explode-left" style={{ animationDelay: '0.1s' }}>
              <svg width="40" height="40" viewBox="0 0 100 100">
                <path d="M 20,50 A 30,30 0 0,1 80,50" stroke="#92400e" strokeWidth="4" fill="none" />
              </svg>
            </div>

            {/* Right gauge fragments */}
            <div className="absolute right-8 top-12 explode-up-right">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-bronze-800/70 to-amber-400/30 ring-2 ring-red-600/60" />
            </div>
            <div className="absolute right-12 top-20 explode-right" style={{ animationDelay: '0.15s' }}>
              <svg width="40" height="40" viewBox="0 0 100 100">
                <path d="M 20,50 A 30,30 0 0,1 80,50" stroke="#dc2626" strokeWidth="4" fill="none" />
              </svg>
            </div>

            {/* Broken pipe segments */}
            <div className="absolute left-1/2 top-16 -translate-x-1/2 explode-pipe-left" style={{ animationDelay: '0.05s' }}>
              <svg width="60" height="20" viewBox="0 0 120 40">
                <path d="M 10 20 L 60 20" stroke="#6e4f2a" strokeWidth="8" fill="none" />
                <circle cx="10" cy="20" r="8" className="fill-bronze-800" />
              </svg>
            </div>
            <div className="absolute left-1/2 top-16 translate-x-1/2 explode-pipe-right" style={{ animationDelay: '0.08s' }}>
              <svg width="60" height="20" viewBox="0 0 120 40">
                <path d="M 60 20 L 110 20" stroke="#6e4f2a" strokeWidth="8" fill="none" />
                <circle cx="110" cy="20" r="8" className="fill-bronze-800" />
              </svg>
            </div>

            {/* Scattered rivets and small parts */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full bg-bronze-600 ${i % 2 ? 'explode-up-left' : 'explode-up-right'}`}
                style={{
                  left: `${30 + i * 15}%`,
                  top: `${24 + i * 3}px`,
                  animationDelay: `${0.2 + i * 0.05}s`
                }}
              />
            ))}
          </div>

          {/* Explosion message positioned where gauges were */}
          <div className="relative mx-auto max-w-4xl px-6 py-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-4 w-80">
                {/* Custom explosion flames */}
                <div className="flex justify-center">
                  <svg width="140" height="100" viewBox="0 0 140 100" className="drop-shadow-lg">
                    <defs>
                      <radialGradient id="explosionFlame" cx="50%" cy="80%" r="60%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="20%" stopColor="#fbbf24" />
                        <stop offset="60%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </radialGradient>
                    </defs>

                    {/* Multiple flame tongues for explosion effect */}
                    <path
                      d="M 70 90 C 50 80, 45 65, 50 50 C 55 35, 60 20, 65 10 C 70 20, 75 35, 80 50 C 85 65, 80 80, 70 90 Z"
                      fill="url(#explosionFlame)"
                      opacity="0.9"
                      className="animate-pulse"
                      style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}
                    />
                    <path
                      d="M 55 85 C 40 75, 35 60, 40 45 C 45 30, 50 15, 55 5 C 60 15, 65 30, 70 45 C 75 60, 70 75, 55 85 Z"
                      fill="url(#explosionFlame)"
                      opacity="0.8"
                      className="animate-pulse"
                      style={{ animationDelay: '0.7s', animationDuration: '1.5s' }}
                    />
                    <path
                      d="M 85 85 C 100 75, 105 60, 100 45 C 95 30, 90 15, 85 5 C 80 15, 75 30, 70 45 C 65 60, 70 75, 85 85 Z"
                      fill="url(#explosionFlame)"
                      opacity="0.8"
                      className="animate-pulse"
                      style={{ animationDelay: '0s', animationDuration: '1.8s' }}
                    />
                    <path
                      d="M 25 80 C 15 70, 10 55, 15 40 C 20 25, 25 10, 30 0 C 35 10, 40 25, 45 40 C 50 55, 45 70, 25 80 Z"
                      fill="url(#explosionFlame)"
                      opacity="0.7"
                      className="animate-pulse"
                      style={{ animationDelay: '1.1s', animationDuration: '1.3s' }}
                    />
                    <path
                      d="M 115 80 C 125 70, 130 55, 125 40 C 120 25, 115 10, 110 0 C 105 10, 100 25, 95 40 C 90 55, 95 70, 115 80 Z"
                      fill="url(#explosionFlame)"
                      opacity="0.7"
                      className="animate-pulse"
                      style={{ animationDelay: '0.4s', animationDuration: '1.6s' }}
                    />
                  </svg>
                </div>
                {/* Scattered boiler remnants - positioned to touch explosion flames */}
                <div className="relative h-8 flex items-center justify-center -mt-2">
                  {/* Broken gauge pieces */}
                  <div className="absolute left-12 top-0">
                    <svg width="20" height="20" viewBox="0 0 40 40" className="opacity-70">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#6e4f2a" strokeWidth="2" />
                      <circle cx="20" cy="20" r="8" className="fill-bronze-800/60" />
                    </svg>
                  </div>

                  {/* Broken pipe segment */}
                  <div className="absolute left-24 top-1">
                    <svg width="30" height="12" viewBox="0 0 60 24" className="opacity-60">
                      <path d="M 5 12 L 40 12" stroke="#6e4f2a" strokeWidth="6" fill="none" />
                      <circle cx="5" cy="12" r="6" className="fill-bronze-700/70" />
                      {/* Broken end */}
                      <path d="M 40 8 L 45 16 M 45 8 L 40 16" stroke="#6e4f2a" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Steam valve wheel */}
                  <div className="absolute right-24 top-0">
                    <svg width="24" height="24" viewBox="0 0 48 48" className="opacity-65">
                      <circle cx="24" cy="24" r="18" fill="none" stroke="#8e6535" strokeWidth="3" />
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <line
                          key={i}
                          x1="24"
                          y1="24"
                          x2={24 + 15 * Math.cos((i * 60 * Math.PI) / 180)}
                          y2={24 + 15 * Math.sin((i * 60 * Math.PI) / 180)}
                          stroke="#8e6535"
                          strokeWidth="2"
                        />
                      ))}
                      <circle cx="24" cy="24" r="4" className="fill-bronze-600/80" />
                    </svg>
                  </div>

                  {/* Scattered rivets */}
                  <div className="absolute right-12 top-2">
                    <div className="w-2 h-2 rounded-full bg-bronze-600/70"></div>
                  </div>
                  <div className="absolute left-36 top-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-bronze-700/60"></div>
                  </div>
                  <div className="absolute right-16 top-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-bronze-600/80"></div>
                  </div>

                  {/* Cracked pressure glass */}
                  <div className="absolute left-8 top-2">
                    <svg width="16" height="16" viewBox="0 0 32 32" className="opacity-50">
                      <circle cx="16" cy="16" r="12" fill="#f3f4f6" fillOpacity="0.3" stroke="#6b7280" strokeWidth="1" />
                      {/* Crack lines */}
                      <path d="M 8 16 L 24 16 M 16 8 L 16 24 M 10 10 L 22 22" stroke="#374151" strokeWidth="1" opacity="0.6" />
                    </svg>
                  </div>
                </div>

                <p className="text-bronze-800/80 dark:text-bronze-400 animate-pulse">
                  The boiler exploded! Refresh to rebuild.
                </p>
              </div>
            </div>

            {/* Footer text positioned under explosion area */}
            <div className="text-center text-sm text-bronze-800/80 dark:text-bronze-400">
              <div className="explode">
                {footerText}
              </div>
            </div>
          </div>

          {/* Flames growing from bottom of screen */}
          <div className="fixed inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 5 }}>
            {flameProperties.map((flame, i) => (
              <div
                key={`flame-${i}`}
                className="absolute"
                style={{
                  left: `${flame.xPosition}%`,
                  bottom: `${flame.bottomOffset}px`,
                  height: `${flame.height}px`,
                  width: `${flame.width}px`,
                  animation: `flame-grow ${flame.animationDuration}s ease-in-out infinite`,
                  animationDelay: `${flame.delay}s`
                } as React.CSSProperties}
              >
                  <svg width="100%" height="100%" viewBox="0 0 30 100" className="drop-shadow-lg" preserveAspectRatio="none">
                    <defs>
                      <radialGradient id={`flameGradient${i}`} cx="50%" cy="90%" r="60%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="30%" stopColor="#fbbf24" />
                        <stop offset="70%" stopColor="#ea580c" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </radialGradient>
                    </defs>

                    {/* Flame shape - anchored at bottom, growing upward */}
                    <path
                      d="M 15 100 C 8 85, 6 65, 10 45 C 12 30, 14 15, 15 5 C 16 15, 18 30, 20 45 C 24 65, 22 85, 15 100 Z"
                      fill={`url(#flameGradient${i})`}
                      opacity="0.8"
                    />

                    {/* Inner flickering flame */}
                    <path
                      d="M 15 95 C 11 80, 10 60, 13 40 C 14 25, 15 12, 15 8 C 15 12, 16 25, 17 40 C 20 60, 19 80, 15 95 Z"
                      fill="#fbbf24"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer ref={footerRef} className={cn("mt-10 border-t border-bronze-600/40 bg-bronze-50/40 dark:border-bronze-700/20 dark:bg-bronze-900/20", className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-bronze-700/40 to-transparent" />

        {/* Main gauge area */}
        <div className="relative mx-auto max-w-4xl px-6 pt-6 pb-2">
          <div className="flex items-center justify-between gap-4">
            {/* Pressure Gauge */}
            <div
              className="relative cursor-pointer select-none"
              onMouseEnter={() => handleGaugeHover(pressureHoverRef, true)}
              onMouseLeave={() => handleGaugeHover(pressureHoverRef, false)}
              onClick={() => handleGaugeClick(pressureHoverRef)}
              title={!audioEnabled ? "Click to enable sound" : ""}
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

              {/* Footer text positioned under pipe */}
              <div className="absolute top-full mt-0 left-1/2 -translate-x-1/2 text-center text-sm text-bronze-800/80 dark:text-bronze-400 whitespace-nowrap">
                <p>{footerText}</p>
              </div>
            </div>

            {/* Temperature Gauge */}
            <div
              className="relative cursor-pointer select-none"
              onMouseEnter={() => handleGaugeHover(heatHoverRef, true)}
              onMouseLeave={() => handleGaugeHover(heatHoverRef, false)}
              onClick={() => handleGaugeClick(heatHoverRef)}
              title={!audioEnabled ? "Click to enable sound" : ""}
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
  // console.log(`${type}: value=${value}, percentage=${percentage.toFixed(1)}%, angle=${angle.toFixed(1)}°`);


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
        {/* Fixed height container to prevent layout shift */}
        <div className="mt-1 h-4 flex items-center justify-center">
          {isHigh && (
            <div className="text-xs text-red-600 dark:text-red-400 animate-pulse animate-shake">
              DANGER
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
