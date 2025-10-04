"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Chrono Plot: real-time multi-series plotter with pan/zoom, crosshair, tooltip, and steampunk axes.
// Implementation notes:
// - Canvas-based renderer for performance
// - Synthetic signal generator with multiple channels (sine, saw, noise)
// - Pan/zoom via wheel/drag; time window in seconds
// - Steampunk-leaning axes: brass ticks, rivet corners, parchment bg overlay
// - Cursor tooltip shows time/value for each series

type Series = {
  name: string;
  color: string; // CSS color
  data: { t: number; v: number }[];
};

export function ChronoPlotPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [tWindow, setTWindow] = useState(12); // seconds visible
  const [yRange, setYRange] = useState<[number, number]>([-2, 2]);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState(0); // seconds, + = older in view
  const panState = useRef<{ dragging: boolean; lastX: number | null }>({ dragging: false, lastX: null });

  // Synthetic generator parameters
  const config = useMemo(() => ({
    rate: 60, // Hz
    channels: [
      { name: "sine", color: "oklch(0.63 0.19 70)", amp: 1.0, freq: 0.5, phase: 0 },
      { name: "saw", color: "oklch(0.72 0.11 40)", amp: 0.7, freq: 0.25, phase: 0.1 },
      { name: "noise", color: "oklch(0.55 0.06 25)", amp: 0.35, freq: 0, phase: 0 },
    ]
  }), []);

  const seriesRef = useRef<Series[]>(config.channels.map(c => ({
    name: c.name,
    color: c.color,
    data: []
  })));

  // Data generation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now() / 1000;

    const tick = () => {
      if (!running) { raf = requestAnimationFrame(tick); return; }
      const now = performance.now() / 1000;
      const dt = now - last;
      const step = 1 / config.rate;
      if (dt >= step) {
        last = now;
        // push new samples
        config.channels.forEach((ch, i) => {
          let v = 0;
          if (ch.name === "sine") {
            v = ch.amp * Math.sin(2 * Math.PI * ch.freq * now + ch.phase);
          } else if (ch.name === "saw") {
            const p = (now * ch.freq + ch.phase) % 1;
            v = ch.amp * (2 * p - 1);
          } else if (ch.name === "noise") {
            v = ch.amp * (Math.random() * 2 - 1);
          }
          seriesRef.current[i].data.push({ t: now, v });
          // prune old data beyond window margin
          const minT = now - (tWindow + 10);
          while (seriesRef.current[i].data.length && seriesRef.current[i].data[0].t < minT) {
            seriesRef.current[i].data.shift();
          }
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, tWindow, config]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((canvas.clientWidth || 800) * dpr);
      const h = Math.floor((canvas.clientHeight || 320) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }

      // Layout
      const padLeft = 64 * dpr;
      const padRight = 18 * dpr;
      const padTop = 18 * dpr;
      const padBottom = 28 * dpr;
      const plotW = w - padLeft - padRight;
      const plotH = h - padTop - padBottom;

      // Background parchment with subtle vignette
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(247, 241, 227, 1)");
      grad.addColorStop(1, "rgba(245, 236, 220, 1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rivet corners
      const rivet = (x: number, y: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(176,127,69,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(110,79,42,0.6)";
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
        ctx.restore();
      };
      rivet(padLeft, padTop);
      rivet(w - padRight, padTop);
      rivet(padLeft, h - padBottom);
      rivet(w - padRight, h - padBottom);

      // Brass frame
      ctx.save();
      ctx.strokeStyle = "rgba(110,79,42,0.6)";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(padLeft - dpr, padTop - dpr, plotW + 2 * dpr, plotH + 2 * dpr);
      ctx.restore();

      // Time range
      const now = performance.now() / 1000;
      const tEnd = now - panOffset;
      const tStart = tEnd - tWindow;
      const [yMin, yMax] = yRange;

      const xt = (t: number) => padLeft + ((t - tStart) / (tEnd - tStart)) * plotW;
      const yt = (v: number) => padTop + (1 - (v - yMin) / (yMax - yMin)) * plotH;

      // Grid and ticks (brass)
      ctx.save();
      ctx.strokeStyle = "rgba(110,79,42,0.25)";
      ctx.fillStyle = "rgba(110,79,42,0.8)";
      ctx.lineWidth = 1 * dpr;
      // vertical ticks ~ every 1s (adaptive)
      const approx = tWindow / 8;
      const step = Math.pow(10, Math.floor(Math.log10(approx)));
      const muls = [1, 2, 5];
      const m = muls.reduce((prev, m) => Math.abs(approx - m * step) < Math.abs(approx - prev * step) ? m : prev, muls[0]);
      const major = m * step;

      for (let t = Math.ceil(tStart / major) * major; t <= tEnd; t += major) {
        const x = xt(t);
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotH);
        ctx.stroke();
        // tick
        ctx.beginPath();
        ctx.moveTo(x, padTop + plotH);
        ctx.lineTo(x, padTop + plotH + 6 * dpr);
        ctx.stroke();
        // label
        ctx.font = `${11 * dpr}px ui-sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText((t - tEnd).toFixed(0) + "s", x, padTop + plotH + 8 * dpr);
      }

      // horizontal ticks
      const ySteps = 4;
      for (let i = 0; i <= ySteps; i++) {
        const v = yMin + (i / ySteps) * (yMax - yMin);
        const y = yt(v);
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();
        ctx.font = `${11 * dpr}px ui-sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(v.toFixed(1), padLeft - 8 * dpr, y);
      }
      ctx.restore();

      // Draw series
      seriesRef.current.forEach(s => {
        ctx.save();
        ctx.lineWidth = 2 * dpr;
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        let drew = false;
        for (let i = 0; i < s.data.length; i++) {
          const dp = s.data[i];
          if (dp.t < tStart || dp.t > tEnd) continue;
          const x = xt(dp.t);
          const y = yt(dp.v);
          if (!drew) { ctx.moveTo(x, y); drew = true; }
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Crosshair and tooltip
      if (hover) {
        const cx = hover.x * dpr;
        const cy = hover.y * dpr;
        ctx.save();
        ctx.strokeStyle = "rgba(110,79,42,0.4)";
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, padTop + plotH);
        ctx.moveTo(padLeft, cy);
        ctx.lineTo(padLeft + plotW, cy);
        ctx.stroke();

        // compute nearest time
        const tHover = tStart + ((cx - padLeft) / plotW) * (tEnd - tStart);
        // gather values at tHover (nearest sample)
        const rows: { name: string; v: number }[] = [];
        seriesRef.current.forEach(s => {
          // linear search nearest
          let best = null as null | { dt: number; v: number };
          for (const dp of s.data) {
            if (dp.t < tStart || dp.t > tEnd) continue;
            const dt = Math.abs(dp.t - tHover);
            if (!best || dt < best.dt) best = { dt, v: dp.v };
          }
          rows.push({ name: s.name, v: best ? best.v : NaN });
        });

        // tooltip
        const boxX = Math.min(Math.max(cx + 10 * dpr, padLeft), padLeft + plotW - 160 * dpr);
        const boxY = Math.max(cy - 60 * dpr, padTop + 4 * dpr);
        const bw = 150 * dpr;
        const bh = (18 + rows.length * 16) * dpr;
        ctx.fillStyle = "rgba(250, 244, 236, 0.95)";
        ctx.strokeStyle = "rgba(110,79,42,0.6)";
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.rect(boxX, boxY, bw, bh);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(58,42,23,0.95)";
        ctx.font = `${12 * dpr}px ui-sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("t " + (tHover - tEnd).toFixed(2) + "s", boxX + 8 * dpr, boxY + 6 * dpr);
        rows.forEach((r, i) => {
          ctx.fillText(`${r.name}: ${isFinite(r.v) ? r.v.toFixed(3) : "-"}`, boxX + 8 * dpr, boxY + (22 + i * 16) * dpr);
        });

        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [tWindow, yRange, panOffset, hover]);

  // Interactions: pan (drag), zoom (wheel), hover
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      if (e.ctrlKey || e.metaKey) {
        // zoom time window
        const next = Math.min(60, Math.max(2, tWindow * (1 + (delta > 0 ? 0.1 : -0.1))));
        setTWindow(next);
      } else if (e.shiftKey) {
        // zoom Y range
        const [mn, mx] = yRange;
        const span = mx - mn;
        const factor = 1 + (delta > 0 ? 0.1 : -0.1);
        const mid = (mx + mn) / 2;
        const nspan = Math.min(10, Math.max(0.5, span * factor));
        setYRange([mid - nspan / 2, mid + nspan / 2]);
      } else {
        // pan time
        setPanOffset(p => Math.max(-30, Math.min(30, p + (delta > 0 ? 0.5 : -0.5))));
      }
    };
    const onDown = (e: MouseEvent) => {
      panState.current.dragging = true;
      panState.current.lastX = e.clientX;
    };
    const onUp = () => {
      panState.current.dragging = false;
      panState.current.lastX = null;
    };
    const onMove = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (panState.current.dragging && panState.current.lastX != null) {
        const dx = e.clientX - panState.current.lastX;
        panState.current.lastX = e.clientX;
        // drag pans time offset (scale by window)
        setPanOffset(p => {
          const secPerPx = tWindow / rect.width;
          return Math.max(-60, Math.min(60, p + dx * secPerPx));
        });
      }
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    c.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      c.removeEventListener("wheel", onWheel);
      c.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, [tWindow, yRange]);

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Real-time multi-series plotter. Wheel to pan/zoom (Ctrl/Cmd = time zoom, Shift = Y zoom). Hover for tooltip.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Time Window (s)</label>
          <input
            className="mt-1 w-full"
            type="range"
            min={2}
            max={60}
            step={1}
            value={tWindow}
            onChange={(e)=>setTWindow(Number(e.target.value))}
          />
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{tWindow.toFixed(0)}s</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Y Range</label>
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">[{yRange[0].toFixed(1)}, {yRange[1].toFixed(1)}]</div>
          <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">Shift + wheel to zoom</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)]">Playback</label>
          <div className="mt-1 flex gap-2">
            <button className="btn" onClick={() => setRunning(true)}>Play</button>
            <button className="btn" onClick={() => setRunning(false)}>Pause</button>
          </div>
        </div>
      </div>

      <div className="mt-3 h-64 overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--border)] bg-[var(--card)]">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}

export default ChronoPlotPanel;
