import * as React from "react";

import { cn } from "../lib/utils";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
  width?: "sm" | "md" | "lg";
}

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, centered = true, width = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background",
          centered && "flex items-center justify-center p-6",
          className
        )}
        {...props}
      >
        <div className={cn("w-full", widthClasses[width])}>{children}</div>
      </div>
    );
  }
);
PageShell.displayName = "PageShell";

export { PageShell };
