import * as React from "react";

import { cn } from "../lib/utils";

export interface SettingsFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SettingsFooter = React.forwardRef<
  HTMLDivElement,
  SettingsFooterProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center border-t border-white/10 pt-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SettingsFooter.displayName = "SettingsFooter";
