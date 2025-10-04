"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Aether Synth
 * - Granular texture generator with bronze-themed mixer
 * - Multiple sound textures for each pad
 * - Step sequencer for pattern creation
 * - Enhanced with filters and effects
 */

type GrainEngine = {
  buffer: AudioBuffer | null;
  gain: GainNode | null;
  filter: BiquadFilterNode | null;
  isPlaying: boolean;
  stopHandle?: () => void;
};

type Pad = {
  name: string;
  color: string;
  textureType: 'steam' | 'metal' | 'crystal' | 'organic';
};

type SequencerStep = {
  padIndex: number | null;
  velocity: number;
};

const DEFAULT_PADS: Pad[] = [
  { name: "Steam", color: "#b07f45", textureType: 'steam' },
  { name: "Brass", color: "#8e6535", textureType: 'metal' },
  { name: "Crystal", color: "#6e4f2a", textureType: 'crystal' },
  { name: "Vapor", color: "#523b20", textureType: 'organic' },
];

export function AetherSynthPanel() {
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const [master, setMaster] = useState<AudioNode | null>(null);
  const [isOn, setIsOn] = useState(false);

  // Granular parameters
  const [rate, setRate] = useState(1.0);
  const [density, setDensity] = useState(24);
  const [spread, setSpread] = useState(0.3);
  const [grainDur, setGrainDur] = useState(0.15);
  const [panWidth, setPanWidth] = useState(0.7);
  const [filterFreq, setFilterFreq] = useState(800);
  const [filterRes, setFilterRes] = useState(2);

  // Sequencer
  const [isSequencing, setIsSequencing] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [sequence, setSequence] = useState<SequencerStep[]>(
    Array(16).fill(null).map(() => ({ padIndex: null, velocity: 0.8 }))
  );

  const [pads] = useState<Pad[]>(DEFAULT_PADS);
  const [selectedPad, setSelectedPad] = useState(0);
  const [padStates, setPadStates] = useState<boolean[]>(pads.map(() => false));

  const engines = useRef<GrainEngine[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const scopeRef = useRef<HTMLCanvasElement | null>(null);
  const sequencerIntervalRef = useRef<number | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);

  // Lazy init audio
  useEffect(() => {
    if (!isOn) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const _ctx: AudioContext = new AC();
    
    // Create effects chain
    const compressor = _ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 10;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.1;
    
    const convolver = _ctx.createConvolver();
    const wetGain = _ctx.createGain();
    const dryGain = _ctx.createGain();
    wetGain.gain.value = 0.15;
    dryGain.gain.value = 0.85;
    
    const gain = _ctx.createGain();
    gain.gain.value = 0.7;
    
    // Connect effects
    compressor.connect(dryGain);
    compressor.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(gain);
    wetGain.connect(gain);
    gain.connect(_ctx.destination);

    const analyser = _ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;
    gain.connect(analyser);
    
    // Create impulse response for convolver
    const impulseLength = _ctx.sampleRate * 0.8;
    const impulse = _ctx.createBuffer(2, impulseLength, _ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const channelData = impulse.getChannelData(ch);
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
      }
    }
    convolver.buffer = impulse;

    analyserRef.current = analyser;
    compressorRef.current = compressor;
    convolverRef.current = convolver;
    
    setCtx(_ctx);
    setMaster(compressor);

    // create engines (one per pad)
    engines.current = pads.map(() => ({ 
      buffer: null, 
      gain: null, 
      filter: null,
      isPlaying: false 
    }));

    return () => {
      try { _ctx.close(); } catch {}
      setCtx(null);
      setMaster(null);
      engines.current = [];
      analyserRef.current = null;
      compressorRef.current = null;
      convolverRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  // Sequencer
  useEffect(() => {
    if (!isSequencing || !ctx) {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
        sequencerIntervalRef.current = null;
      }
      return;
    }

    const stepTime = (60 / bpm) * 1000 / 4; // 16th notes
    
    sequencerIntervalRef.current = window.setInterval(() => {
      const step = sequence[currentStep];
      if (step.padIndex !== null) {
        triggerPad(step.padIndex, step.velocity);
      }
      setCurrentStep((prev) => (prev + 1) % sequence.length);
    }, stepTime);

    return () => {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
      }
    };
  }, [isSequencing, bpm, currentStep, sequence, ctx]);

  // Enhanced waveform/scope with frequency bars
  useEffect(() => {
    const c = scopeRef.current;
    const analyser = analyserRef.current;
    if (!c || !analyser) return;
    const ctx2d = c.getContext("2d");
    if (!ctx2d) return;

    let raf = 0;
    const timeData = new Uint8Array(analyser.frequencyBinCount);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((c.clientWidth || 360) * dpr);
      const h = Math.floor((c.clientHeight || 120) * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }

      // Background with gradient
      const grad = ctx2d.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(247,241,227,1)");
      grad.addColorStop(1, "rgba(245,236,215,1)");
      ctx2d.fillStyle = grad;
      ctx2d.fillRect(0, 0, w, h);
      
      // Frame
      ctx2d.strokeStyle = "rgba(110,79,42,0.6)";
      ctx2d.lineWidth = 2 * dpr;
      ctx2d.strokeRect(1 * dpr, 1 * dpr, w - 2 * dpr, h - 2 * dpr);

      // Frequency bars
      analyser.getByteFrequencyData(freqData);
      const barCount = 32;
      const barWidth = (w - 4 * dpr) / barCount;
      ctx2d.fillStyle = "rgba(176,127,69,0.3)";
      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor(i * freqData.length / barCount / 4); // Focus on lower frequencies
        const barHeight = (freqData[freqIndex] / 255) * h * 0.7;
        ctx2d.fillRect(
          2 * dpr + i * barWidth, 
          h - barHeight - 2 * dpr, 
          barWidth - 1 * dpr, 
          barHeight
        );
      }

      // Waveform overlay
      analyser.getByteTimeDomainData(timeData);
      ctx2d.strokeStyle = "rgba(176,127,69,0.95)";
      ctx2d.lineWidth = 1.5 * dpr;
      ctx2d.beginPath();
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        const x = (i / (timeData.length - 1)) * (w - 4 * dpr) + 2 * dpr;
        const y = h * 0.5 + v * (h * 0.35);
        if (i === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [analyserRef.current]);

  // Enhanced texture synthesis based on type
  const makeTexture = useMemo(() => {
    return (context: AudioContext, type: string, seconds = 3.0) => {
      const rate = context.sampleRate;
      const length = Math.floor(seconds * rate);
      const buf = context.createBuffer(2, length, rate);
      
      for (let ch = 0; ch < 2; ch++) {
        const channelData = buf.getChannelData(ch);
        
        switch (type) {
          case 'steam': {
            // Hissing steam with resonances
            let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
            for (let i = 0; i < length; i++) {
              const white = Math.random() * 2 - 1;
              // Pink noise base
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              let pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              
              // Add steam-like modulation
              const t = i / rate;
              const mod = Math.sin(t * 3.7) * 0.3 + Math.sin(t * 11.3) * 0.2;
              channelData[i] = pink * 0.15 * (1 + mod);
            }
            break;
          }
          
          case 'metal': {
            // Metallic resonances with harmonic content
            for (let i = 0; i < length; i++) {
              let sample = 0;
              const t = i / rate;
              
              // Multiple metallic partials
              const freqs = [523.25, 784.88, 1046.5, 1308.13, 1661.22]; // C5 harmonics
              for (let f = 0; f < freqs.length; f++) {
                const decay = Math.exp(-t * (0.5 + f * 0.3));
                const vibrato = 1 + Math.sin(t * 5.5) * 0.002;
                sample += Math.sin(2 * Math.PI * freqs[f] * vibrato * t) * decay / (f + 1);
              }
              
              // Add noise burst at start
              if (t < 0.01) {
                sample += (Math.random() * 2 - 1) * 0.5 * (1 - t / 0.01);
              }
              
              channelData[i] = sample * 0.2;
            }
            break;
          }
          
          case 'crystal': {
            // Glassy, bell-like tones
            for (let i = 0; i < length; i++) {
              let sample = 0;
              const t = i / rate;
              
              // Inharmonic partials for glass-like sound
              const partials = [1, 2.32, 3.63, 4.91, 6.23];
              const baseFreq = 880 * (0.8 + ch * 0.2); // Slight detuning between channels
              
              for (let p = 0; p < partials.length; p++) {
                const freq = baseFreq * partials[p];
                const decay = Math.exp(-t * (0.3 + p * 0.2));
                sample += Math.sin(2 * Math.PI * freq * t) * decay / (p + 1.5);
              }
              
              // FM modulation for shimmer
              const modFreq = 6.7;
              const modIndex = 0.3 * Math.exp(-t * 0.5);
              sample *= 1 + Math.sin(2 * Math.PI * modFreq * t) * modIndex;
              
              channelData[i] = sample * 0.15;
            }
            break;
          }
          
          case 'organic': {
            // Natural, evolving textures
            let phase = 0;
            let b0=0, b1=0;
            
            for (let i = 0; i < length; i++) {
              const t = i / rate;
              
              // Brownian motion
              const white = Math.random() * 2 - 1;
              b0 = 0.998 * b0 + white * 0.02;
              b1 = 0.99 * b1 + b0 * 0.05;
              
              // Organic modulation
              const env = Math.sin(t * 0.7) * 0.5 + 0.5;
              const lfo = Math.sin(t * 2.3 + Math.sin(t * 0.17) * 3);
              
              // Formant-like filtering simulation
              phase += (220 + lfo * 30) / rate;
              const carrier = Math.sin(2 * Math.PI * phase);
              
              channelData[i] = (b1 * 0.3 + carrier * 0.7) * env * 0.2;
            }
            break;
          }
        }
      }
      
      return buf;
    };
  }, []);

  async function ensurePadBuffer(index: number) {
    if (!ctx || !master) return null;
    const eng = engines.current[index];
    if (eng.buffer) return eng.buffer;

    const pad = pads[index];
    const buffer = makeTexture(ctx, pad.textureType, 3.0);
    eng.buffer = buffer;
    return buffer;
  }

  function startGrains(index: number, velocity: number = 1.0) {
    if (!ctx || !master) return;
    const eng = engines.current[index];
    
    // Create audio nodes if needed
    if (!eng.gain) {
      eng.gain = ctx.createGain();
      eng.filter = ctx.createBiquadFilter();
      eng.filter.type = 'bandpass';
      eng.filter.frequency.value = filterFreq;
      eng.filter.Q.value = filterRes;
      eng.filter.connect(eng.gain);
      eng.gain.connect(master);
    }
    
    // Update filter
    if (eng.filter) {
      eng.filter.frequency.exponentialRampToValueAtTime(filterFreq, ctx.currentTime + 0.1);
      eng.filter.Q.exponentialRampToValueAtTime(filterRes, ctx.currentTime + 0.1);
    }
    
    // Set gain based on selection and velocity
    eng.gain.gain.value = (index === selectedPad ? 0.9 : 0.6) * velocity;
    eng.isPlaying = true;

    let running = true;
    
    const schedule = () => {
      if (!running || !ctx) return;
      const now = ctx.currentTime;

      // Schedule grains
      const grainInterval = 1 / density;
      const grainsToSchedule = Math.ceil(0.1 / grainInterval);
      
      for (let i = 0; i < grainsToSchedule; i++) {
        const when = now + i * grainInterval;
        // Add spread as timing jitter
        const jitter = (Math.random() - 0.5) * spread * grainInterval;
        playGrain(index, when + jitter, velocity);
      }
      
      setTimeout(schedule, 80);
    };
    
    schedule();

    // Return stop function
    return () => { 
      running = false;
      eng.isPlaying = false;
      if (eng.gain) {
        eng.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      }
    };
  }

  function playGrain(index: number, when: number, velocity: number) {
    if (!ctx || !master) return;
    const eng = engines.current[index];
    if (!eng.buffer || !eng.filter) return;

    const src = ctx.createBufferSource();
    src.buffer = eng.buffer;
    
    // Playback rate with more variation based on spread
    const rateVar = 1 + (Math.random() - 0.5) * spread * 0.5;
    src.playbackRate.value = rate * rateVar;

    // Start position with spread
    const maxStart = Math.max(0.001, eng.buffer.duration - grainDur);
    const startOffset = Math.random() * maxStart;
    
    // Grain duration with variation
    const dur = grainDur * (0.8 + Math.random() * 0.4);
    
    // Panning
    const pan = ctx.createStereoPanner();
    pan.pan.value = (Math.random() * 2 - 1) * panWidth;

    // Grain envelope
    const g = ctx.createGain();
    g.gain.value = 0.0;
    
    // Connect: source -> pan -> envelope -> filter
    src.connect(pan);
    pan.connect(g);
    g.connect(eng.filter);

    // ADSR envelope
    const attack = 0.005 + Math.random() * 0.01;
    const decay = 0.01;
    const sustain = 0.7;
    const release = 0.03 + Math.random() * 0.02;
    
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(velocity, when + attack);
    g.gain.linearRampToValueAtTime(sustain * velocity, when + attack + decay);
    g.gain.setValueAtTime(sustain * velocity, when + dur - release);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);

    src.start(when, startOffset, dur + 0.05);
    src.stop(when + dur + 0.05);
  }

  // Pad launching
  async function triggerPad(i: number, velocity: number = 1.0) {
    if (!isOn) return;
    await ensurePadBuffer(i);
    
    // Stop previous grains on this pad
    if (engines.current[i].stopHandle) {
      engines.current[i].stopHandle();
    }
    
    const stop = startGrains(i, velocity);
    engines.current[i].stopHandle = stop;
    
    setSelectedPad(i);
    setPadStates(prev => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
    
    // Visual feedback
    setTimeout(() => {
      setPadStates(prev => {
        const next = [...prev];
        next[i] = false;
        return next;
      });
    }, 100);
  }

  function stopAll() {
    engines.current.forEach((eng) => {
      if (eng.stopHandle) {
        eng.stopHandle();
        eng.stopHandle = undefined;
      }
    });
    setPadStates(pads.map(() => false));
  }

  function toggleSequencerStep(stepIndex: number) {
    setSequence(prev => {
      const next = [...prev];
      if (next[stepIndex].padIndex === selectedPad) {
        next[stepIndex].padIndex = null;
      } else {
        next[stepIndex].padIndex = selectedPad;
      }
      return next;
    });
  }

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mt-2 text-sm text-bronze-800/90">
        Granular texture generator with bronze-themed mixer. Tap pads to trigger textures, adjust synthesis parameters, and create patterns with the step sequencer.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Pad Grid & Power */}
        <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <button
              className={`btn ${isOn ? 'bg-bronze-600/20' : ''}`}
              onClick={() => setIsOn((v) => !v)}
            >
              {isOn ? "⚡ Power On" : "○ Power Off"}
            </button>
            <button 
              className="btn" 
              onClick={stopAll}
              disabled={!isOn}
            >
              ■ Stop All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pads.map((pdef, i) => (
              <button
                key={i}
                className={`
                  h-20 rounded-lg border-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.12)] 
                  transition-all transform active:scale-95
                  ${selectedPad === i ? 'ring-2 ring-bronze-600/60 border-bronze-600/60' : 'border-bronze-700/40'}
                  ${padStates[i] ? 'brightness-125' : ''}
                  ${engines.current[i]?.isPlaying ? 'animate-pulse' : ''}
                `}
                style={{ 
                  background: `linear-gradient(135deg, ${pdef.color}44, ${pdef.color}66)`,
                  boxShadow: padStates[i] ? `0 0 20px ${pdef.color}88` : undefined
                }}
                onClick={() => triggerPad(i)}
                disabled={!isOn}
              >
                <span className="font-medium text-bronze-900 drop-shadow-sm">
                  {pdef.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Synthesis Controls */}
        <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
          <h3 className="text-sm font-medium text-bronze-800 mb-3">Synthesis</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-bronze-700">Rate</label>
              <input 
                type="range" 
                min={0.25} 
                max={4} 
                step={0.01} 
                className="mt-1 w-full accent-bronze-600"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{rate.toFixed(2)}×</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bronze-700">Density</label>
              <input 
                type="range" 
                min={2} 
                max={60} 
                step={1} 
                className="mt-1 w-full accent-bronze-600"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{density} gr/s</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bronze-700">Grain Size</label>
              <input 
                type="range" 
                min={0.01} 
                max={0.5} 
                step={0.01} 
                className="mt-1 w-full accent-bronze-600"
                value={grainDur}
                onChange={(e) => setGrainDur(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{(grainDur * 1000).toFixed(0)} ms</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bronze-700">Spread</label>
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.01} 
                className="mt-1 w-full accent-bronze-600"
                value={spread}
                onChange={(e) => setSpread(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{(spread * 100).toFixed(0)}%</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bronze-700">Filter Freq</label>
              <input 
                type="range" 
                min={100} 
                max={4000} 
                step={10} 
                className="mt-1 w-full accent-bronze-600"
                value={filterFreq}
                onChange={(e) => setFilterFreq(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{filterFreq} Hz</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-bronze-700">Pan Width</label>
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.01} 
                className="mt-1 w-full accent-bronze-600"
                value={panWidth}
                onChange={(e) => setPanWidth(Number(e.target.value))} 
                disabled={!isOn}
              />
              <div className="mt-1 text-xs text-bronze-600">{(panWidth * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Output & Visualizer */}
        <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-bronze-700">Output Scope</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    engines.current[i]?.isPlaying 
                      ? 'bg-bronze-600' 
                      : 'bg-bronze-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <canvas 
            ref={scopeRef} 
            className="h-[120px] w-full rounded border border-bronze-700/20" 
          />
        </div>
      </div>

      {/* Step Sequencer */}
      <div className="mt-4 rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-bronze-800">Step Sequencer</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-bronze-700">BPM</label>
              <input
                type="number"
                min={60}
                max={180}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs rounded border border-bronze-700/30 bg-bronze-50/50"
                disabled={!isOn}
              />
            </div>
            <button
              className={`btn text-sm ${isSequencing ? 'bg-bronze-600/20' : ''}`}
              onClick={() => setIsSequencing(!isSequencing)}
              disabled={!isOn}
            >
              {isSequencing ? '▶ Playing' : '■ Stopped'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-16 gap-1">
          {sequence.map((step, i) => (
            <button
              key={i}
              className={`
                h-12 rounded border-2 transition-all
                ${currentStep === i && isSequencing ? 'ring-2 ring-bronze-500 scale-105' : ''}
                ${step.padIndex !== null ? pads[step.padIndex].color : ''}
              `}
              style={{
                borderColor: step.padIndex !== null ? pads[step.padIndex].color : 'rgba(110,79,42,0.3)',
                background: step.padIndex !== null 
                  ? `linear-gradient(135deg, ${pads[step.padIndex].color}33, ${pads[step.padIndex].color}55)`
                  : 'rgba(247,241,227,0.5)'
              }}
              onClick={() => toggleSequencerStep(i)}
              disabled={!isOn}
            >
              <span className="text-xs font-medium text-bronze-800">
                {i % 4 === 0 ? i/4 + 1 : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AetherSynthPanel;