import * as React from "react";

import { cn } from "../lib/utils";

export interface GameOverlayPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Brighter panel when active (e.g. chat focused). */
  active?: boolean;
}

export const gameOverlayPanelClassName = (active = false) =>
  cn(
    "bg-black/40 text-white shadow-sm backdrop-blur-[2px] transition-[background-color] duration-150",
    active && "bg-black/80"
  );

export const GameOverlayPanel = React.forwardRef<
  HTMLDivElement,
  GameOverlayPanelProps
>(({ active = false, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(gameOverlayPanelClassName(active), className)}
    {...props}
  />
));
GameOverlayPanel.displayName = "GameOverlayPanel";
