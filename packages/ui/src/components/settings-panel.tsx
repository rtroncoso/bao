import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  GameOverlayPanel,
  gameOverlayPanelClassName,
} from "./game-overlay-panel";

export interface SettingsPanelProps {
  id?: string;
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const gameOverlayTriggerClassName = (iconOnly = false) =>
  cn(
    gameOverlayPanelClassName(false),
    "inline-flex items-center justify-center rounded-md border border-black/10 text-white/90",
    "hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    "dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20",
    iconOnly
      ? "h-9 w-9"
      : "h-8 px-3 text-xs font-medium uppercase tracking-wide"
  );

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  id,
  title,
  open,
  onClose,
  children,
  footer,
  className,
}) => {
  if (!open) {
    return null;
  }

  return (
    <GameOverlayPanel
      id={id}
      active
      className={cn("w-64 p-4", className)}
      role="dialog"
      aria-label={title}
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-white/90">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/10 hover:text-white"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">{children}</div>
      {footer}
    </GameOverlayPanel>
  );
};
