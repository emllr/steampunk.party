# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting

## Architecture Overview

This is a Next.js 14 application using the App Router with a steampunk-themed interactive experiments playground.

### Core Stack
- **Next.js 14.2.15** with App Router
- **Tailwind CSS v4** - CSS-first approach with `@theme` blocks
- **shadcn/ui** - Themed UI components in `/components/ui/`
- **TypeScript** - Strict mode enabled
- **React 18.3.1**

### Key Architectural Patterns

**Experiments System**: Dynamic plugin-like architecture at `/experiments/[slug]`
- Each experiment is a standalone component in `/app/experiments/[slug]/panels/`
- Loaded with `next/dynamic` and SSR disabled for client-side rendering
- Common pattern: Canvas/WebGL rendering with requestAnimationFrame loops
- Controls use refs for performance (see `controlsRef` pattern in experiments)

**Styling Approach**:
- Bronze color palette defined in globals.css (`--bronze-50` through `--bronze-900`)
- Components use `cn()` utility from `/lib/utils` for conditional classes
- Dark mode supported via CSS variables and next-themes

**Performance Patterns**:
- WebGL/Canvas experiments store GL contexts and resources in refs
- Control values passed to render loops via `controlsRef.current` to avoid stale closures
- Uniform locations cached in `uniformsRef` for WebGL shaders
- Device pixel ratio awareness for high-DPI displays

### Project Structure

- `/app/experiments/[slug]/` - Dynamic routing for experiments
- `/app/experiments/[slug]/panels/` - Experiment UI components (e.g., SmokeSimPanel.tsx)
- `/components/ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `/components/site/` - Site-specific components (Navbar, Footer, ThemeProvider)

### Current Experiments

- **Brass Noise** - Audio synthesis with resonator banks
- **Smoke Sim** - WebGL2 particle system with curl noise turbulence
- **Chrono Plot** - Real-time data visualization with pan/zoom
- **Gear Lattice** - Parametric gear generator
- **Vacuum Tubes** - Tube amplifier simulation

### Adding New Experiments

1. Create new folder at `/app/experiments/[experiment-name]/`
2. Add `page.tsx` with experiment metadata and dynamic import
3. Create panel component in `/panels/` subfolder
4. Follow existing patterns for WebGL/Canvas setup and control binding

### WebGL Shader Development Notes

When working with WebGL shaders in experiments:
- Always check shader compilation with proper error logging
- Use the `controlsRef` pattern to pass updated values to render loops
- Store uniform locations in `uniformsRef` for performance
- Clear canvas with `gl.clearColor(0, 0, 0, 0)` for transparency
- Initialize `startTS.current` in useEffect for proper time tracking