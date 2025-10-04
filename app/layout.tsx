import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Steampunk Party",
  description: "Random experiments and curious contraptions at steampunk.party",
  metadataBase: new URL("https://steampunk.party"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh bg-parchment text-bronze-900 selection:bg-bronze-300/40">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="gears-background pointer-events-none fixed inset-0 -z-10 opacity-15" aria-hidden />
          <div className="relative flex min-h-dvh flex-col">
            <Navbar />
            <main className="container mx-auto flex-1 px-6 py-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
