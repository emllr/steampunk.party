import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-60 shadow-[inset_0_0_6px_rgba(0,0,0,0.12),0_6px_14px_-8px_rgba(0,0,0,0.45)]",
  {
    variants: {
      variant: {
        default:
          "border border-bronze-700/40 bg-gradient-to-b from-[var(--secondary)]/80 to-[var(--primary)]/30 text-[var(--foreground)] hover:from-[color-mix(in_oklch,var(--secondary)_90%,transparent)] hover:to-[color-mix(in_oklch,var(--primary)_45%,transparent)]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]",
        ghost: "bg-transparent hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)] text-[var(--foreground)]",
        link: "text-[var(--foreground)] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
