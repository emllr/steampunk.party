export const metadata = {
  title: "About — Steampunk Party",
  description: "Ethos, tools, and credits powering the workshop at steampunk.party",
};

export default function AboutPage() {
  return (
    <section className="prose prose-zinc max-w-3xl">
      <h1 className="font-display text-4xl text-bronze-900">About</h1>
      <p className="mt-2 text-bronze-800/90">
        Steampunk Party is a living workshop: a place to experiment with graphics, UI, audio, and
        small web apps. Expect polished brass and rough edges alike.
      </p>

      <h2 className="font-display mt-8 text-2xl text-bronze-900">Stack</h2>
      <ul className="mt-2 list-disc pl-6 text-bronze-800/90">
        <li>Next.js App Router</li>
        <li>Tailwind CSS v4 with CSS-in-CSS theme tokens</li>
        <li>TypeScript</li>
        <li>Planned: shadcn/ui components with a custom steampunk theme</li>
      </ul>

      <h2 className="font-display mt-8 text-2xl text-bronze-900">Design Notes</h2>
      <p className="text-bronze-800/90">
        The visual style leans into copper/bronze tones, parchment backdrops, and ornamental shadows.
        Texture is subtle to keep performance snappy and content readable.
      </p>

      <h2 className="font-display mt-8 text-2xl text-bronze-900">Credits</h2>
      <p className="text-bronze-800/90">
        Built with open-source tools and a fondness for whirring gears. Icons via lucide-react when applicable.
      </p>
    </section>
  );
}
