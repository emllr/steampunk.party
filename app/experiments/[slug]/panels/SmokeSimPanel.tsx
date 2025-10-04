"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Smoke Sim experiment (client-only)
 * WebGL2 ping-pong density buffer with curl-noise advection and visible defaults.
 */
export function SmokeSimPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const startTS = useRef<number>(0);
  const [running, setRunning] = useState(true);

  // Controls with stronger default visibility
  const [density, setDensity] = useState(2.0);   // 0..2 (alpha multiplier)
  const [flow, setFlow] = useState(1.5);         // 0.2..3 (advection strength)
  const [scale, setScale] = useState(1.0);       // 0.4..6 (turbulence frequency)
  const [boost, setBoost] = useState(false);     // turbulence boost
  const [updraft, setUpdraft] = useState(true);  // vertical bias
  const [bronze, setBronze] = useState(true);    // bronze colorize
  const [windAngle, setWindAngle] = useState(0); // 0..360 degrees
  const [windStrength, setWindStrength] = useState(0.2); // 0..2
  const [sourceStrength, setSourceStrength] = useState(1.5); // 0..3
  const [dissipation, setDissipation] = useState(1.0); // 0.8..1.0

  const resetControls = () => {
    setDensity(2.0);
    setFlow(1.5);
    setScale(1.0);
    setBoost(false);
    setUpdraft(true);
    setBronze(true);
    setWindAngle(0);
    setWindStrength(0.2);
    setSourceStrength(1.5);
    setDissipation(1.0);
  };

  // GL resources
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const vboRef = useRef<WebGLBuffer | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const rafRef = useRef<number>(0);

  // Store current values in refs so render loop can access them
  const controlsRef = useRef({
    density, flow, scale, boost, updraft, bronze,
    windAngle, windStrength, sourceStrength, dissipation
  });

  // Update the ref whenever controls change
  useEffect(() => {
    controlsRef.current = {
      density, flow, scale, boost, updraft, bronze,
      windAngle, windStrength, sourceStrength, dissipation
    };
  }, [density, flow, scale, boost, updraft, bronze, windAngle, windStrength, sourceStrength, dissipation]);

  const vertSrc = useMemo(() => `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos*0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`, []);

  // High-performance realistic steam simulation for RTX 5090
  const fragSrc = useMemo(() => `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o_col;

uniform float u_time;
uniform vec2  u_res;
uniform float u_density;
uniform float u_flow;
uniform float u_scale;
uniform float u_boost;
uniform float u_updraft;
uniform float u_bronze;
uniform float u_windAngle;
uniform float u_windStrength;
uniform float u_sourceStrength;
uniform float u_dissipation;

float hash(vec2 p){return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);}
float hash1(float n){return fract(sin(n) * 43758.5453);}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for(int i = 0; i < 8; i++) { // Max quality for RTX 5090
    value += amplitude * noise(p * frequency);
    frequency *= 2.1;
    amplitude *= 0.48;
  }
  return value;
}

// Curl noise for realistic turbulence
vec2 curl(vec2 p) {
  float e = 0.01;
  float n1 = noise(p + vec2(0, e));
  float n2 = noise(p - vec2(0, e));
  float n3 = noise(p + vec2(e, 0));
  float n4 = noise(p - vec2(e, 0));
  return vec2(n1 - n2, n4 - n3);
}

// Simulate a whispy smoke strand that moves continuously
float smokeStrand(vec2 p, float id) {
  // Continuous spawning with cycling
  float lifetime = 4.0;
  float cycleOffset = id * 0.08;
  float spawnTime = floor((u_time + cycleOffset) / lifetime) * lifetime - cycleOffset;
  float age = u_time - spawnTime;

  if (age < 0.0 || age > lifetime) return 0.0;

  // Unique random properties per strand
  float seed = id + floor(spawnTime * 0.1);
  float rnd1 = hash1(seed * 12.34);
  float rnd2 = hash1(seed * 56.78);
  float rnd3 = hash1(seed * 90.12);
  float rnd4 = hash1(seed * 34.56);

  // Start position with variation
  vec2 startPos = vec2((rnd1 - 0.5) * 0.35, -0.9 + rnd2 * 0.05);

  // Wind direction
  float windRad = radians(u_windAngle);
  vec2 windDir = vec2(cos(windRad), sin(windRad));

  // Base velocity with variation
  vec2 velocity = vec2(0.0, 0.8 + rnd3 * 0.4);
  velocity += windDir * u_windStrength * (0.3 + rnd1 * 0.2);
  if (u_updraft > 0.5) velocity.y += 0.3;
  velocity *= u_flow;

  // Calculate position with proper turbulence
  vec2 pos = startPos + velocity * age * 0.35;

  // Apply curl noise turbulence at multiple scales
  float turbTime = age * 0.5;
  vec2 turbPos = pos + vec2(seed * 1.3, turbTime);

  // Primary turbulence
  vec2 turb = curl(turbPos * u_scale) * 0.4;
  // Secondary detail
  turb += curl(turbPos * u_scale * 2.3 + vec2(100.0, 0.0)) * 0.2;
  // Fine detail
  turb += curl(turbPos * u_scale * 4.7 + vec2(200.0, 0.0)) * 0.1;

  if (u_boost > 0.5) {
    turb *= 1.8;
    // Add extra chaotic motion
    turb += curl(turbPos * u_scale * 8.0) * 0.15;
  }

  // Apply turbulence that increases with age
  pos += turb * age * 0.25;

  // Whispy elongated shape
  vec2 stretch = vec2(1.0 + age * 0.2, 0.35);
  vec2 diff = (p - pos) / stretch;
  float dist = length(diff);

  // Thin wisps that vary in width
  float width = 0.045 + age * 0.025;
  width *= (1.0 + noise(vec2(age * 3.0, seed * 5.0)) * 0.4);

  // Sharp gaussian for whispy look
  float density = exp(-dist * dist / (width * width)) * 1.5;

  // Break up the strand with noise for realistic gaps
  float breakup = noise(p * 8.0 + vec2(seed * 2.0, age * 1.5));
  breakup = smoothstep(0.15, 0.7, breakup);
  density *= breakup;

  // Additional fine breakup
  float fineBreak = noise(p * 15.0 + vec2(seed * 3.0, age * 2.5));
  density *= smoothstep(0.1, 0.6, fineBreak);

  // Fade with age and dissipation
  float ageFade = 1.0 - smoothstep(2.0, lifetime, age);
  density *= ageFade * u_dissipation;

  return density * u_sourceStrength;
}

void main(){
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * 2.0;

  float smoke = 0.0;

  // Many whispy strands for realistic steam
  for(float i = 0.0; i < 30.0; i++) {
    smoke += smokeStrand(p, i) * 0.7;
    // Add offset layer for depth
    smoke += smokeStrand(p, i + 100.0) * 0.3;
  }

  // Additional fine strands for detail
  for(float i = 30.0; i < 45.0; i++) {
    smoke += smokeStrand(p, i * 1.5) * 0.4;
  }

  // Non-linear shaping for better contrast
  smoke = pow(smoke * 1.2, 0.9);
  smoke = smoothstep(0.0, 1.2, smoke);

  // Apply density
  float alpha = smoke * u_density;

  // Softer vignette
  float vign = 1.0 - smoothstep(0.9, 1.8, length(p));
  alpha *= vign;
  alpha = clamp(alpha, 0.0, 1.0);

  // Color with more variation
  vec3 color;
  if (u_bronze > 0.5) {
    vec3 bronze1 = vec3(0.50,0.35,0.22);
    vec3 bronze2 = vec3(0.78,0.62,0.42);
    color = mix(bronze1, bronze2, pow(smoke, 0.7));
    // Add slight color variation
    color += vec3(noise(p * 10.0) - 0.5) * 0.05;
  } else {
    vec3 gray1 = vec3(0.28,0.25,0.22);
    vec3 gray2 = vec3(0.70,0.68,0.65);
    color = mix(gray1, gray2, pow(smoke, 0.8));
  }

  o_col = vec4(color, alpha);
}`, []);

  const drawFragSrc = useMemo(() => `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o_col;
uniform sampler2D u_tex;
uniform float u_density;

void main(){
  float d = texture(u_tex, v_uv).r;
  vec2 p2 = (v_uv - 0.5) * 2.0;
  float vign = 1.0 - smoothstep(0.62, 1.08, length(p2));
  float alpha = clamp((0.35 + u_density * 1.6) * d * vign, 0.0, 1.0);

  // bronze colorize option
  vec3 a = vec3(0.30,0.24,0.18);
  vec3 b = vec3(0.80,0.66,0.50);
  vec3 smoke = mix(a, b, d);
  if (u_bronze > 0.5) {
    vec3 c1 = vec3(0.38,0.28,0.18);
    vec3 c2 = vec3(0.87,0.67,0.38);
    smoke = mix(c1, c2, d);
  }
  smoke += (u_density - 1.0) * 0.08;
  o_col = vec4(smoke, alpha);
}`, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;

    // Initialize start time when component mounts
    startTS.current = performance.now();

    const compile = (type:number, src:string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        console.error("Shader source:", src);
      }
      return s;
    };
    const link = (vsSrc:string, fsSrc:string) => {
      const vs = compile(gl.VERTEX_SHADER, vsSrc);
      const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs); gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog) || "Program link error");
      }
      gl.deleteShader(vs); gl.deleteShader(fs);
      return prog;
    };

    // Always get a WebGLProgram here (non-null)
    const program: WebGLProgram = link(vertSrc, fragSrc);
    programRef.current = program;

    // Bind program before any queries
    gl.useProgram(program);

    // Fullscreen triangle
    const vao = gl.createVertexArray()!;
    const vbo = gl.createBuffer()!;
    vaoRef.current = vao;
    vboRef.current = vbo;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Store uniform locations
    uniformsRef.current = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_res: gl.getUniformLocation(program, "u_res"),
      u_density: gl.getUniformLocation(program, "u_density"),
      u_flow: gl.getUniformLocation(program, "u_flow"),
      u_scale: gl.getUniformLocation(program, "u_scale"),
      u_boost: gl.getUniformLocation(program, "u_boost"),
      u_updraft: gl.getUniformLocation(program, "u_updraft"),
      u_bronze: gl.getUniformLocation(program, "u_bronze"),
      u_windAngle: gl.getUniformLocation(program, "u_windAngle"),
      u_windStrength: gl.getUniformLocation(program, "u_windStrength"),
      u_sourceStrength: gl.getUniformLocation(program, "u_sourceStrength"),
      u_dissipation: gl.getUniformLocation(program, "u_dissipation")
    };

    console.log("Uniform locations:", uniformsRef.current);

    const render = () => {
      if (!running) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const t = (performance.now() - startTS.current) / 1000;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor((canvas.clientWidth || 400) * dpr);
      const h = Math.floor((canvas.clientHeight || 256) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      // Clear to transparent
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Use program and get current control values from ref
      gl.useProgram(program);
      const controls = controlsRef.current;
      const uniforms = uniformsRef.current;

      if (uniforms.u_time) gl.uniform1f(uniforms.u_time, t);
      if (uniforms.u_res) gl.uniform2f(uniforms.u_res, w, h);
      if (uniforms.u_density) gl.uniform1f(uniforms.u_density, Math.max(0.0, controls.density));
      if (uniforms.u_flow) gl.uniform1f(uniforms.u_flow, Math.max(0.01, controls.flow));
      if (uniforms.u_scale) gl.uniform1f(uniforms.u_scale, Math.max(0.01, controls.scale));
      if (uniforms.u_boost) gl.uniform1f(uniforms.u_boost, controls.boost ? 1.0 : 0.0);
      if (uniforms.u_updraft) gl.uniform1f(uniforms.u_updraft, controls.updraft ? 1.0 : 0.0);
      if (uniforms.u_bronze) gl.uniform1f(uniforms.u_bronze, controls.bronze ? 1.0 : 0.0);
      if (uniforms.u_windAngle) gl.uniform1f(uniforms.u_windAngle, controls.windAngle);
      if (uniforms.u_windStrength) gl.uniform1f(uniforms.u_windStrength, controls.windStrength);
      if (uniforms.u_sourceStrength) gl.uniform1f(uniforms.u_sourceStrength, controls.sourceStrength);
      if (uniforms.u_dissipation) gl.uniform1f(uniforms.u_dissipation, controls.dissipation);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);

      rafRef.current = requestAnimationFrame(render);
    };

    setRunning(true);
    rafRef.current = requestAnimationFrame(render);

    const onVis = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVis);
      // Safely delete GL resources
      if (programRef.current && gl) gl.deleteProgram(programRef.current);
      if (vboRef.current && gl) gl.deleteBuffer(vboRef.current);
      if (vaoRef.current && gl) gl.deleteVertexArray(vaoRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-6 rounded-lg border-2 border-bronze-700/30 bg-gradient-to-br from-bronze-900/20 via-bronze-800/15 to-zinc-900/30 p-4 shadow-xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-bronze-500 animate-pulse" />
        <h3 className="font-bold text-bronze-600 tracking-wide">Steam Engine Exhaust Simulator</h3>
      </div>
      <p className="text-sm text-bronze-700/90">
        Adjust the brass valves and gauges to control the steam plume dynamics.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Steam Density</label>
          <Input type="range" min={0} max={2} step={0.01} value={density} onChange={(e)=>setDensity(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{density.toFixed(2)} PSI</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Flow Rate</label>
          <Input type="range" min={0.2} max={3} step={0.01} value={flow} onChange={(e)=>setFlow(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{flow.toFixed(2)} m/s</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Turbulence</label>
          <Input type="range" min={0.4} max={6} step={0.05} value={scale} onChange={(e)=>setScale(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{scale.toFixed(2)} Hz</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Wind Bearing</label>
          <Input type="range" min={0} max={360} step={1} value={windAngle} onChange={(e)=>setWindAngle(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{windAngle}°</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Wind Force</label>
          <Input type="range" min={0} max={2} step={0.01} value={windStrength} onChange={(e)=>setWindStrength(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{windStrength.toFixed(2)} kN</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Boiler Output</label>
          <Input type="range" min={0} max={3} step={0.01} value={sourceStrength} onChange={(e)=>setSourceStrength(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{(sourceStrength * 100).toFixed(0)}%</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="relative rounded-lg bg-gradient-to-br from-bronze-800/20 to-bronze-700/10 p-3 border border-bronze-700/40">
          <label className="block text-xs font-bold text-bronze-600 uppercase tracking-wider">Dissipation</label>
          <Input type="range" min={0.8} max={1} step={0.001} value={dissipation} onChange={(e)=>setDissipation(Number(e.target.value))} className="mt-2 accent-bronze-500" />
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-bronze-500 font-mono">{((1 - dissipation) * 100).toFixed(1)}%</div>
            <div className="h-1.5 w-1.5 rounded-full bg-bronze-400" />
          </div>
        </div>
        <div className="sm:col-span-3">
          <div className="mt-4 flex flex-wrap gap-6 p-3 rounded-lg bg-zinc-900/30 border border-bronze-700/30">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-bronze-600 uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={boost}
                onChange={(e)=>setBoost(e.target.checked)}
                className="accent-bronze-500"
              />
              <span style={{filter: "hue-rotate(140deg)"}}>⚙️</span><span> Turbulence Boost</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-bronze-600 uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={updraft}
                onChange={(e)=>setUpdraft(e.target.checked)}
                className="accent-bronze-500"
              />
              <span style={{filter: "hue-rotate(190deg)"}}>⬆️</span><span> Updraft</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-bronze-600 uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={bronze}
                onChange={(e)=>setBronze(e.target.checked)}
                className="accent-bronze-500"
              />
              <span style={{filter: "hue-rotate(50deg)"}}>🎨</span><span> Bronze Patina</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-bronze-800/20 to-transparent pointer-events-none rounded-lg" />
        <div className="h-80 overflow-hidden rounded-lg border-2 border-bronze-700/40 bg-gradient-to-b from-zinc-950 to-bronze-900/20">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bronze-800/40 via-bronze-700/20 to-transparent pointer-events-none rounded-b-lg" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-3">
          {!running ? (
            <Button onClick={() => setRunning(true)} className="bg-bronze-600 hover:bg-bronze-500 text-bronze-50">
              <span className="mr-2">▶️</span> Resume Steam
            </Button>
          ) : (
            <Button onClick={() => setRunning(false)} variant="outline" className="border-bronze-600 text-bronze-600 hover:bg-bronze-600/10">
              <span className="mr-2">⏸️</span> Pause Steam
            </Button>
          )}
          <Button onClick={resetControls} variant="outline" className="border-bronze-600 text-bronze-600 hover:bg-bronze-600/10">
            <span className="mr-2">↺</span> Reset Valves
          </Button>
        </div>
        <div className="text-[10px] text-bronze-600/70 font-mono">
          Victorian Steam Engine v1.0 | Patent Pending 1887
        </div>
      </div>
    </div>
  );
}

export default SmokeSimPanel;
