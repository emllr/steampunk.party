import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Experiment = {
  slug: string;
  name: string;
  blurb: string;
  content: string;
  panelName?: string; // Name of the exported component (e.g., "BrassNoisePanel")
  previewName?: string; // Name of the preview component
};

// To add a new experiment, simply add an entry here with panelName matching your component export
const experiments: Record<string, Experiment> = {
  "brass-noise": {
    slug: "brass-noise",
    name: "Brass Noise",
    blurb: "Procedural sound tinkering in a copper tube.",
    content:
      "Brownian and Perlin-like noise excited into a simple resonator bank to emulate a warm brass timbre. Use the controls to tweak color and damping.",
    panelName: "BrassNoisePanel",
    previewName: "BrassNoisePreview"
  },
  "smoke-sim": {
    slug: "smoke-sim",
    name: "Smoke Sim",
    blurb: "GPU particles and volumetric fog for dramatic reveals.",
    content:
      "A WebGL2/compute-inspired particle solver with curl noise advection. The fog is rendered via ray-marched billboards.",
    panelName: "SmokeSimPanel",
    previewName: "SmokeSimPreview"
  },
  "chrono-plot": {
    slug: "chrono-plot",
    name: "Chrono Plot",
    blurb: "Time-series plotter with ornamental axes.",
    content:
      "Declarative plotting with a focus on legibility and ornamental ticks. Supports streaming data with windowed statistics.",
    panelName: "ChronoPlotPanel",
    previewName: "ChronoPlotPreview"
  },
  "gear-lattice": {
    slug: "gear-lattice",
    name: "Gear Lattice",
    blurb: "Parametric gears and lattices with SVG.",
    content:
      "Parametric involute gears assembled into lattices. Export to SVG for laser cutting and decorative overlays.",
    panelName: "GearLatticePanel",
    previewName: "GearLatticePreview"
  },
  "vacuum-tubes": {
    slug: "vacuum-tubes",
    name: "Vacuum Tubes",
    blurb: "Glowing tubes and oscilloscopes.",
    content:
      "Simulated triodes with simple transfer curves. An oscilloscope UI visualizes the signal path with glow effects.",
    panelName: "VacuumTubesPanel",
    previewName: "VacuumTubesPreview"
  },
  "clockwork-automata": {
    slug: "clockwork-automata",
    name: "Clockwork Automata",
    blurb: "L-systems drive mechanical diagrams; export SVG or an animated frame strip.",
    content:
      "L-systems drive mechanical diagrams. Tune rules, angle, and step; render as rods/gears; export SVG or a frame strip.",
    panelName: "ClockworkAutomataPanel",
    previewName: "ClockworkAutomataPreview"
  },
  "aether-synth": {
    slug: "aether-synth",
    name: "Aether Synth",
    blurb: "Granular texture generator with bronze-themed mixer and pads.",
    content:
      "A granular texture generator. Tap pads to seed the aether; tweak rate, density, grain length, and spread. Bronze-themed mixer UI.",
    panelName: "AetherSynthPanel",
    previewName: "AetherSynthPreview"
  },
  "orrery-constructor": {
    slug: "orrery-constructor",
    name: "Orrery Constructor",
    blurb: "Build planetary gear systems with accurate astronomical ratios.",
    content:
      "Assemble custom planetary gear trains modeling real celestial mechanics. Features accurate gear ratios, time control, and brass rendering.",
    panelName: "OrreryConstructorPanel",
    previewName: "OrreryConstructorPreview"
  }
};

export async function generateStaticParams() {
  return Object.keys(experiments).map((slug) => ({ slug }));
}

export const dynamicParams = true;

// Dynamic panel loader
function getPanelComponent(slug: string, panelName?: string) {
  if (!panelName) return null;

  // Create a dynamic import for the panel
  return dynamic(
    () => import(`./panels/${panelName}`).then(mod => {
      // Try to get the named export, fallback to default
      return { default: mod[panelName] || mod.default };
    }),
    {
      ssr: false,
      loading: () => (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="h-48 rounded bg-gradient-to-br from-amber-200/40 to-amber-300/20 ring-1 ring-inset ring-bronze-700/30 animate-pulse" />
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Loading experiment...</p>
        </div>
      )
    }
  );
}

export default function ExperimentPage({ params }: { params: { slug: string } }) {
  const exp = experiments[params.slug];
  if (!exp) return notFound();

  // Dynamically get the panel component
  const PanelComponent = exp.panelName ? getPanelComponent(exp.slug, exp.panelName) : null;

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-xl border border-bronze-700/40 bg-gradient-to-br from-amber-50/70 via-amber-100/40 to-amber-200/30 p-4 sm:rounded-2xl sm:p-6 shadow-[inset_0_0_14px_rgba(0,0,0,0.12),0_16px_28px_-16px_rgba(0,0,0,0.45)] dark:border-bronze-700/20 dark:from-bronze-900/30 dark:via-bronze-800/20 dark:to-bronze-900/10">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-bronze-900 dark:text-bronze-100">{exp.name}</h1>
            <Badge variant="brass">Experimental</Badge>
          </div>
          <p className="mt-2 text-[var(--muted-foreground)]">{exp.blurb}</p>

          {PanelComponent ? (
            <PanelComponent />
          ) : (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="h-48 rounded bg-gradient-to-br from-amber-200/40 to-amber-300/20 ring-1 ring-inset ring-bronze-700/30" />
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">{exp.content}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/experiments">Back to Experiments</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

