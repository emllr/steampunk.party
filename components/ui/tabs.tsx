"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextType = {
  value: string;
  setValue: (val: string) => void;
};
const TabsContext = React.createContext<TabsContextType | null>(null);

export function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;

  const setValue = React.useCallback(
    (val: string) => {
      if (!isControlled) setUncontrolled(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1",
        "shadow-[inset_0_0_6px_rgba(0,0,0,0.08)]"
      , className)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active, setValue } = useTabs();
  const selected = active === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        selected
          ? "bg-[color-mix(in_oklch,var(--primary)_20%,transparent)] text-[var(--foreground)]"
          : "hover:bg-[color-mix(in_oklch,var(--foreground)_10%,transparent)] text-[var(--foreground)]",
        className
      )}
      aria-selected={selected}
      role="tab"
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active } = useTabs();
  if (active !== value) return null;
  return (
    <div
      className={cn(
        "mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--foreground)]",
        "shadow-[inset_0_0_8px_rgba(0,0,0,0.08)]",
        className
      )}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
