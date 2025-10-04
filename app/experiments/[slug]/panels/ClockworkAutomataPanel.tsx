"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Clockwork Automata
 * - L-systems + simple state machines driving mechanical diagram rendering
 * - Export: SVG (vector) and animated GIF (basic, client-only)
 *
 * This panel focuses on:
 * 1) Authoring an L-system (axiom + production rules)
 * 2) Tuning angle/step/iterations
 * 3) Mapping the L-system turtle path to mechanical motifs (gears, rods)
 * 4) Export to SVG; optional client-side animated GIF from frames
 */

type RuleMap = Record<string, string>;

type LSystemDef = {
  axiom: string;
  rules: RuleMap;
  iterations: number;
  angleDeg: number;
  step: number;
};

type Mode = "path" | "gears";

export function ClockworkAutomataPanel() {
  const [mode, setMode] = useState<Mode>("gears");
  const [lsys, setLsys] = useState<LSystemDef>({
    axiom: "F+F+F+F",
    rules: {
      "F": "F+F−F−F+F" // classic "island" style
    },
    iterations: 2,
    angleDeg: 90,
    step: 16,
  });

  const [seed, setSeed] = useState(1); // small deterministic variability option
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const expanded = useMemo(() => {
    let str = lsys.axiom;
    for (let i = 0; i < lsys.iterations; i++) {
      let next = "";
      for (const ch of str) {
        next += lsys.rules[ch] ?? ch;
      }
      str = next;
    }
    return str;
  }, [lsys]);

  // Simple PRNG for deterministic tiny jitter if desired
  const rand = useMemo(() => {
    let x = Math.imul(48271, seed) % 0x7fffffff;
    return () => ((x = Math.imul(x, 48271) % 0x7fffffff) / 0x7fffffff);
  }, [seed]);

  // Render mechanical diagram from L-system (turtle)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.floor((c.clientWidth || 640) * dpr);
    const h = Math.floor((c.clientHeight || 420) * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w; c.height = h;
    }

    // Clear background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(247,241,227,1)";
    ctx.fillRect(0, 0, w, h);

    // Frame
    ctx.strokeStyle = "rgba(110,79,42,0.6)";
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(1 * dpr, 1 * dpr, w - 2 * dpr, h - 2 * dpr);

    // Turtle setup
    const angle = (lsys.angleDeg * Math.PI) / 180;
    let dir = -Math.PI / 2; // start upward
    let x = w * 0.5, y = h * 0.6;
    const stack: Array<[number, number, number]> = [];

    // Precompute path segments for both modes
    const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    for (const ch of expanded) {
      if (ch === "F") {
        const nx = x + Math.cos(dir) * lsys.step * dpr;
        const ny = y + Math.sin(dir) * lsys.step * dpr;
        segments.push({ x1: x, y1: y, x2: nx, y2: ny });
        x = nx; y = ny;
      } else if (ch === "+") {
        dir += angle;
      } else if (ch === "−" || ch === "-") {
        dir -= angle;
      } else if (ch === "[") {
        stack.push([x, y, dir]);
      } else if (ch === "]") {
        const st = stack.pop();
        if (st) { x = st[0]; y = st[1]; dir = st[2]; }
      }
    }

    if (mode === "path") {
      // Draw just the turtle path
      ctx.strokeStyle = "rgba(176,127,69,0.95)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (i === 0) ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
      }
      ctx.stroke();
    } else {
      // Mechanical interpretation: draw rods and gears at segment joints
      // 1) rods
      ctx.strokeStyle = "rgba(110,79,42,0.9)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (const s of segments) {
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
      }
      ctx.stroke();

      // 2) nodes/gears
      // Drop a small gear at every Nth vertex
      const N = Math.max(3, Math.floor(10 + rand() * 10));
      let vx = w * 0.5, vy = h * 0.6, vdir = -Math.PI / 2;
      const nodes: Array<{ x: number; y: number; r: number; teeth: number; rot: number }> = [];
      let stepIdx = 0;
      for (const ch of expanded) {
        if (ch === "F") {
          const nx = vx + Math.cos(vdir) * lsys.step * dpr;
          const ny = vy + Math.sin(vdir) * lsys.step * dpr;
          if (stepIdx % N === 0) {
            const teeth = 8 + Math.floor(rand() * 8);
            const r = Math.max(6 * dpr, Math.min(18 * dpr, (lsys.step * dpr * 0.7)));
            const rot = (stepIdx * angle) % (Math.PI * 2);
            nodes.push({ x: vx, y: vy, r, teeth, rot });
          }
          vx = nx; vy = ny; stepIdx++;
        } else if (ch === "+") {
          vdir += angle;
        } else if (ch === "−" || ch === "-") {
          vdir -= angle;
        } else if (ch === "[") {
          stack.push([vx, vy, vdir]);
        } else if (ch === "]") {
          const st = stack.pop();
          if (st) { vx = st[0]; vy = st[1]; vdir = st[2]; }
        }
      }

      // draw gears
      for (const g of nodes) {
        drawGear(ctx, g.x, g.y, g.r, g.teeth, g.rot, dpr);
      }
    }
  }, [expanded, lsys.angleDeg, lsys.step, mode, seed]);

  function drawGear(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, r: number,
    teeth: number, rot: number, dpr: number
  ) {
    const toothDepth = Math.max(2 * dpr, r * 0.18);
    const inner = r - toothDepth;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = "rgba(203,161,106,0.45)"; // brass tone
    ctx.strokeStyle = "rgba(110,79,42,0.9)";
    ctx.lineWidth = 1.5 * dpr;

    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a2 = ((i + 1) / teeth) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
      ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
      ctx.lineTo(Math.cos(a2) * inner, Math.sin(a2) * inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // hub
    ctx.beginPath();
    ctx.arc(0, 0, inner * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(176,127,69,0.8)";
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Export SVG of the current expanded path (turtle lines only)
  function exportSVG() {
    // Rebuild simple path at device-independent units
    const angle = (lsys.angleDeg * Math.PI) / 180;
    let dir = -Math.PI / 2;
    let x = 320, y = 260;
    const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (const ch of expanded) {
      if (ch === "F") {
        const nx = x + Math.cos(dir) * lsys.step;
        const ny = y + Math.sin(dir) * lsys.step;
        segs.push({ x1: x, y1: y, x2: nx, y2: ny });
        x = nx; y = ny;
      } else if (ch === "+") dir += angle;
      else if (ch === "−" || ch === "-") dir -= angle;
      else if (ch === "[") stackPush();
      else if (ch === "]") stackPop();
    }
    // simple stack for SVG build
    const sstack: Array<[number, number, number]> = [];
    function stackPush() { sstack.push([x, y, dir]); }
    function stackPop() { const st = sstack.pop(); if (st) { x = st[0]; y = st[1]; dir = st[2]; } }

    const minX = Math.min(...segs.flatMap(s => [s.x1, s.x2]));
    const maxX = Math.max(...segs.flatMap(s => [s.x1, s.x2]));
    const minY = Math.min(...segs.flatMap(s => [s.y1, s.y2]));
    const maxY = Math.max(...segs.flatMap(s => [s.y1, s.y2]));
    const width = Math.max(1, Math.ceil(maxX - minX + 40));
    const height = Math.max(1, Math.ceil(maxY - minY + 40));
    const ox = -minX + 20, oy = -minY + 20;

    const path = segs.map(s => `M ${s.x1 + ox},${s.y1 + oy} L ${s.x2 + ox},${s.y2 + oy}`).join(" ");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f7f1e3"/>
  <path d="${path}" stroke="rgba(110,79,42,0.9)" stroke-width="2" fill="none"/>
</svg>`;

    downloadText("clockwork-automata.svg", svg);
  }

  // Very basic GIF export: renders a few frames and encodes with a tiny GIF encoder
  // To keep dependencies zero, we export a frame-strip PNG instead (simple and shareable)
  async function exportFrameStrip() {
    const c = canvasRef.current;
    if (!c) return;
    const frames = 12;
    const strip = document.createElement("canvas");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.floor((c.clientWidth || 640) * dpr);
    const h = Math.floor((c.clientHeight || 420) * dpr);
    strip.width = w * frames;
    strip.height = h;
    const sctx = strip.getContext("2d");
    if (!sctx) return;

    for (let i = 0; i < frames; i++) {
      // Slight seed change to rotate gear phases
      setSeed(i + 1);
      await new Promise(r => setTimeout(r, 30));
      sctx.drawImage(c, i * w, 0);
    }
    const url = strip.toDataURL("image/png");
    downloadURL("clockwork-automata-strip.png", url);
  }

  function downloadText(name: string, text: string) {
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    downloadURL(name, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadURL(name: string, url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mt-2 text-sm text-bronze-800/90">
        L-systems drive mechanical diagrams. Tune rules, angle, and step; render as rods/gears; export SVG or a frame strip.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Axiom</label>
          <input className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2"
            value={lsys.axiom}
            onChange={(e)=>setLsys(v=>({...v, axiom: e.target.value}))} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Rules (JSON)</label>
          <textarea className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2 h-[96px]"
            value={JSON.stringify(lsys.rules, null, 0)}
            onChange={(e)=>{
              try {
                const parsed = JSON.parse(e.target.value) as RuleMap;
                setLsys(v=>({...v, rules: parsed}));
              } catch {}
            }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)]">Iterations</label>
            <input type="range" min={0} max={5} step={1} className="mt-1 w-full"
              value={lsys.iterations}
              onChange={(e)=>setLsys(v=>({...v, iterations: Number(e.target.value)}))} />
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">{lsys.iterations}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)]">Angle (deg)</label>
            <input type="range" min={10} max={180} step={1} className="mt-1 w-full"
              value={lsys.angleDeg}
              onChange={(e)=>setLsys(v=>({...v, angleDeg: Number(e.target.value)}))} />
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">{lsys.angleDeg}°</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)]">Step</label>
            <input type="range" min={4} max={40} step={1} className="mt-1 w-full"
              value={lsys.step}
              onChange={(e)=>setLsys(v=>({...v, step: Number(e.target.value)}))} />
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">{lsys.step}px</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)]">Render Mode</label>
            <select
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2"
              value={mode}
              onChange={(e)=>setMode(e.target.value as Mode)}
            >
              <option value="gears">Gears & Rods</option>
              <option value="path">Path only</option>
            </select>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button className="btn" onClick={exportSVG}>Export SVG</button>
          <button className="btn" onClick={exportFrameStrip}>Export Frame Strip</button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)]">
        <canvas ref={canvasRef} className="h-[420px] w-full" />
      </div>
    </div>
  );
}

export default ClockworkAutomataPanel;
