"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Brass Noise experiment panel (client-only)
 * WebAudio graph:
 *   Noise -> Biquad (lowpass tone) -> Resonators (peaking filters) -> Gain -> Destination
 */
export function BrassNoisePanel() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<ScriptProcessorNode | null>(null);
  const lowpassRef = useRef<BiquadFilterNode | null>(null);
  const peaksRef = useRef<BiquadFilterNode[] | null>(null);
  const [running, setRunning] = useState(false);

  // Controls
  const [color, setColor] = useState(2000);      // Hz cutoff
  const [damping, setDamping] = useState(0.2);   // master gain
  const [resMix, setResMix] = useState(3);       // dB gain on peaking filters

  // Frequencies for simple resonators (approx brass-like partials)
  const partials = useMemo(() => [220, 330, 440, 660, 880, 1320], []);

  useEffect(() => {
    if (!running || !ctxRef.current || !lowpassRef.current || !peaksRef.current || !masterRef.current) return;
    lowpassRef.current.frequency.value = color;
    masterRef.current.gain.value = damping;

    for (const p of peaksRef.current) {
      p.gain.value = resMix; // dB
    }
  }, [running, color, damping, resMix]);

  const start = async () => {
    if (running) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Noise source using ScriptProcessorNode for broad compatibility
    const bufferSize = 1024;
    const noise = ctx.createScriptProcessor(bufferSize, 1, 1);
    let last = 0;
    noise.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Brownian-ish noise (integrated white, lightly damped)
        const w = Math.random() * 2 - 1;
        last = Math.max(-1, Math.min(1, (last + 0.02 * w) * 0.98));
        out[i] = last;
      }
    };

    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = color;

    // Create a small bank of peaking filters
    const peaks = partials.map((f) => {
      const bi = ctx.createBiquadFilter();
      bi.type = "peaking";
      bi.frequency.value = f;
      bi.Q.value = 6;
      bi.gain.value = resMix;
      return bi;
    });

    const master = ctx.createGain();
    master.gain.value = damping;

    // Wire graph
    noise.connect(low);
    let node: AudioNode = low;
    for (const p of peaks) {
      node.connect(p);
      node = p;
    }
    node.connect(master).connect(ctx.destination);

    // Save refs
    noiseRef.current = noise;
    lowpassRef.current = low;
    peaksRef.current = peaks;
    masterRef.current = master;

    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    try {
      noiseRef.current?.disconnect();
      lowpassRef.current?.disconnect();
      peaksRef.current?.forEach((p) => p.disconnect());
      masterRef.current?.disconnect();
      ctxRef.current?.close();
    } catch {}
    noiseRef.current = null;
    ctxRef.current = null;
    lowpassRef.current = null;
    peaksRef.current = null;
    masterRef.current = null;
  };

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Simple noise-driven resonator. Use headphones and moderate volume.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Color (Hz)</label>
          <Input
            type="range"
            min={200}
            max={8000}
            value={color}
            onChange={(e) => setColor(Number(e.target.value))}
            className="mt-1"
          />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{color} Hz</div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Damping</label>
          <Input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            className="mt-1"
          />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{damping.toFixed(2)}</div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Res Mix (dB)</label>
          <Input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={resMix}
            onChange={(e) => setResMix(Number(e.target.value))}
            className="mt-1"
          />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{resMix.toFixed(1)} dB</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {!running ? (
          <Button onClick={start}>Start</Button>
        ) : (
          <Button onClick={stop} variant="outline">
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}

export default BrassNoisePanel;
