"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export function PanelHost({ panelName }: { panelName: string }) {
  const PanelComponent = useMemo(
    () =>
      dynamic(
        () =>
          import(`./panels/${panelName}`).then((mod) => ({
            default: mod[panelName] || mod.default,
          })),
        {
          ssr: false,
          loading: () => (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="h-48 rounded bg-gradient-to-br from-amber-100/40 to-amber-100/10 ring-1 ring-inset ring-bronze-700/30 animate-pulse" />
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">Loading experiment...</p>
            </div>
          ),
        },
      ),
    [panelName],
  );

  return <PanelComponent />;
}
