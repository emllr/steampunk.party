import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import * as Previews from "./experiments/previews";

export default function HomePage() {
  return (
    <section className="relative">
      {/* Hero */}
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-xl border border-bronze-700/40 bg-gradient-to-br from-amber-50/70 via-amber-100/40 to-amber-200/30 p-6 sm:rounded-2xl sm:p-8 md:p-12 shadow-[inset_0_0_18px_rgba(0,0,0,0.12),0_24px_48px_-24px_rgba(0,0,0,0.45)] dark:border-bronze-700/20 dark:from-bronze-900/30 dark:via-bronze-800/20 dark:to-bronze-900/10">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-25" aria-hidden>
            {/* Brass gear vignette */}
            <svg className="absolute -top-16 -left-16 h-64 w-64 text-bronze-700/30" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" />
              <g transform="translate(50,50)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect key={i} x="-2" y="-50" width="4" height="10" transform={`rotate(${i * 30})`} />
                ))}
              </g>
            </svg>
            <svg className="absolute -bottom-12 -right-12 h-52 w-52 text-bronze-600/25" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
              <g transform="translate(50,50)">
                {Array.from({ length: 10 }).map((_, i) => (
                  <rect key={i} x="-1.8" y="-44" width="3.6" height="9" transform={`rotate(${i * 36})`} />
                ))}
              </g>
            </svg>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-bronze-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.25)] dark:text-bronze-100 dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]">
            Welcome to the Workshop
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-bronze-700 dark:text-bronze-500/90">
            Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/experiments">Browse Experiments</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/about">About the Workshop</Link>
            </Button>
          </div>
        </div>

        {/* Featured brass frame cards */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-bronze-900 dark:text-bronze-300">Featured</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Aether Synth",
                slug: "aether-synth",
                description: "Granular texture generator with bronze-themed mixer and pads.",
                Preview: Previews.AetherSynthPreview
              },
              {
                title: "Chrono Plot",
                slug: "chrono-plot",
                description: "Real-time data visualization with pan, zoom, and temporal analysis.",
                Preview: Previews.ChronoPlotPreview
              },
              {
                title: "Orrery Constructor",
                slug: "orrery-constructor",
                description: "Build mechanical solar system models with precise orbital mechanics.",
                Preview: Previews.OrreryConstructorPreview
              }
            ].map((experiment) => (
              <Card
                key={experiment.slug}
                className="relative overflow-hidden bg-bronze-50/60 ring-1 ring-inset ring-bronze-700/20 dark:bg-bronze-900/40 dark:ring-bronze-700/30"
              >
                {/* Brass frame with rivets */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 rounded-xl ring-1 ring-bronze-700/30" />
                  {[
                    "left-2 top-2",
                    "right-2 top-2",
                    "left-2 bottom-2",
                    "right-2 bottom-2",
                  ].map((pos, i) => (
                    <span
                      key={i}
                      className={`absolute ${pos} size-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 ring-1 ring-inset ring-bronze-800/50 shadow-[0_1px_1px_rgba(0,0,0,0.25)]`}
                    />
                  ))}
                </div>

                <CardHeader>
                  <CardTitle>{experiment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 rounded bg-gradient-to-br from-amber-200/50 to-amber-300/30 ring-1 ring-inset ring-bronze-700/30 overflow-hidden">
                    <experiment.Preview />
                  </div>
                  <div className="mt-3 text-sm text-bronze-800/90 dark:text-bronze-200">
                    {experiment.description}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm">
                    <Link href={`/experiments/${experiment.slug}`}>Open</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
