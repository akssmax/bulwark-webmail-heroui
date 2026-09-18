"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover } from "@heroui/react";
import { cn } from "@/lib/utils";
import {
  GRAY_PALETTES,
  getGrayPalette,
  type GrayPaletteId,
} from "@/lib/theme/gray-palettes";

export function NeutralPalettePicker({
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Neutral gray palette",
}: {
  value: GrayPaletteId | null;
  onChange: (id: GrayPaletteId) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="radiogroup" aria-label={ariaLabel}>
      {GRAY_PALETTES.map((palette) => {
        const selected = value === palette.id;
        return (
          <button
            key={palette.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={`${palette.label} — ${palette.description}`}
            onClick={() => onChange(palette.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-surface hover:bg-default",
            )}
          >
            <span className="flex overflow-hidden rounded-md border border-border/60">
              <span
                className="h-5 w-5"
                style={{ backgroundColor: palette.backgroundLight }}
                aria-hidden
              />
              <span
                className="h-5 w-5"
                style={{ backgroundColor: palette.backgroundDark }}
                aria-hidden
              />
            </span>
            <span className="text-xs font-medium text-foreground">{palette.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Compact trigger + popover — matches HeroUI customizer dropdowns. */
export function NeutralPaletteSelect({
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Neutral gray palette",
}: {
  value: GrayPaletteId | null;
  onChange: (id: GrayPaletteId) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const selected = getGrayPalette(value ?? "neutral");
  const [open, setOpen] = useState(false);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-8 min-h-8 w-full min-w-[8.5rem] cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-2.5 text-sm",
          "hover:bg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <span className="flex overflow-hidden rounded-md border border-border/60">
          <span className="h-4 w-4" style={{ backgroundColor: selected.backgroundLight }} aria-hidden />
          <span className="h-4 w-4" style={{ backgroundColor: selected.backgroundDark }} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{selected.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Popover.Trigger>
      <Popover.Content placement="top start" offset={8} className="w-56 p-2">
        <Popover.Dialog>
          <Popover.Heading className="px-1 pb-2 text-xs font-medium text-muted-foreground">
            Gray
          </Popover.Heading>
          <NeutralPalettePicker
            value={value}
            onChange={(id) => {
              onChange(id);
              setOpen(false);
            }}
            className="flex-col gap-1 [&>button]:w-full"
          />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function GrayPaletteScale({ paletteId }: { paletteId: GrayPaletteId }) {
  const palette = GRAY_PALETTES.find((item) => item.id === paletteId)!;
  const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{palette.label}</p>
        <p className="text-xs text-muted-foreground">{palette.description}</p>
      </div>
      <div className="flex gap-1">
        {shades.map((shade) => (
          <div key={shade} className="min-w-0 flex-1">
            <div
              className="h-10 rounded-md border border-border/50"
              style={{ backgroundColor: palette.swatches[shade] }}
            />
            <p className="mt-1 truncate text-center text-xs text-muted-foreground">{shade}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
