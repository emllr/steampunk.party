import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leadingIcon, trailingIcon, type = "text", ...props }, ref) => {
    return (
      <div
        className={cn(
          "group relative flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]",
          "shadow-[inset_0_0_6px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-transparent focus-within:ring-[var(--ring)]",
          className
        )}
      >
        {leadingIcon ? (
          <span className="pointer-events-none ml-3 text-[var(--muted-foreground)]">{leadingIcon}</span>
        ) : null}
        <input
          type={type}
          className={cn(
            "w-full bg-transparent px-3 py-2 outline-none placeholder:text-[color-mix(in_oklch,var(--foreground)_45%,transparent)]",
            leadingIcon && "pl-2",
            trailingIcon && "pr-2"
          )}
          ref={ref}
          {...props}
        />
        {trailingIcon ? <span className="mr-3 text-[var(--muted-foreground)]">{trailingIcon}</span> : null}
      </div>
    );
  }
);
Input.displayName = "Input";
