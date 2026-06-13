import * as React from "react";

import { cn } from "../../lib/utils";
import { Label } from "./label";

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  showValue?: boolean;
  /** Light labels for dark game overlay panels. */
  variant?: "default" | "overlay";
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      value,
      onValueChange,
      min = 0,
      max = 1,
      step = 0.05,
      showValue = true,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const percent = Math.round(value * 100);
    const overlay = variant === "overlay";

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between gap-3">
          <Label
            htmlFor={fieldId}
            className={cn(
              "text-xs uppercase tracking-wide",
              overlay ? "text-white/90" : undefined
            )}
          >
            {label}
          </Label>
          {showValue && (
            <span
              className={cn(
                "font-mono text-xs",
                overlay ? "text-white/60" : "text-muted-foreground"
              )}
            >
              {percent}%
            </span>
          )}
        </div>
        <input
          ref={ref}
          id={fieldId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) =>
            onValueChange(Number.parseFloat(event.target.value))
          }
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white",
            overlay && "bg-white/15"
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
