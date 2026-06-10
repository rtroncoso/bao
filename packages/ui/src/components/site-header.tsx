import * as React from "react";

import { cn } from "../lib/utils";

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
}

const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  ({ className, title = "BAO", subtitle, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn("mb-8 flex flex-col items-center text-center", className)}
        {...props}
      >
        <h1 className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </header>
    );
  }
);
SiteHeader.displayName = "SiteHeader";

export { SiteHeader };
