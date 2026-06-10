"use client";

import * as React from "react";

import { cn } from "../lib/utils";

export interface SelectableOptionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const SelectableOption = React.forwardRef<
  HTMLButtonElement,
  SelectableOptionProps
>(
  (
    { className, selected = false, children, type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
          "hover:border-primary/40 hover:bg-accent/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          selected
            ? "border-primary bg-accent text-accent-foreground shadow-sm"
            : "border-border bg-card text-card-foreground",
          className
        )}
        aria-pressed={selected}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SelectableOption.displayName = "SelectableOption";

export { SelectableOption };
