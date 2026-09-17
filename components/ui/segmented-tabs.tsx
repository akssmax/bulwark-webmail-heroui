"use client";

import { Tabs } from "@heroui/react";
import { cn } from "@/lib/utils";

export type SegmentedTabOption = {
  value: string;
  label: string;
};

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
  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => {
        if (key == null) return;
        onChange(String(key));
      }}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={cn("w-fit max-w-full", className)}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-labelledby={ariaLabelledBy} aria-label={ariaLabel}>
          {options.map((option, index) => (
            <Tabs.Tab key={option.value} id={option.value} className="whitespace-nowrap">
              {index > 0 ? <Tabs.Separator /> : null}
              {option.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
