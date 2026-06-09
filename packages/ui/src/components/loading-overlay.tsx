'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '../lib/utils';

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, label = 'Cargando…', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

export { LoadingOverlay };
