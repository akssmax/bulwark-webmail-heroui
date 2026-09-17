"use client";

import type { ReactNode } from "react";
import { Tooltip as HeroTooltip } from "@heroui/react";

/** Short hover delay so labels don’t flash, but still feel snappy. */
export const TOOLTIP_DELAY_MS = 350;

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content?: ReactNode;
  children: ReactNode;
  delay?: number;
  placement?: TooltipPlacement;
  isDisabled?: boolean;
}

export function Tooltip({
  content,
  children,
  delay = TOOLTIP_DELAY_MS,
  placement = "right",
  isDisabled = false,
}: TooltipProps) {
  if (content == null || content === "") {
    return <>{children}</>;
  }

  return (
    <HeroTooltip delay={delay} isDisabled={isDisabled}>
      <HeroTooltip.Trigger className="inline-flex max-w-full" role="presentation" tabIndex={-1}>
        {children}
      </HeroTooltip.Trigger>
      <HeroTooltip.Content placement={placement}>{content}</HeroTooltip.Content>
    </HeroTooltip>
  );
}
