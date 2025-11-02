"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, FlaskConical, Github } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AnimatedLogo } from "@/components/site/animated-logo";

const links = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/about", label: "About", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-bronze-600/40 bg-bronze-50/50 backdrop-blur supports-[backdrop-filter]:bg-bronze-50/30 dark:border-bronze-700/20 dark:bg-bronze-900/50">
      <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center transition-transform hover:scale-105">
          <AnimatedLogo className="h-8 w-auto sm:h-10" />
        </Link>

        <nav className="flex items-center gap-0 text-bronze-800 sm:gap-1 dark:text-bronze-200">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm transition-colors sm:px-3 sm:py-2 sm:text-base",
                  active 
                    ? "bg-bronze-100/60 text-bronze-950 dark:bg-bronze-800/40 dark:text-bronze-50" 
                    : "hover:text-bronze-950 dark:hover:text-bronze-50"
                )}
              >
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Icon className="size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label === "Experiments" ? "Labs" : label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="sm:hidden">
            <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
