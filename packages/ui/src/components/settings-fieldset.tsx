import * as React from "react";

import { cn } from "../lib/utils";

export interface SettingsFieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: string;
}

export const SettingsFieldset = React.forwardRef<
  HTMLFieldSetElement,
  SettingsFieldsetProps
>(({ legend, className, children, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4 border border-white/10 p-3", className)}
    {...props}
  >
    <legend className="px-1 text-xs uppercase tracking-wide text-white/70">
      {legend}
    </legend>
    {children}
  </fieldset>
));
SettingsFieldset.displayName = "SettingsFieldset";
