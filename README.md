# steampunk.party

Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.

## Tech

- Next.js (App Router)
- Tailwind CSS v4 (no config, CSS-first variables via `@theme`)
- TypeScript
- Planned: shadcn/ui components themed in a steampunk palette

## Develop

- Start dev server on default port (3000):
  ```bash
  npm run dev
  ```
- If 3000 is busy, specify another port:
  ```bash
  npm run dev -- -p 3001
  ```

## Structure

- [`app/layout.tsx`](app/layout.tsx): root layout, header/footer, global styles import
- [`app/globals.css`](app/globals.css): Tailwind v4 import and theme variables (bronze/copper + parchment)
- [`app/page.tsx`](app/page.tsx): landing page
- [`app/experiments/page.tsx`](app/experiments/page.tsx): experiments index

## Tailwind v4 Notes

Tailwind v4 is CSS-first. The theme is defined in [`app/globals.css`](app/globals.css) inside an `@theme` block and CSS variables. Utilities like `bg-parchment` and `text-bronze-900` work because of the color variables we define there.

## Next Steps

- Install shadcn/ui primitives and wire custom theme tokens
- Add reusable components (Button, Card, Navbar, Footer) using shadcn styles
- Add metadata: robots.txt and sitemap
- Create more experiments and micro-apps
