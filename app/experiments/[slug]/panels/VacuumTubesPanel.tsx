"use client";

import { useEffect, useRef, useState } from "react";

/**
 * VacuumTubesPanelV2
 * - Non-destructive copy of VacuumTubesPanel with expanded controls:
 *   Stage 1 + Stage 2 + Coupling, plus basic dual-trace time-domain scope and XY scope.
 * - Minimal dependencies; self-contained so you can swap it in easily.
 */

type Preset = "12AX7" | "6SN7" | "EF86";

type TubeParams = {
  // Stage 1
  vPlate: number;
  vBias: number;
  load: number;
  // Stage 2
  vPlate2: number;
  vBias2: number;
  load2: number;
  // Coupling
  coupling: number;
  // Signal
  freq: number;
  drive: number;
  glow: number;
  // Options
  preset: Preset;
  xyMode: boolean;
};

function triodeCurrent(vp: number, vg: number, vbias: number, preset: Preset) {
  // Very rough aesthetic shaping
  let k = 0.00035;
  let mu = 85;
  if (preset === "12AX7") { k = 0.00028; mu = 100; }
  if (preset === "6SN7")  { k = 0.00045; mu = 20; }
  if (preset === "EF86")  { k = 0.00033; mu = 80; }
  const eff = mu * (vg + vbias) + vp;
  const x = Math.max(0, eff);
  return k * Math.pow(x, 1.5);
}

export function VacuumTubesPanel() {
  const [running, setRunning] = useState(true);
  const [p, setP] = useState<TubeParams>({
    // Stage 1
    vPlate: 250,
    vBias: -1.5,
    load: 47,
    // Stage 2
    vPlate2: 250,
    vBias2: -1.0,
    load2: 56,
    // Coupling
    coupling: 0.5,
    // Signal
    freq: 220,
    drive: 2.5,
    glow: 0.8,
    // Options
    preset: "12AX7",
    xyMode: false,
  });

  // Oscilloscope buffers
  const scopeRef = useRef<{ t: number; ip1: number; vp1: number; ip2: number; vp2: number }[]>([]);
  const scopeTimeRef = useRef<HTMLCanvasElement | null>(null);
  const scopeXYRef = useRef<HTMLCanvasElement | null>(null);
  const tubeRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation loop (two-stage)
  useEffect(() => {
    let raf = 0;
    // let t0 = performance.now() / 1000;

    const tick = () => {
      const now = performance.now() / 1000;
      // const dt = now - t0;
      // t0 = now;

      if (running) {
        // Drive
        const vg1 = (p.drive / 2) * Math.sin(2 * Math.PI * p.freq * now);

        // Stage 1 solve
        const R1 = p.load * 1000;
        let vp1 = p.vPlate;
        let ip1 = 0;
        for (let i = 0; i < 5; i++) {
          ip1 = triodeCurrent(vp1, vg1, p.vBias, p.preset);
          vp1 = Math.max(0, p.vPlate - ip1 * R1);
        }

        // Coupling -> Stage 2
        const capK = Math.max(0, Math.min(1, p.coupling));
        const vg2 = capK * (vp1 - p.vPlate / 2);

        // Stage 2 solve
        const R2 = p.load2 * 1000;
        let vp2 = p.vPlate2;
        let ip2 = 0;
        for (let i = 0; i < 5; i++) {
          ip2 = triodeCurrent(vp2, vg2, p.vBias2, p.preset);
          vp2 = Math.max(0, p.vPlate2 - ip2 * R2);
        }

        scopeRef.current.push({ t: now, ip1, vp1, ip2, vp2 });
        const keep = now - 1.5;
        while (scopeRef.current.length && scopeRef.current[0].t < keep) {
          scopeRef.current.shift();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, p]);

  // Time-domain scope: Ip1(t), Ip2(t)
  useEffect(() => {
    const c = scopeTimeRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((c.clientWidth || 320) * dpr);
      const h = Math.floor((c.clientHeight || 220) * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }

      ctx.clearRect(0, 0, w, h);

      // frame
      ctx.fillStyle = "rgba(247, 241, 227, 1)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(110,79,42,0.6)";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(1 * dpr, 1 * dpr, w - 2 * dpr, h - 2 * dpr);

      const padL = 32 * dpr;
      const padT = 16 * dpr;
      const plotW = w - padL - 12 * dpr;
      const plotH = h - padT - 24 * dpr;

      // axes
      ctx.strokeStyle = "rgba(110,79,42,0.25)";
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + plotH);
      ctx.stroke();

      // Window and scales
      const data = scopeRef.current;
      const now = data.length ? data[data.length - 1].t : performance.now() / 1000;
      const tStart = now - 1.2;

      let maxIp1 = 0.001, maxIp2 = 0.001;
      for (const s of data) {
        if (s.t >= tStart) {
          maxIp1 = Math.max(maxIp1, s.ip1);
          maxIp2 = Math.max(maxIp2, s.ip2);
        }
      }

      const xt = (t: number) => padL + ((t - tStart) / 1.2) * plotW;
      const yt = (ip: number, ymax: number) => padT + (1 - ip / ymax) * plotH;

      // Trace Ip1
      ctx.save();
      ctx.strokeStyle = "rgba(176,127,69,0.95)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      let drew = false;
      for (const s of data) {
        if (s.t < tStart) continue;
        const x = xt(s.t);
        const y = yt(s.ip1, maxIp1);
        if (!drew) { ctx.moveTo(x, y); drew = true; } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();
      ctx.restore();

      // Trace Ip2
      ctx.save();
      ctx.strokeStyle = "rgba(110,79,42,0.9)";
      ctx.lineWidth = 1.8 * dpr;
      ctx.beginPath();
      drew = false;
      for (const s of data) {
        if (s.t < tStart) continue;
        const x = xt(s.t);
        const y = yt(s.ip2, maxIp2);
        if (!drew) { ctx.moveTo(x, y); drew = true; } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();
      ctx.restore();

      // Labels
      ctx.fillStyle = "rgba(58,42,23,0.95)";
      ctx.font = `${12 * dpr}px ui-sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText("Plate current Ip1 / Ip2 (A)", padL - 8 * dpr, padT + 4 * dpr);
      ctx.textAlign = "left";
      ctx.fillText("~1.2 s", padL + 6 * dpr, padT + plotH + 6 * dpr);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  // XY scope (Ip1 vs Vp1)
  useEffect(() => {
    const c = scopeXYRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((c.clientWidth || 320) * dpr);
      const h = Math.floor((c.clientHeight || 200) * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }

      ctx.clearRect(0, 0, w, h);

      // frame
      ctx.fillStyle = "rgba(247, 241, 227, 1)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(110,79,42,0.6)";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(1 * dpr, 1 * dpr, w - 2 * dpr, h - 2 * dpr);

      const pad = 16 * dpr;
      const plotW = w - pad * 2;
      const plotH = h - pad * 2;

      // axes
      ctx.strokeStyle = "rgba(110,79,42,0.25)";
      ctx.beginPath();
      ctx.moveTo(pad, pad + plotH);
      ctx.lineTo(pad + plotW, pad + plotH);
      ctx.moveTo(pad, pad);
      ctx.lineTo(pad, pad + plotH);
      ctx.stroke();

      const data = scopeRef.current.slice(-600);
      let maxIp = 0.001, maxVp = 1;
      for (const s of data) { maxIp = Math.max(maxIp, s.ip1); maxVp = Math.max(maxVp, s.vp1); }

      const x = (vp: number) => pad + (vp / maxVp) * plotW;
      const y = (ip: number) => pad + (1 - ip / maxIp) * plotH;

      ctx.strokeStyle = "rgba(176,127,69,0.95)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      let drew = false;
      for (const s of data) {
        const px = x(s.vp1);
        const py = y(s.ip1);
        if (!drew) { ctx.moveTo(px, py); drew = true; } else { ctx.lineTo(px, py); }
      }
      ctx.stroke();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Tube rendering (same as v1, adjusted labels)
  useEffect(() => {
    const c = tubeRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((c.clientWidth || 320) * dpr);
      const h = Math.floor((c.clientHeight || 260) * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }

      ctx.clearRect(0, 0, w, h);

      // Glass bulb
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = "rgba(110,79,42,0.6)";
      ctx.lineWidth = 2 * dpr;
      const cx = w * 0.5, cy = h * 0.58;
      const rx = w * 0.22, ry = h * 0.42;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Filament glow
      const t = performance.now() / 1000;
      const flicker = (Math.sin(t * 18) * 0.5 + 0.5) * 0.12 + (Math.random() * 0.03);
      const intensity = Math.min(1, Math.max(0, p.glow + flicker));
      const grd = ctx.createRadialGradient(cx, cy + ry * 0.2, 1, cx, cy + ry * 0.2, ry * 0.9);
      grd.addColorStop(0, `rgba(255, 180, 80, ${0.25 * intensity})`);
      grd.addColorStop(1, `rgba(176, 127, 69, ${0.05 * intensity})`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [p.glow]);

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Two-stage triode visualization with coupling. Adjust parameters, view Ip1/Ip2 in time-domain,
        and inspect XY (Ip1 vs Vp1).
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {/* Stage 1 */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Plate Voltage (Stage 1, V)</label>
          <input type="range" min={100} max={350} step={5} className="mt-1 w-full"
            value={p.vPlate}
            onChange={(e)=>setP(v=>({...v, vPlate: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.vPlate.toFixed(0)} V</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Grid Bias (Stage 1, V)</label>
          <input type="range" min={-5} max={0} step={0.1} className="mt-1 w-full"
            value={p.vBias}
            onChange={(e)=>setP(v=>({...v, vBias: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.vBias.toFixed(1)} V</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Load (Stage 1, kΩ)</label>
          <input type="range" min={10} max={100} step={1} className="mt-1 w-full"
            value={p.load}
            onChange={(e)=>setP(v=>({...v, load: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.load.toFixed(0)} kΩ</div>
        </div>

        {/* Stage 2 */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Plate Voltage (Stage 2, V)</label>
          <input type="range" min={100} max={350} step={5} className="mt-1 w-full"
            value={p.vPlate2}
            onChange={(e)=>setP(v=>({...v, vPlate2: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.vPlate2.toFixed(0)} V</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Grid Bias (Stage 2, V)</label>
          <input type="range" min={-5} max={0} step={0.1} className="mt-1 w-full"
            value={p.vBias2}
            onChange={(e)=>setP(v=>({...v, vBias2: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.vBias2.toFixed(1)} V</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Load (Stage 2, kΩ)</label>
          <input type="range" min={10} max={100} step={1} className="mt-1 w-full"
            value={p.load2}
            onChange={(e)=>setP(v=>({...v, load2: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.load2.toFixed(0)} kΩ</div>
        </div>

        {/* Coupling & Signal */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Coupling</label>
          <input type="range" min={0} max={1} step={0.01} className="mt-1 w-full"
            value={p.coupling}
            onChange={(e)=>setP(v=>({...v, coupling: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">× {p.coupling.toFixed(2)}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Frequency (Hz)</label>
          <input type="range" min={20} max={1000} step={1} className="mt-1 w-full"
            value={p.freq}
            onChange={(e)=>setP(v=>({...v, freq: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.freq.toFixed(0)} Hz</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Drive (Vpp)</label>
          <input type="range" min={0} max={10} step={0.1} className="mt-1 w-full"
            value={p.drive}
            onChange={(e)=>setP(v=>({...v, drive: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{p.drive.toFixed(1)} Vpp</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Glow</label>
          <input type="range" min={0} max={1} step={0.01} className="mt-1 w-full"
            value={p.glow}
            onChange={(e)=>setP(v=>({...v, glow: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">× {p.glow.toFixed(2)}</div>
        </div>

        {/* Preset */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Preset</label>
          <select
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2"
            value={p.preset}
            onChange={(e)=>setP(v=>({...v, preset: e.target.value as Preset}))}
          >
            <option value="12AX7">12AX7</option>
            <option value="6SN7">6SN7</option>
            <option value="EF86">EF86</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <button className="btn" onClick={()=>setRunning(true)}>Play</button>
          <button className="btn" onClick={()=>setRunning(false)}>Pause</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)] lg:col-span-1">
          <canvas ref={tubeRef} className="h-[260px] w-full" />
        </div>

        <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)] lg:col-span-1">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs text-[var(--muted-foreground)]">Scope: Ip1(t) & Ip2(t)</div>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input type="checkbox" checked={p.xyMode} onChange={(e)=>setP(v=>({...v, xyMode: e.target.checked}))} />
              XY Mode
            </label>
          </div>
          <canvas ref={scopeTimeRef} className="h-[200px] w-full" />
        </div>

        <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)] lg:col-span-1">
          <div className="px-3 py-2 text-xs text-[var(--muted-foreground)]">Scope: Ip1 vs Vp1 (XY)</div>
          <canvas ref={scopeXYRef} className={`h-[200px] w-full transition-opacity ${p.xyMode ? "opacity-100" : "opacity-40"}`} />
        </div>
      </div>
    </div>
  );
}

export default VacuumTubesPanel;
