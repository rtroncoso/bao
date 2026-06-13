import * as React from "react";

import { cn } from "../lib/utils";

export interface SettingsActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const SettingsAction = React.forwardRef<
  HTMLButtonElement,
  SettingsActionProps
>(({ className, type = "button", variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "w-full px-3 py-2 text-left text-xs font-medium",
      variant === "outline"
        ? "border border-white/50 bg-transparent text-white hover:bg-white/10"
        : "bg-black/30 text-white/90 hover:bg-black/50",
      "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
SettingsAction.displayName = "SettingsAction";
