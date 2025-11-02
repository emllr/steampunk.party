import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as Previews from "./previews";

export const metadata = {
  title: "Experiments — Steampunk Party",
  description: "A cabinet of curiosities: prototypes, toys, and odd contraptions.",
};

const experiments = [
  {
    slug: "brass-noise",
    name: "Brass Noise",
    blurb: "Procedural sound tinkering in a copper tube.",
    Preview: Previews.BrassNoisePreview
  },
  {
    slug: "smoke-sim",
    name: "Smoke Sim",
    blurb: "GPU particles and volumetric fog for dramatic reveals.",
    Preview: Previews.SmokeSimPreview
  },
  {
    slug: "chrono-plot",
    name: "Chrono Plot",
    blurb: "Time-series plotter with ornamental axes.",
    Preview: Previews.ChronoPlotPreview
  },
  {
    slug: "gear-lattice",
    name: "Gear Lattice",
    blurb: "Parametric gears and lattices with SVG.",
    Preview: Previews.GearLatticePreview
  },
  {
    slug: "vacuum-tubes",
    name: "Vacuum Tubes",
    blurb: "Glowing tubes and oscilloscopes.",
    Preview: Previews.VacuumTubesPreview
  },
  {
    slug: "clockwork-automata",
    name: "Clockwork Automata",
    blurb: "L-systems drive mechanical diagrams; export SVG or an animated frame strip.",
    Preview: Previews.ClockworkAutomataPreview
  },
  {
    slug: "aether-synth",
    name: "Aether Synth",
    blurb: "Granular texture generator with bronze-themed mixer and pads.",
    Preview: Previews.AetherSynthPreview
  },
  {
    slug: "orrery-constructor",
    name: "Orrery Constructor",
    blurb: "Build planetary gear systems with accurate astronomical ratios.",
    Preview: Previews.OrreryConstructorPreview
  },
];

export default function ExperimentsPage() {
  return (
    <section>
      <h1 className="font-display text-3xl sm:text-4xl text-bronze-800 dark:text-bronze-500">Experiments</h1>
      <p className="mt-2 text-bronze-700 dark:text-bronze-300">
        Works in progress. Expect leaks, clanks, and the occasional puff of steam.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((exp) => (
          <Card key={exp.slug} className="relative overflow-hidden bg-bronze-50/60 ring-1 ring-inset ring-bronze-700/20 dark:bg-bronze-900/40 dark:ring-bronze-700/30">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 rounded-xl ring-1 ring-bronze-700/30" />
              {["left-2 top-2","right-2 top-2","left-2 bottom-2","right-2 bottom-2"].map((pos, i) => (
                <span key={i} className={`absolute ${pos} size-2 rounded-full bg-gradient-to-b from-amber-100 to-amber-800 ring-1 ring-inset ring-bronze-800/50 shadow-[0_1px_1px_rgba(0,0,0,0.25)]`} />
              ))}
            </div>
            <CardHeader>
              <CardTitle>{exp.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded bg-gradient-to-br from-amber-100/40 to-amber-100/10 ring-1 ring-inset ring-bronze-700/30 overflow-hidden">
                <exp.Preview />
              </div>
              <div className="mt-3 text-sm text-bronze-800/90 dark:text-bronze-200">{exp.blurb}</div>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm">
                <Link href={`/experiments/${exp.slug}`}>Open</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
