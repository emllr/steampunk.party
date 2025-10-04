# Steampunk.Party Experiments Roadmap

This document tracks implemented experiments and plans for future innovations. Each experiment combines Victorian-era aesthetics with modern web technologies for unique interactive experiences.

---

## 🔧 Currently Live Experiments

### 1) Brass Noise
- **Slug:** `brass-noise`
- **Status:** ✅ Live
- **Description:** Procedural audio generator that simulates warm brass timbres through noise excitation and resonator banks.
- **Features:**
  - Pink/brown noise source with envelope control
  - Multi-band resonator filters tuned to brass formants
  - Real-time color, damping, and resonance controls
  - Oscilloscope visualization
- **Tech Stack:** WebAudio API, AudioWorklet, Canvas 2D
- **Next Steps:**
  - Key/scale quantization for musical play
  - MIDI input support
  - WAV export functionality

### 2) Smoke Sim
- **Slug:** `smoke-sim`
- **Status:** ✅ Live
- **Description:** WebGL2 fluid simulation creating ethereal smoke effects with bronze-tinted volumetrics.
- **Features:**
  - Real-time curl noise advection
  - Density, flow, and turbulence controls
  - Bronze colorization and updraft effects
  - GPU-accelerated particle system
- **Tech Stack:** WebGL2, GLSL shaders
- **Next Steps:**
  - Mouse/touch interaction for smoke injection
  - Multi-emitter support
  - GIF/video export

### 3) Chrono Plot
- **Slug:** `chrono-plot`
- **Status:** ✅ Live
- **Description:** Real-time data visualization with steampunk-styled axes and ornamental details.
- **Features:**
  - Multi-series time plotting with synthetic data
  - Pan/zoom interactions (wheel, drag, keyboard)
  - Crosshair tooltips with precise values
  - Brass-themed axes and parchment background
- **Tech Stack:** Canvas 2D, RequestAnimationFrame
- **Next Steps:**
  - CSV data import
  - Legend with series toggles
  - PNG/SVG export

### 4) Gear Lattice
- **Slug:** `gear-lattice`
- **Status:** ✅ Live
- **Description:** Parametric involute gear generator for creating decorative mechanical patterns.
- **Features:**
  - Mathematically accurate involute tooth profiles
  - Adjustable parameters: tooth count, module, pressure angle
  - Grid/hex/radial layout patterns
  - SVG export for laser cutting
- **Tech Stack:** SVG generation, TypeScript geometry
- **Next Steps:**
  - Animated meshing preview
  - Constraint solver for valid gear trains
  - DXF export option

### 5) Vacuum Tubes
- **Slug:** `vacuum-tubes`
- **Status:** ✅ Live  
- **Description:** Interactive tube amplifier simulation with glowing visuals and transfer curves.
- **Features:**
  - Triode modeling with plate/grid voltage controls
  - Real-time oscilloscope display
  - Glowing filament animation
  - Transfer curve visualization
- **Tech Stack:** Canvas 2D, simplified SPICE-like solver
- **Next Steps:**
  - Multi-stage amplification
  - Audio pass-through processing
  - Tube preset library (12AX7, 6L6, etc.)

### 6) Clockwork Automata
- **Slug:** `clockwork-automata`
- **Status:** ✅ Live
- **Description:** L-system generator creating mechanical diagrams with gears and linkages.
- **Features:**
  - Customizable L-system rules and axioms
  - Turtle graphics interpreter
  - Gear/rod rendering modes
  - Frame-by-frame animation
- **Tech Stack:** Canvas 2D, L-system parser
- **Next Steps:**
  - Rule preset library
  - SVG export with mechanical constraints
  - 3D turtle commands

### 7) Aether Synth
- **Slug:** `aether-synth`
- **Status:** ✅ Live (Enhanced)
- **Description:** Granular synthesis texture generator with step sequencer and bronze-themed interface.
- **Features:**
  - Four unique texture types (steam, metal, crystal, vapor)
  - Real-time granular synthesis with full parameter control
  - 16-step pattern sequencer with BPM sync
  - Filter, compression, and reverb effects
  - Animated scope with frequency spectrum
- **Tech Stack:** WebAudio API, granular scheduling, Canvas 2D
- **Next Steps:**
  - Sample import for custom textures
  - Pattern save/load
  - Multi-track recording

---

## 🚀 Future Experiments - New Concepts

### A) Telegraph Network
- **Concept:** Multi-user Morse code communication hub with authentic telegraph key simulation
- **Features:**
  - Realistic telegraph key physics and sound
  - Global message board with decode challenges
  - Historical cipher modes (Playfair, Vigenère)
  - Achievements for speed and accuracy
- **Tech:** WebSockets, WebAudio, Spring physics simulation

### B) Orrery Constructor
- **Concept:** Build and animate custom planetary gear systems modeling celestial mechanics
- **Features:**
  - Drag-and-drop planetary gear assembly
  - Accurate gear ratios for real solar system
  - Time control and date prediction
  - Brass and copper material rendering
- **Tech:** WebGL/Three.js, astronomical calculations, physics engine

### C) Phonograph Synthesizer
- **Concept:** Virtual wax cylinder recorder with groove visualization and playback effects
- **Features:**
  - "Carve" audio into virtual wax with realistic physics
  - Needle tracking and wear simulation
  - Speed/pressure effects on playback
  - Share cylinders as encoded URLs
- **Tech:** WebAudio, WebGL for groove rendering, physics simulation

### D) Difference Engine
- **Concept:** Interactive Babbage-inspired mechanical calculator with visible gear operations
- **Features:**
  - Step-by-step mechanical calculation visualization
  - Program cards for different operations
  - Error propagation demonstration
  - Historical algorithm examples
- **Tech:** SVG animation, finite state machines, Canvas 2D

### E) Pneumatic Orchestra
- **Concept:** Air-powered instrument ensemble controlled by pressure valves and pipes
- **Features:**
  - Multiple instruments: calliope, pipe organ, steam whistle
  - Visual air flow through transparent pipes
  - Pressure-based expression control
  - MIDI export of compositions
- **Tech:** WebAudio, particle systems for air flow, Canvas/WebGL

### F) Galvanometer Lab
- **Concept:** Electromagnetic experiment sandbox with coils, magnets, and measurement devices
- **Features:**
  - Build circuits with period-accurate components
  - Visualize magnetic fields and current flow
  - Historical experiments (Faraday, Maxwell)
  - Generate actual waveforms via induction simulation
- **Tech:** WebGL for field visualization, circuit simulation engine

### G) Kinetic Sculpture Studio
- **Concept:** Design and animate Rube Goldberg-style contraptions with brass mechanisms
- **Features:**
  - Component library: gears, cams, springs, pendulums
  - Physics-based animation
  - Chain reaction editor
  - Export as looping video or blueprints
- **Tech:** Matter.js or custom physics, WebGL rendering

### H) Steam Pressure Dashboard
- **Concept:** Industrial control panel simulator with gauges, valves, and safety systems
- **Features:**
  - Interconnected pressure systems
  - Crisis scenarios requiring quick action
  - Realistic gauge needle physics
  - Leaderboard for efficiency scores
- **Tech:** Canvas 2D, state machines, real-time simulation

---

## 📋 Technical Standards

### Visual Design
- Bronze/brass color palette (#b07f45 to #523b20)
- Parchment backgrounds with subtle aging
- Rivet corners and mechanical frames
- Consistent use of period-appropriate fonts

### Export Formats
- **SVG:** Vector graphics for mechanical drawings
- **PNG:** Raster images with consistent DPR handling
- **WAV:** Audio exports at 44.1kHz/16-bit minimum
- **JSON:** Parameter saves with version tags

### Performance Targets
- 60 FPS for all animations
- < 3 second initial load
- Mobile-responsive controls
- Graceful WebGL fallbacks

### Sharing Features
- URL-encoded parameters for all experiments
- Social media preview cards
- Embed codes for external sites
- QR codes for mobile sharing

---

## 🎯 Development Priorities

**Q1 2024:**
1. Polish existing experiments based on user feedback
2. Implement Telegraph Network (high engagement potential)
3. Add export features to all current experiments

**Q2 2024:**
1. Launch Orrery Constructor
2. Create unified preset/sharing system
3. Mobile app considerations

**Future:**
- Community gallery for shared creations
- Educational partnerships for historical content
- Physical installation opportunities

---

*This document is actively maintained. Check commit history for latest updates.*