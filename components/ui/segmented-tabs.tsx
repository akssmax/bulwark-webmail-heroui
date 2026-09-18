"use client";

import { Tabs } from "@heroui/react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type SegmentedTabOption = {
  value: string;
  label: string;
  /** Optional hover hint (e.g. keyboard shortcut). */
  hint?: string;
};

function clearStuckIndicatorInlineStyles(root: HTMLElement) {
  const indicator = root.querySelector<HTMLElement>(
    '[data-selected="true"] [data-slot="tabs-indicator"], [data-selected="true"] .tabs__indicator',
  );
  if (!indicator) return;
  indicator.style.translate = "";
  indicator.style.width = "";
  indicator.style.height = "";
}

export function SegmentedTabs({
  value,
  onChange,
  options,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly SegmentedTabOption[];
  "aria-labelledby"?: string;
  "aria-label"?: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // RAC SelectionIndicator snapshots the first tab on mount, then writes a
  // leftover `translate` onto the controlled selected tab. Retry a few times
  // so we clear it after that snapshot lands, without interrupting later clicks.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ids = [0, 32, 80, 160].map((ms) =>
      window.setTimeout(() => clearStuckIndicatorInlineStyles(root), ms),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <div ref={rootRef} className={cn("w-fit max-w-full", className)}>
      <Tabs
        selectedKey={value}
        onSelectionChange={(key) => {
          if (key == null) return;
          onChange(String(key));
        }}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        className="w-fit max-w-full"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-labelledby={ariaLabelledBy} aria-label={ariaLabel}>
            {options.map((option, index) => (
              <Tabs.Tab
                key={option.value}
                id={option.value}
                className="whitespace-nowrap"
              >
                {index > 0 ? <Tabs.Separator /> : null}
                <span title={option.hint}>{option.label}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}
