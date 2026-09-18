"use client";

import * as React from "react";
import { Button as HeroButton } from "@heroui/react";
import type { PressEvent } from "react-aria-components";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
  /** Tooltip label. Inherits `title` (any size) or `aria-label` (icon-only) when omitted. Pass `false` to disable. */
  tooltip?: React.ReactNode | false;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}

const VARIANT_MAP = {
  default: "primary",
  ghost: "ghost",
  outline: "outline",
  destructive: "danger",
  secondary: "secondary",
} as const;

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    }
  };
}

function resolveButtonElement(
  event: PressEvent,
  buttonRef: React.RefObject<HTMLButtonElement | null>,
): HTMLButtonElement {
  if (buttonRef.current) return buttonRef.current;
  const target = event.target as HTMLElement;
  return (
    (target.closest("button,[data-slot='button']") as HTMLButtonElement | null) ??
    (target as HTMLButtonElement)
  );
}

function bridgeOnClick(
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined,
  buttonRef: React.RefObject<HTMLButtonElement | null>,
) {
  if (!onClick) return undefined;
  return (event: PressEvent) => {
    const currentTarget = resolveButtonElement(event, buttonRef);
    onClick({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget,
      target: event.target,
    } as unknown as React.MouseEvent<HTMLButtonElement>);
  };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      disabled,
      onClick,
      children,
      type = "button",
      title,
      tooltip,
      tooltipPlacement = "bottom",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const heroSize = size === "icon" ? "sm" : size;
    const tooltipDisabled = tooltip === false;
    const tooltipContent = tooltipDisabled
      ? undefined
      : tooltip ??
        (typeof title === "string" && title.length > 0
          ? title
          : size === "icon"
            ? ariaLabel
            : undefined);
    const button = (
      <HeroButton
        ref={mergeRefs(ref, buttonRef)}
        type={type}
        variant={VARIANT_MAP[variant]}
        size={heroSize}
        isIconOnly={size === "icon"}
        isDisabled={disabled}
        className={cn(className)}
        onPress={bridgeOnClick(onClick, buttonRef)}
        aria-label={ariaLabel ?? (size === "icon" && typeof title === "string" ? title : undefined)}
        {...(props as React.ComponentPropsWithoutRef<typeof HeroButton>)}
      >
        {children}
      </HeroButton>
    );

    if (tooltipContent) {
      return (
        <Tooltip content={tooltipContent} placement={tooltipPlacement}>
          {button}
        </Tooltip>
      );
    }

    return button;
  },
);
Button.displayName = "Button";

export { Button };
