"use client";

import Link from "next/link";
import Image from 'next/image'
import { Button } from "@/components/ui/button";
import { Compass, FlaskConical, Github } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/about", label: "About", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-bronze-600/40 bg-bronze-50/50 backdrop-blur supports-[backdrop-filter]:bg-bronze-50/30">
      <div className="container mx-auto flex items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-xl tracking-wide text-bronze-900">
          <Image src={`/images/logo/text.png`} alt="Steam Punk Party" width="300" height="64" />
        </Link>

        <nav className="flex items-center gap-1 text-bronze-800">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 transition-colors",
                  active ? "bg-bronze-100/60 text-bronze-950" : "hover:text-bronze-950"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-4" />
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
