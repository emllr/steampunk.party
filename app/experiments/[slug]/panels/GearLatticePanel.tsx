"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Gear Lattice MVP
// - Involute gear path generator (SVG)
// - Parameters: tooth count, module, pressure angle, bore, rim width
// - Lattice composer: grid and hex layouts
// - Export SVG button

type GearParams = {
  teeth: number;           // z
  module: number;          // m (mm per tooth), controls overall size
  pressureDeg: number;     // α in degrees
  bore: number;            // inner hole radius (mm)
  rim: number;             // rim thickness beyond base circle (mm)
};

type LatticeParams = {
  kind: "grid" | "hex";
  rows: number;
  cols: number;
  spacing: number; // center-to-center spacing factor
  jitter: number;  // random jitter for decorative variation
};

function deg2rad(d: number) { return (d * Math.PI) / 180; }

// Basic involute gear geometry based on standard equations
function makeGearPath(p: GearParams): { d: string; outerRadius: number } {
  const z = Math.max(6, Math.floor(p.teeth)); // clamp to reasonable minimum
  const m = Math.max(0.5, p.module);
  const alpha = deg2rad(p.pressureDeg);

  // Standard gear radii (units in mm if module is mm)
  const rPitch = (z * m) / 2;             // pitch radius
  const rBase = rPitch * Math.cos(alpha); // base circle radius
  const addendum = m;                      // addendum
  const dedendum = 1.25 * m;              // dedendum (approx standard)
  const rOuter = rPitch + addendum;       // outer (tip) radius
  const rRoot = Math.max(0, rPitch - dedendum); // root circle radius
  const rBore = Math.max(0, p.bore);      // bore radius
  const rRim = Math.max(rOuter - p.rim, rRoot + 0.5 * m); // inner rim radius for decorative ring

  // Tooth geometry
  const toothAngle = (2 * Math.PI) / z; // circular pitch angle

  // Involute function helpers: param t traces involute from base circle
  const involute = (rb: number, t: number) => {
    const x = rb * (Math.cos(t) + t * Math.sin(t));
    const y = rb * (Math.sin(t) - t * Math.cos(t));
    return { x, y };
  };

  // Find t such that involute radius reaches given r
  function solveInvoluteT(rb: number, r: number) {
    if (r <= rb) return 0;
    let t = Math.sqrt((r * r) / (rb * rb) - 1); // initial guess from r = rb * sqrt(1 + t^2)
    for (let i = 0; i < 8; i++) {
      const f = rb * Math.sqrt(1 + t * t) - r;
      const df = rb * (t / Math.sqrt(1 + t * t));
      t -= f / (df || 1e-6);
    }
    return Math.max(0, t);
  }

  // Build a single tooth flank path in +Y, then mirror/rotate for the full gear.
  const tOuter = solveInvoluteT(rBase, rOuter);
  const pOuter = involute(rBase, tOuter);
  const phi = Math.atan2(pOuter.y, pOuter.x); // angle of involute at outer intersection

  // Half tooth thickness angle at pitch circle (assume standard ~π/2z)
  // More accurate uses tooth thickness at pitch, but this is a decent aesthetic approximation.
  const halfTooth = (Math.PI / (2 * z)) * 0.95;

  // Build one tooth outline using arcs and involutes, then rotate/duplicate.
  // We'll approximate with polyline for the involute flank.
  const samples = 8;
  const flank: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (tOuter * i) / samples;
    const { x, y } = involute(rBase, t);
    flank.push({ x, y });
  }

  // Rotate helper
  function rot(pt: { x: number; y: number }, a: number) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: c * pt.x - s * pt.y, y: s * pt.x + c * pt.y };
  }

  // Mirror across X-axis
  function mirrorX(pt: { x: number; y: number }) {
    return { x: pt.x, y: -pt.y };
  }

  // Compose full gear
  let d = "";

  // Outer decorative rim (between rOuter and rRim), draw later as separate path
  const rimD = `M ${rRim} 0 A ${rRim} ${rRim} 0 1 0 ${-rRim} 0 A ${rRim} ${rRim} 0 1 0 ${rRim} 0
M ${rOuter} 0 A ${rOuter} ${rOuter} 0 1 1 ${-rOuter} 0 A ${rOuter} ${rOuter} 0 1 1 ${rOuter} 0 Z`;

  // Bore (hole)
  const boreD = rBore > 0
    ? `M ${rBore} 0 A ${rBore} ${rBore} 0 1 0 ${-rBore} 0 A ${rBore} ${rBore} 0 1 0 ${rBore} 0 Z`
    : "";

  // Tooth paths
  let teethD = "";
  for (let k = 0; k < z; k++) {
    const baseRot = k * toothAngle;
    const thetaLeft = baseRot - halfTooth;  // left boundary near pitch
    const thetaRight = baseRot + halfTooth; // right boundary near pitch

    // Rotate flank to right side (positive Y)
    const flankR = flank.map(pt => rot(pt, thetaRight + phi));
    // Mirror for left flank
    const flankL = flank.map(pt => mirrorX(pt)).map(pt => rot(pt, thetaLeft - phi));

    // Root points on root circle at boundaries
    const rootR = { x: rRoot * Math.cos(thetaRight), y: rRoot * Math.sin(thetaRight) };
    const rootL = { x: rRoot * Math.cos(thetaLeft), y: rRoot * Math.sin(thetaLeft) };

    // Build tooth polygon path: rootR -> flankR (outer) -> tip arc -> flankL -> rootL -> root arc back
    let tooth = `M ${rootR.x} ${rootR.y}`;
    flankR.forEach((pt) => { tooth += ` L ${pt.x} ${pt.y}`; });
    // Tip arc between last points of flanks projected to outer circle
    const tipA = Math.atan2(flankR[flankR.length - 1].y, flankR[flankR.length - 1].x);
    const tipB = Math.atan2(flankL[flankL.length - 1].y, flankL[flankL.length - 1].x);
    tooth += ` A ${rOuter} ${rOuter} 0 0 0 ${flankL[flankL.length - 1].x} ${flankL[flankL.length - 1].y}`;
    // Back down left flank
    for (let i = flankL.length - 2; i >= 0; i--) {
      const pt = flankL[i];
      tooth += ` L ${pt.x} ${pt.y}`;
    }
    // Root arc back to rootR
    tooth += ` A ${rRoot} ${rRoot} 0 0 0 ${rootR.x} ${rootR.y} Z`;

    teethD += tooth + "\n";
  }

  // Combine: rim ring minus bore + teeth outline (render orders handle fill aesthetics)
  d += rimD + "\n" + boreD + "\n" + teethD;
  return { d, outerRadius: rOuter };
}

function composeLattice(kind: LatticeParams["kind"], rows: number, cols: number, step: number, jitter: number) {
  const pts: { x: number; y: number }[] = [];
  if (kind === "grid") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jx = (Math.random() * 2 - 1) * jitter;
        const jy = (Math.random() * 2 - 1) * jitter;
        pts.push({ x: c * step + jx, y: r * step + jy });
      }
    }
  } else {
    // hex layout (pointy top)
    const spacingX = step;
    const spacingY = step * Math.sqrt(3) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetX = (r % 2 === 0) ? 0 : spacingX / 2;
        const jx = (Math.random() * 2 - 1) * jitter;
        const jy = (Math.random() * 2 - 1) * jitter;
        pts.push({ x: c * spacingX + offsetX + jx, y: r * spacingY + jy });
      }
    }
  }
  return pts;
}

export function GearLatticePanel() {
  const [params, setParams] = useState<GearParams>({
    teeth: 16,
    module: 8,
    pressureDeg: 20,
    bore: 10,
    rim: 6,
  });

  const [lattice, setLattice] = useState<LatticeParams>({
    kind: "grid",
    rows: 3,
    cols: 4,
    spacing: 40,
    jitter: 0,
  });

  const { d, outerRadius } = useMemo(() => makeGearPath(params), [params]);
  const centers = useMemo(
    () => composeLattice(lattice.kind, lattice.rows, lattice.cols, lattice.spacing, lattice.jitter),
    [lattice]
  );

  // Compute viewbox to fit lattice
  const maxX = Math.max(...centers.map(p => p.x), 0) + outerRadius + 20;
  const maxY = Math.max(...centers.map(p => p.y), 0) + outerRadius + 20;
  const vb = `0 0 ${Math.max(200, maxX)} ${Math.max(200, maxY)}`;

  const svgRef = useRef<SVGSVGElement | null>(null);

  const exportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const content = serializer.serializeToString(svgRef.current);
    const blob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gear-lattice.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Parametric involute gears arranged in a lattice. Tweak parameters and export SVG.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Teeth</label>
          <input type="range" min={6} max={64} step={1} className="mt-1 w-full"
            value={params.teeth}
            onChange={(e)=>setParams(v=>({...v, teeth: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{params.teeth}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Module</label>
          <input type="range" min={2} max={16} step={0.5} className="mt-1 w-full"
            value={params.module}
            onChange={(e)=>setParams(v=>({...v, module: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{params.module.toFixed(1)}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Pressure Angle</label>
          <input type="range" min={14} max={30} step={1} className="mt-1 w-full"
            value={params.pressureDeg}
            onChange={(e)=>setParams(v=>({...v, pressureDeg: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{params.pressureDeg}°</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Bore (mm)</label>
          <input type="range" min={0} max={30} step={1} className="mt-1 w-full"
            value={params.bore}
            onChange={(e)=>setParams(v=>({...v, bore: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{params.bore} mm</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Rim (mm)</label>
          <input type="range" min={2} max={20} step={1} className="mt-1 w-full"
            value={params.rim}
            onChange={(e)=>setParams(v=>({...v, rim: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{params.rim} mm</div>
        </div>
        <div className="flex items-end">
          <button className="btn" onClick={exportSVG}>Export SVG</button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Layout</label>
          <select
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] p-2"
            value={lattice.kind}
            onChange={(e)=>setLattice(v=>({...v, kind: e.target.value as LatticeParams['kind']}))}
          >
            <option value="grid">Grid</option>
            <option value="hex">Hex</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Rows</label>
          <input type="number" min={1} max={10} className="mt-1 w-full"
            value={lattice.rows}
            onChange={(e)=>setLattice(v=>({...v, rows: Number(e.target.value)}))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Cols</label>
          <input type="number" min={1} max={10} className="mt-1 w-full"
            value={lattice.cols}
            onChange={(e)=>setLattice(v=>({...v, cols: Number(e.target.value)}))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Spacing</label>
          <input type="range" min={20} max={120} step={2} className="mt-1 w-full"
            value={lattice.spacing}
            onChange={(e)=>setLattice(v=>({...v, spacing: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{lattice.spacing} px</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Jitter</label>
          <input type="range" min={0} max={10} step={0.5} className="mt-1 w-full"
            value={lattice.jitter}
            onChange={(e)=>setLattice(v=>({...v, jitter: Number(e.target.value)}))} />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{lattice.jitter.toFixed(1)} px</div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)]">
        <svg
          ref={svgRef}
          viewBox={vb}
          xmlns="http://www.w3.org/2000/svg"
          className="h-[420px] w-full"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <radialGradient id="gearFill" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="rgba(199,159,108,0.95)" />
              <stop offset="100%" stopColor="rgba(142,101,53,0.95)" />
            </radialGradient>
            <radialGradient id="rimFill" cx="50%" cy="50%" r="85%">
              <stop offset="0%" stopColor="rgba(176,127,69,0.35)" />
              <stop offset="100%" stopColor="rgba(110,79,42,0.35)" />
            </radialGradient>
          </defs>

          {centers.map((c, idx) => (
            <g key={idx} transform={`translate(${c.x + outerRadius + 10} ${c.y + outerRadius + 10})`}>
              <path d={d} fill="url(#rimFill)" stroke="rgba(110,79,42,0.6)" strokeWidth="0.8" />
              <path d={d} fill="url(#gearFill)" fillOpacity="0.3" stroke="rgba(110,79,42,0.75)" strokeWidth="0.6" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default GearLatticePanel;
