import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[color-mix(in_oklch,var(--primary)_18%,transparent)] text-[var(--foreground)]",
        secondary:
          "border-[var(--border)] bg-[color-mix(in_oklch,var(--muted)_40%,transparent)] text-[var(--foreground)]",
        outline:
          "border-[var(--border)] text-[var(--foreground)]",
        brass:
          "border-bronze-800/50 bg-gradient-to-b from-amber-200/50 to-amber-400/30 text-bronze-900 shadow-[inset_0_0_6px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
