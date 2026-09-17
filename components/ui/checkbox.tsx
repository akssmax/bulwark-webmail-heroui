"use client";

import { useRef, type ReactNode } from "react";
import { Checkbox as HeroCheckbox } from "@heroui/react";
import { cn } from "@/lib/utils";

export function Checkbox({
  isSelected,
  onChange,
  onToggle,
  isIndeterminate = false,
  isDisabled = false,
  hideControl = false,
  children,
  className,
  contentClassName,
  "aria-label": ariaLabel,
}: {
  isSelected: boolean;
  onChange?: (selected: boolean) => void;
  onToggle?: (info: { shiftKey: boolean }) => void;
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  /** Skip the visual box when the content itself is the selection affordance. */
  hideControl?: boolean;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
}) {
  const modifiers = useRef({ shiftKey: false });

  return (
    <HeroCheckbox
      isSelected={isSelected}
      isIndeterminate={isIndeterminate}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={className}
      onChange={(selected) => {
        if (onToggle) {
          onToggle({ shiftKey: modifiers.current.shiftKey });
          modifiers.current.shiftKey = false;
          return;
        }
        onChange?.(selected);
      }}
    >
      <HeroCheckbox.Content
        className={contentClassName}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => {
          event.stopPropagation();
          modifiers.current.shiftKey = event.shiftKey;
        }}
      >
        {!hideControl && (
          <HeroCheckbox.Control>
            <HeroCheckbox.Indicator />
          </HeroCheckbox.Control>
        )}
        {children}
      </HeroCheckbox.Content>
    </HeroCheckbox>
  );
}
