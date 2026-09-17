"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type SelectableAvatarProps = ComponentProps<typeof Avatar> & {
  /** Whether the underlying message/thread is currently selected. */
  checked: boolean;
  /**
   * Toggle selection. The wrapper stops propagation so the row is not opened.
   * Receives the click event so callers can honour shift-click range selection.
   */
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the selection control. */
  selectLabel?: string;
};

/**
 * Avatar that doubles as a selection control, Thunderbird-style: clicking the
 * avatar toggles the message/thread into the current selection instead of
 * opening it. A check overlay appears on hover (hinting it is clickable) and
 * stays visible while the row is selected.
 */
export function SelectableAvatar({
  checked,
  onToggle,
  selectLabel,
  className,
  ...avatarProps
}: SelectableAvatarProps) {
  return (
    <div className={cn("group/select relative shrink-0 rounded-full", className)}>
      <Avatar {...avatarProps} />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full",
          "bg-primary text-primary-foreground transition-opacity duration-150",
          checked ? "opacity-100" : "opacity-0 group-hover/select:opacity-100",
        )}
      >
        <Check className="h-4 w-4" />
      </span>
      <Checkbox
        isSelected={checked}
        hideControl
        aria-label={selectLabel}
        className="absolute inset-0 z-10 rounded-full"
        contentClassName="h-full w-full rounded-full"
        onToggle={({ shiftKey }) => {
          onToggle({ shiftKey, stopPropagation: () => {} } as MouseEvent<HTMLButtonElement>);
        }}
      />
    </div>
  );
}
