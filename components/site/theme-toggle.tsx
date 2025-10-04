"use client";

import { useTheme } from "@/components/site/theme-provider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

/**
 * Compact toggle:
 * - Shows current resolved theme (sun for light, moon for dark)
 * - Clicking toggles to the opposite explicit theme (light <-> dark)
 * - If Provider is on "system", it uses resolved value and flips to the opposite explicit theme
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const Icon = resolvedTheme === "dark" ? Sun : Moon;
  const label = resolvedTheme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-bronze-700/40 bg-bronze-50/40 p-2 text-bronze-900 hover:bg-bronze-100/60 transition",
        className
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
