import * as React from "react";

import { cn } from "../lib/utils";

export interface GameOverlayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GameOverlayInput = React.forwardRef<
  HTMLInputElement,
  GameOverlayInputProps
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "w-full border-0 bg-black/50 px-2 py-1 text-xs text-white placeholder:text-white/40",
      "focus:bg-black/70 focus:outline-none focus:ring-0",
      className
    )}
    {...props}
  />
));
GameOverlayInput.displayName = "GameOverlayInput";
