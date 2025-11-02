import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Steampunk Party",
  description: "Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.",
  metadataBase: new URL("https://steampunk.party"),
  keywords: ["steampunk", "experiments", "webgl", "creative coding", "interactive", "brass", "gears"],
  authors: [{ name: "Steampunk Party" }],
  creator: "Steampunk Party",
  openGraph: {
    title: "Steampunk Party",
    description: "Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.",
    url: "https://steampunk.party",
    siteName: "Steampunk Party",
    images: [
      {
        url: "/images/logo/seal-large.png",
        width: 1024,
        height: 1024,
        // width: 1200,
        // height: 630,
        alt: "Steampunk Party - A workshop of digital contraptions",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steampunk Party",
    description: "Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.",
    images: ["/images/logo/seal-large.png"],
    creator: "@steampunkparty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://steampunk.party",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/images/favicon/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome",
        url: "/images/favicon/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome",
        url: "/images/favicon/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Steampunk Party",
              "description": "Random experiments and curious contraptions. Where copper meets code, and gears meet glyphs.",
              "url": "https://steampunk.party",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://steampunk.party/experiments?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-parchment text-bronze-900 selection:bg-bronze-300/40">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="gears-background pointer-events-none fixed inset-0 -z-10 opacity-15" aria-hidden />
          <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
            <Navbar />
            <main className="container mx-auto flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
