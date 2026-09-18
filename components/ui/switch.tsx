"use client";

import { Switch as HeroSwitch } from "@heroui/react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  "data-testid"?: string;
}

export function Switch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  "data-testid": testId,
}: SwitchProps) {
  return (
    <HeroSwitch
      isSelected={checked}
      onChange={onChange}
      isDisabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
      data-testid={testId}
      className={cn(className)}
    >
      <HeroSwitch.Content>
        <HeroSwitch.Control>
          <HeroSwitch.Thumb />
        </HeroSwitch.Control>
      </HeroSwitch.Content>
    </HeroSwitch>
  );
}
